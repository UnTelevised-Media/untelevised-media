/**
 * scripts/repair-brief-keys.ts
 *
 * One-shot repair: patches brief documents and claimedPitch documents whose
 * array items have _key: null (caused by the beat-patrol agent omitting _key
 * fields when creating documents via the Sanity API).
 *
 * Safe to run multiple times — only patches items with null/missing _key.
 *
 * Usage:
 *   pnpm tsx scripts/repair-brief-keys.ts
 *   pnpm tsx scripts/repair-brief-keys.ts --dry-run
 *
 * Requirements:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 *   SANITY_API_WRITE_TOKEN must be set in .env.local
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const DRY_RUN = process.argv.includes('--dry-run');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

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

function makeKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

async function repairBriefs() {
  const briefs = await client.fetch<
    Array<{
      _id: string;
      stories?: Array<{ _key: string | null; links?: Array<{ _key: string | null }> }>;
    }>
  >(`*[_type == "brief"]{ _id, stories[]{ _key, links[]{ _key } } }`);

  console.log(`Found ${briefs.length} brief(s).`);
  let fixed = 0;

  for (const brief of briefs) {
    const stories = brief.stories ?? [];
    const needsRepair = stories.some((s) => !s._key || (s.links ?? []).some((l) => !l._key));
    if (!needsRepair) continue;

    // Fetch full stories array (we need all fields to rewrite it)
    const full = await client.fetch<{
      stories?: Array<
        Record<string, unknown> & {
          _key: string | null;
          links?: Array<Record<string, unknown> & { _key: string | null }>;
        }
      >;
    }>(`*[_type == "brief" && _id == $id][0]{ stories[] }`, { id: brief._id });

    const repairedStories = (full?.stories ?? []).map((s) => ({
      ...s,
      _key: s._key || makeKey(),
      ...(s.links ? { links: s.links.map((l) => ({ ...l, _key: l._key || makeKey() })) } : {}),
    }));

    const nullKeyCount = stories.filter((s) => !s._key).length;
    console.log(
      `  Brief ${brief._id}: ${nullKeyCount}/${stories.length} stories have null _key${DRY_RUN ? ' (dry-run, skipping)' : ''}`
    );

    if (!DRY_RUN) {
      await client.patch(brief._id).set({ stories: repairedStories }).commit();
    }
    fixed++;
  }

  return fixed;
}

async function repairClaimedPitches() {
  const pitches = await client.fetch<
    Array<{
      _id: string;
      links?: Array<{ _key: string | null }>;
    }>
  >(`*[_type == "claimedPitch"]{ _id, links[]{ _key } }`);

  console.log(`Found ${pitches.length} claimedPitch(es).`);
  let fixed = 0;

  for (const pitch of pitches) {
    const links = pitch.links ?? [];
    if (!links.some((l) => !l._key)) continue;

    const full = await client.fetch<{
      links?: Array<Record<string, unknown> & { _key: string | null }>;
    }>(`*[_type == "claimedPitch" && _id == $id][0]{ links[] }`, { id: pitch._id });

    const repairedLinks = (full?.links ?? []).map((l) => ({ ...l, _key: l._key || makeKey() }));

    console.log(
      `  claimedPitch ${pitch._id}: ${links.filter((l) => !l._key).length} link(s) with null _key${DRY_RUN ? ' (dry-run, skipping)' : ''}`
    );

    if (!DRY_RUN) {
      await client.patch(pitch._id).set({ links: repairedLinks }).commit();
    }
    fixed++;
  }

  return fixed;
}

async function main() {
  console.log(`\n=== repair-brief-keys ${DRY_RUN ? '[DRY RUN]' : '[LIVE]'} ===\n`);

  const briefsFixed = await repairBriefs();
  const pitchesFixed = await repairClaimedPitches();

  console.log(
    `\nDone. ${briefsFixed} brief(s) and ${pitchesFixed} claimedPitch(es) ${DRY_RUN ? 'would be' : 'were'} repaired.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
