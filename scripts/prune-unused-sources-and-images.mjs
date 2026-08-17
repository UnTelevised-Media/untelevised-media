#!/usr/bin/env node
/**
 * PRUNE UNUSED SOURCES + IMAGE ASSETS
 *
 * Finds `source` documents that are not referenced by any article, keyEvent,
 * or liveEvent, and `sanity.imageAsset` documents that are not referenced by
 * anything in the dataset at all — then deletes them.
 *
 * Defaults to a dry run: it only prints what it would delete. Pass --execute
 * to actually perform the deletions.
 *
 * Usage:
 *   node scripts/prune-unused-sources-and-images.mjs              # dry run
 *   node scripts/prune-unused-sources-and-images.mjs --execute    # delete for real
 *   node scripts/prune-unused-sources-and-images.mjs --sources-only
 *   node scripts/prune-unused-sources-and-images.mjs --images-only
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(__dirname);

// Load environment from .env.local
const envPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      if (key.trim()) {
        process.env[key.trim()] = value;
      }
    }
  }
}

const args = process.argv.slice(2);
const EXECUTE = args.includes('--execute');
const SOURCES_ONLY = args.includes('--sources-only');
const IMAGES_ONLY = args.includes('--images-only');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-06-04';
const readToken = process.env.SANITY_API_READ_TOKEN;
const writeToken = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET');
  process.exit(1);
}
if (EXECUTE && !writeToken) {
  console.error('Missing SANITY_API_WRITE_TOKEN — required to run with --execute');
  process.exit(1);
}

async function groqQuery(query) {
  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const headers = readToken ? { Authorization: `Bearer ${readToken}` } : {};
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GROQ query failed (${response.status}): ${body}`);
  }
  const json = await response.json();
  return json.result;
}

async function mutate(mutations) {
  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${writeToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutations }),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, status: response.status, body: json };
  }
  return { ok: true, body: json };
}

function stripDrafts(id) {
  return id.startsWith('drafts.') ? id.slice('drafts.'.length) : id;
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCES
// ─────────────────────────────────────────────────────────────────────────────

async function findOrphanedSources() {
  const sources = await groqQuery(
    `*[_type == "source"]{_id, label, type, isAnonymous}`
  );
  const referencingDocs = await groqQuery(
    `*[_type in ["article", "keyEvent", "liveEvent"]]{_id, _type, "sourceRefs": sources[]._ref}`
  );

  const referencedIds = new Set();
  for (const doc of referencingDocs) {
    for (const ref of doc.sourceRefs || []) {
      referencedIds.add(stripDrafts(ref));
    }
  }

  // Group source documents (draft + published variants) by their base id.
  const groups = new Map();
  for (const source of sources) {
    const baseId = stripDrafts(source._id);
    if (!groups.has(baseId)) groups.set(baseId, []);
    groups.get(baseId).push(source);
  }

  const orphanedGroups = [];
  for (const [baseId, docs] of groups) {
    if (!referencedIds.has(baseId)) {
      orphanedGroups.push({ baseId, docs });
    }
  }

  return { totalSources: sources.length, orphanedGroups };
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE ASSETS
// ─────────────────────────────────────────────────────────────────────────────

async function findOrphanedImages() {
  const totalImages = await groqQuery(`count(*[_type == "sanity.imageAsset"])`);
  const orphaned = await groqQuery(
    `*[_type == "sanity.imageAsset" && count(*[references(^._id)]) == 0]{_id, originalFilename, url, size, mimeType}`
  );
  return { totalImages, orphaned };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(1)} ${units[i]}`;
}

async function deleteInBatches(ids, batchSize = 50) {
  const results = { deleted: [], failed: [] };
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const mutations = batch.map((id) => ({ delete: { id } }));
    const result = await mutate(mutations);
    if (result.ok) {
      results.deleted.push(...batch);
    } else {
      // Retry individually so one bad doc doesn't sink the whole batch.
      for (const id of batch) {
        const single = await mutate([{ delete: { id } }]);
        if (single.ok) {
          results.deleted.push(id);
        } else {
          results.failed.push({ id, error: single.body });
        }
      }
    }
  }
  return results;
}

async function main() {
  console.log(`Dataset: ${projectId}/${dataset}`);
  console.log(`Mode: ${EXECUTE ? 'EXECUTE (will delete)' : 'DRY RUN (no changes)'}\n`);

  let orphanedSourceIds = [];
  if (!IMAGES_ONLY) {
    const { totalSources, orphanedGroups } = await findOrphanedSources();
    console.log(`── Sources ──────────────────────────────────────────`);
    console.log(`Total source documents: ${totalSources}`);
    console.log(`Unreferenced (not used by any article/keyEvent/liveEvent): ${orphanedGroups.length}\n`);

    for (const group of orphanedGroups) {
      for (const doc of group.docs) {
        const label = doc.isAnonymous ? '🔒 Anonymous Source' : doc.label || '(no label)';
        console.log(`  - [${doc._id}] ${label} (${doc.type || 'no type'})`);
        orphanedSourceIds.push(doc._id);
      }
    }
    if (orphanedGroups.length === 0) console.log('  (none)');
    console.log();
  }

  let orphanedImageIds = [];
  if (!SOURCES_ONLY) {
    const { totalImages, orphaned } = await findOrphanedImages();
    console.log(`── Image Assets ─────────────────────────────────────`);
    console.log(`Total image assets: ${totalImages}`);
    console.log(`Unreferenced (not used anywhere in the dataset): ${orphaned.length}\n`);

    let totalOrphanedBytes = 0;
    for (const asset of orphaned) {
      totalOrphanedBytes += asset.size || 0;
      console.log(
        `  - [${asset._id}] ${asset.originalFilename || '(no filename)'} — ${formatBytes(asset.size)}`
      );
      orphanedImageIds.push(asset._id);
    }
    if (orphaned.length === 0) console.log('  (none)');
    console.log(`\nTotal reclaimable: ${formatBytes(totalOrphanedBytes)}\n`);
  }

  if (!EXECUTE) {
    console.log('Dry run only — no documents were deleted. Re-run with --execute to delete.');
    return;
  }

  if (orphanedSourceIds.length > 0) {
    console.log(`Deleting ${orphanedSourceIds.length} source document(s)...`);
    const result = await deleteInBatches(orphanedSourceIds);
    console.log(`  Deleted: ${result.deleted.length}`);
    if (result.failed.length > 0) {
      console.log(`  FAILED: ${result.failed.length}`);
      for (const f of result.failed) {
        console.log(`    - ${f.id}: ${JSON.stringify(f.error)}`);
      }
    }
  }

  if (orphanedImageIds.length > 0) {
    console.log(`Deleting ${orphanedImageIds.length} image asset(s)...`);
    const result = await deleteInBatches(orphanedImageIds);
    console.log(`  Deleted: ${result.deleted.length}`);
    if (result.failed.length > 0) {
      console.log(`  FAILED: ${result.failed.length}`);
      for (const f of result.failed) {
        console.log(`    - ${f.id}: ${JSON.stringify(f.error)}`);
      }
    }
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
