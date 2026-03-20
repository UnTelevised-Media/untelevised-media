/**
 * Migration: inline article sources → standalone `source` documents
 *
 * For each article with old-format sources ({ label, url } inline objects),
 * this script:
 *   1. Creates a new `source` document for each entry
 *   2. Patches the article's `sources` field to an array of references
 *   3. Logs a dry-run summary before writing anything
 *
 * Run:  node scripts/migrate-sources.mjs
 * Dry:  node scripts/migrate-sources.mjs --dry-run
 */

import { createClient } from '@sanity/client';

const DRY_RUN = process.argv.includes('--dry-run');

const client = createClient({
  projectId: 'ypejdt32',
  dataset: 'articles',
  apiVersion: '2024-01-01',
  token:
    'skhhJyYQtW9pwQmkAYWIoOcvk5LHynaefsPu6ygqa3AaClORQsWBUEQKTChM9ZsjSnzbNaJnfXHkMPhwwsmko3PlGH0An3Rbq5lQ8i8EvwcGSKpStTpZzExXLkLazrwp0j5n5Kj3QyjHCLlEBe75jqJu8B1DMWrnZ1prUL1fFhLL1QmwBink',
  useCdn: false,
});

// Fetch all articles that still have old-format inline sources
const articles = await client.fetch(
  `*[_type == 'article' && defined(sources) && count(sources[_type == 'object']) > 0]
   | order(_createdAt desc) {
     _id,
     title,
     sources
   }`
);

if (articles.length === 0) {
  console.log('✅ No articles with old-format inline sources found. Nothing to migrate.');
  process.exit(0);
}

console.log(`\nFound ${articles.length} article(s) with inline sources to migrate:\n`);
articles.forEach((a) => console.log(`  • [${a._id}] ${a.title} (${a.sources.length} sources)`));

if (DRY_RUN) {
  console.log('\n⚠️  DRY RUN — no changes will be written.\n');
}

let totalCreated = 0;
let totalPatched = 0;

for (const article of articles) {
  console.log(`\n──────────────────────────────────────────`);
  console.log(`Article: ${article.title}`);
  console.log(`ID:      ${article._id}`);
  console.log(`Sources: ${article.sources.length}`);

  const references = [];

  for (const src of article.sources) {
    // Skip if already a reference (safety guard)
    if (src._type === 'reference') {
      console.log(`  ↩  Already a reference: ${src._ref} — skipping`);
      references.push({ _type: 'reference', _ref: src._ref, _key: src._key });
      continue;
    }

    const sourceDoc = {
      _type: 'source',
      label: src.label ?? 'Untitled Source',
      type: 'other', // Default — editors can update in Studio
      ...(src.url ? { url: src.url } : {}),
      isAnonymous: false,
    };

    console.log(`  + Creating source: "${sourceDoc.label}" ${src.url ? `→ ${src.url}` : '(no URL)'}`);

    if (!DRY_RUN) {
      const created = await client.create(sourceDoc);
      references.push({ _type: 'reference', _ref: created._id, _key: src._key });
      totalCreated++;
    } else {
      // Placeholder ref for dry-run logging
      references.push({ _type: 'reference', _ref: `[new-source-id]`, _key: src._key });
    }
  }

  console.log(`  → Patching article sources to ${references.length} reference(s)…`);

  if (!DRY_RUN) {
    await client
      .patch(article._id)
      .set({ sources: references })
      .commit({ autoGenerateArrayKeys: false });
    totalPatched++;
  }
}

console.log(`\n══════════════════════════════════════════`);
if (DRY_RUN) {
  console.log('DRY RUN complete — no changes written.');
  console.log(`Would create ${articles.flatMap((a) => a.sources).length} source documents.`);
  console.log(`Would patch ${articles.length} articles.`);
} else {
  console.log(`✅ Migration complete.`);
  console.log(`   Source documents created : ${totalCreated}`);
  console.log(`   Articles patched         : ${totalPatched}`);
}
console.log(`══════════════════════════════════════════\n`);
