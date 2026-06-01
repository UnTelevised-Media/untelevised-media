/**
 * scripts/flag-field-reports.ts
 *
 * Finds all articles authored by Salah Akram and sets isFieldReport: true.
 * Also flags any article that already has isFieldReport: true so the run is idempotent.
 *
 * Usage:
 *   npx tsx scripts/flag-field-reports.ts            — live run
 *   npx tsx scripts/flag-field-reports.ts --dry-run  — preview only, no writes
 *
 * Requirements: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 *               SANITY_API_WRITE_TOKEN in .env.local
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const DRY_RUN = process.argv.includes('--dry-run');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const token = process.env.SANITY_API_WRITE_TOKEN!;

if (!projectId || !dataset || !token) {
  console.error(
    'Missing required env vars: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN'
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

async function main(): Promise<void> {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  Flag Field Reports ${DRY_RUN ? '[DRY RUN]' : '[LIVE]'}`);
  console.log(`${'═'.repeat(60)}\n`);

  const articles = await client.fetch<{ _id: string; title: string; isFieldReport?: boolean }[]>(
    `*[_type == "article" && author->name == "Salah Akram"] | order(publishedAt desc) { _id, title, isFieldReport }`
  );

  if (articles.length === 0) {
    console.log('No articles found for author "Salah Akram".');
    console.log('Check the author name matches exactly in Sanity (case-sensitive).');
    return;
  }

  const toFlag = articles.filter((a) => !a.isFieldReport);
  const alreadyFlagged = articles.filter((a) => a.isFieldReport);

  console.log(`Found ${articles.length} article(s) by Salah Akram`);
  console.log(`  Already flagged : ${alreadyFlagged.length}`);
  console.log(`  To flag now     : ${toFlag.length}\n`);

  if (alreadyFlagged.length > 0) {
    console.log('Already flagged:');
    alreadyFlagged.forEach((a) => console.log(`  ✓ ${a.title}`));
    console.log('');
  }

  if (toFlag.length === 0) {
    console.log('Nothing to do — all articles already flagged.');
    return;
  }

  console.log(`${DRY_RUN ? '[DRY RUN] Would flag' : 'Flagging'}:`);

  let success = 0;
  for (const article of toFlag) {
    if (DRY_RUN) {
      console.log(`  → ${article.title}`);
      success++;
      continue;
    }
    try {
      await client.patch(article._id).set({ isFieldReport: true }).commit();
      console.log(`  ✓ ${article.title}`);
      success++;
    } catch (err) {
      console.error(`  ✗ Failed: ${article.title}`, err);
    }
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(
    `  Done. ${success}/${toFlag.length} articles ${DRY_RUN ? 'previewed' : 'flagged'}.`
  );
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
