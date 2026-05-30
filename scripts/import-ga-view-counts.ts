/**
 * scripts/import-ga-view-counts.ts
 *
 * Seeds Sanity viewCount fields from a Google Analytics CSV export.
 * Expects the standard GA4 "Pages and screens" CSV with columns:
 *   Page path and screen class, Views, Active users, ...
 *
 * Only rows matching /articles/<slug> (single path segment) are imported.
 * Duplicate slug rows (e.g. with/without trailing slash) are summed.
 * Articles under the old /post/ prefix are handled automatically if present.
 *
 * Usage:
 *   npx tsx scripts/import-ga-view-counts.ts                         -- live run
 *   npx tsx scripts/import-ga-view-counts.ts --dry-run               -- preview only
 *   npx tsx scripts/import-ga-view-counts.ts --csv=path/to/file.csv  -- custom CSV path
 *
 * Requirements: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 *               SANITY_API_WRITE_TOKEN in .env.local
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { resolve } from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const DRY_RUN = process.argv.includes('--dry-run');
const CSV_ARG =
  process.argv.find((a) => a.startsWith('--csv='))?.replace('--csv=', '') ??
  'Pages_and_screens_Page_path_and_screen_class.csv';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const token = process.env.SANITY_API_WRITE_TOKEN!;

if (!projectId || !dataset || !token) {
  console.error(
    'Missing env vars: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN'
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-06-04',
  useCdn: false,
  token,
});

// Matches /articles/<slug> and /post/<slug> with optional trailing slash — no sub-paths
const ARTICLE_PATH_RE = /^\/(articles|post|posts)\/([^/?#]+)\/?$/;

function parseCSV(filePath: string): Map<string, number> {
  const raw = fs.readFileSync(resolve(process.cwd(), filePath), 'utf-8');
  const lines = raw.split('\n');

  // Find the header row
  const headerIdx = lines.findIndex((l) => l.startsWith('Page path'));
  if (headerIdx === -1) {
    throw new Error('Could not find header row in CSV');
  }

  const views = new Map<string, number>();

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split on first comma only — path may contain commas in query strings
    const commaIdx = line.indexOf(',');
    if (commaIdx === -1) continue;

    const rawPath = line.slice(0, commaIdx).replace(/^"|"$/g, '').trim();
    const rest = line.slice(commaIdx + 1);
    const viewCount = parseInt(rest.split(',')[0], 10);

    if (isNaN(viewCount) || viewCount <= 0) continue;

    const match = ARTICLE_PATH_RE.exec(rawPath);
    if (!match) continue;

    const slug = match[2];
    // Accumulate — same slug may appear with and without trailing slash
    views.set(slug, (views.get(slug) ?? 0) + viewCount);
  }

  return views;
}

async function main(): Promise<void> {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  Import GA View Counts ${DRY_RUN ? '[DRY RUN]' : '[LIVE]'}`);
  console.log(`${'═'.repeat(60)}\n`);

  const csvPath = CSV_ARG;
  if (!fs.existsSync(resolve(process.cwd(), csvPath))) {
    console.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`Parsing: ${csvPath}`);
  const slugViews = parseCSV(csvPath);
  console.log(`Found ${slugViews.size} unique article slugs in CSV\n`);

  // Fetch all articles from Sanity in one query
  const sanityArticles = await client.fetch<{ _id: string; slug: string; viewCount?: number }[]>(
    `*[_type == "article"] { _id, "slug": slug.current, viewCount }`
  );

  const sanityBySlug = new Map(sanityArticles.map((a) => [a.slug, a]));

  let matched = 0;
  let skipped = 0;
  let notFound = 0;
  const toUpdate: { _id: string; slug: string; newCount: number; oldCount: number }[] = [];

  for (const [slug, gaViews] of slugViews) {
    const article = sanityBySlug.get(slug);
    if (!article) {
      console.log(`  ✗ Not found in Sanity: ${slug}`);
      notFound++;
      continue;
    }
    const oldCount = article.viewCount ?? 0;
    if (oldCount === gaViews) {
      skipped++;
      continue;
    }
    toUpdate.push({ _id: article._id, slug, newCount: gaViews, oldCount });
    matched++;
  }

  console.log(`Matched : ${matched}`);
  console.log(`No-op   : ${skipped} (already correct)`);
  console.log(`Missing : ${notFound} (slug not in Sanity)\n`);

  if (toUpdate.length === 0) {
    console.log('Nothing to update.');
    return;
  }

  console.log(`${DRY_RUN ? '[DRY RUN] Would update' : 'Updating'} ${toUpdate.length} articles:\n`);

  let success = 0;
  for (const { _id, slug, newCount, oldCount } of toUpdate) {
    const label = `${slug} (${oldCount} → ${newCount})`;
    if (DRY_RUN) {
      console.log(`  → ${label}`);
      success++;
      continue;
    }
    try {
      await client.patch(_id).set({ viewCount: newCount }).commit({ visibility: 'async' });
      console.log(`  ✓ ${label}`);
      success++;
    } catch (err) {
      console.error(`  ✗ Failed: ${slug}`, err);
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(
    `  Done. ${success}/${toUpdate.length} articles ${DRY_RUN ? 'previewed' : 'updated'}.`
  );
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
