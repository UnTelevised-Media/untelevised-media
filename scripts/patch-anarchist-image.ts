/**
 * scripts/patch-anarchist-image.ts
 * Patches the Justin King anarchist article with a main image.
 * Run: node_modules/.bin/ts-node --esm scripts/patch-anarchist-image.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-06-04',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN!,
});

const ARTICLE_SLUG = '11-things-every-anarchist-should-be-doing';

// Try multiple image URLs in order until one succeeds
const IMAGE_CANDIDATES = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Anarchy-symbol.svg/1024px-Anarchy-symbol.svg.png',
    filename: 'anarchy-symbol.png',
    contentType: 'image/png',
    alt: 'Anarchist circle-A symbol',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Anarchy-symbol.svg/800px-Anarchy-symbol.svg.png',
    filename: 'anarchy-symbol-800.png',
    contentType: 'image/png',
    alt: 'Anarchist circle-A symbol',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Anarchy-symbol.svg',
    filename: 'anarchy-symbol.svg',
    contentType: 'image/svg+xml',
    alt: 'Anarchist circle-A symbol',
  },
];

async function main() {
  const article = await client.fetch<{ _id: string } | null>(
    `*[_type == "article" && slug.current == $slug][0]{ _id }`,
    { slug: ARTICLE_SLUG }
  );
  if (!article) {
    console.error('Article not found!');
    process.exit(1);
  }
  console.log(`Found article: ${article._id}`);

  let assetId: string | null = null;
  let chosenAlt = '';

  for (const candidate of IMAGE_CANDIDATES) {
    try {
      console.log(`Trying: ${candidate.url}`);
      const res = await fetch(candidate.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`  → HTTP ${res.status} ${res.headers.get('content-type')}`);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const asset = await client.assets.upload('image', buf, {
        filename: candidate.filename,
        contentType: candidate.contentType,
      });
      assetId = asset._id;
      chosenAlt = candidate.alt;
      console.log(`✓ Uploaded: ${assetId}`);
      break;
    } catch (err) {
      console.error(`  ✗ Failed:`, err);
    }
  }

  if (!assetId) {
    console.error('All image candidates failed.');
    process.exit(1);
  }

  await client
    .patch(article._id)
    .set({
      mainImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: assetId },
        alt: chosenAlt,
      },
    })
    .commit();

  console.log(`✓ Article patched with mainImage.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
