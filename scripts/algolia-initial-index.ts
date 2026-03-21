/**
 * scripts/algolia-initial-index.ts
 *
 * One-time backfill script: fetches all published articles from Sanity
 * and indexes them in Algolia.
 *
 * Usage:
 *   pnpm algolia:index
 *   # or: npx tsx scripts/algolia-initial-index.ts
 *
 * Requirements:
 *   - ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY, NEXT_PUBLIC_SANITY_PROJECT_ID,
 *     NEXT_PUBLIC_SANITY_DATASET, SANITY_API_READ_TOKEN must be set in .env.local
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local from repo root
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@sanity/client';
import { algoliasearch } from 'algoliasearch';
import { toPlainText } from '@portabletext/toolkit';

import type { AlgoliaArticleRecord } from '../src/lib/algolia/types';

// ── Sanity client ────────────────────────────────────────────────────────────
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-06-04',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

// ── Algolia admin client (NOT importing from src/lib/algolia/client.ts ────────
// That module uses `server-only` which breaks Node scripts.
const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_API_KEY!
);

const ARTICLES_INDEX = 'untele_articles';

// ── GROQ query ────────────────────────────────────────────────────────────────
const QUERY = `
  *[_type == 'article'] | order(publishedAt desc) {
    title, slug, description, body, publishedAt,
    "mainImage": mainImage.asset->url,
    "author": author->name,
    "authorSlug": author->slug.current,
    "categories": categories[]->title,
    "categorySlugs": categories[]->slug.current,
  }
`;

interface SanityArticleDoc {
  title?: string;
  slug?: { current?: string };
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any[];
  publishedAt?: string;
  mainImage?: string;
  author?: string;
  authorSlug?: string;
  categories?: string[];
  categorySlugs?: string[];
}

async function run() {
  console.log('Fetching articles from Sanity…');
  const docs = await sanityClient.fetch<SanityArticleDoc[]>(QUERY);
  console.log(`Found ${docs.length} articles.`);

  if (docs.length === 0) {
    console.log('Nothing to index. Exiting.');
    return;
  }

  const records: AlgoliaArticleRecord[] = docs
    .filter((doc) => Boolean(doc.slug?.current))
    .map((doc) => {
      const bodyText = doc.body ? toPlainText(doc.body).slice(0, 10_000) : '';
      const publishedAt = doc.publishedAt
        ? Math.floor(new Date(doc.publishedAt).getTime() / 1000)
        : 0;

      return {
        objectID: doc.slug!.current!,
        title: doc.title ?? '',
        description: doc.description ?? '',
        bodyText,
        author: doc.author ?? '',
        authorSlug: doc.authorSlug ?? '',
        categories: doc.categories ?? [],
        categorySlugList: doc.categorySlugs ?? [],
        publishedAt,
        imageUrl: doc.mainImage ?? '',
        type: 'article' as const,
      };
    });

  console.log(`Indexing ${records.length} records to Algolia index "${ARTICLES_INDEX}"…`);

  // Algolia v5: saveObjects accepts an array via batch
  await algoliaClient.saveObjects({
    indexName: ARTICLES_INDEX,
    objects: records,
  });

  console.log(`Done! ${records.length} articles indexed successfully.`);
}

run().catch((err) => {
  console.error('Indexing failed:', err);
  process.exit(1);
});
