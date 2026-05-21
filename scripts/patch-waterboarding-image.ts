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

const IMAGE_URL =
  'https://upload.wikimedia.org/wikipedia/commons/4/4f/Oklahoma_Guardsmen_Provide_Security_for_Political_Demonstration_%288835593%29.jpg';
const ARTICLE_SLUG = 'so-i-was-waterboarded';

async function main() {
  const article = await client.fetch<{ _id: string } | null>(
    `*[_type == "article" && slug.current == $slug][0]{ _id }`,
    { slug: ARTICLE_SLUG }
  );
  if (!article) {
    console.error('Article not found');
    process.exit(1);
  }
  console.log(`Found article: ${article._id}`);

  console.log('Downloading image...');
  const res = await fetch(IMAGE_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  console.log(`  ${buf.length} bytes, ${res.headers.get('content-type')}`);

  const asset = await client.assets.upload('image', buf, {
    filename: 'political-demonstration-guard.jpg',
    contentType: 'image/jpeg',
  });
  console.log(`✓ Uploaded: ${asset._id}`);

  await client
    .patch(article._id)
    .set({
      mainImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
        alt: 'Security forces at a political demonstration (public domain, U.S. Army)',
      },
    })
    .commit();
  console.log('✓ Article patched with mainImage.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
