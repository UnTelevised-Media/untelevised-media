#!/usr/bin/env node
import 'dotenv/config';
import { createClient } from '@sanity/client';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually
const envFile = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envFile, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
});

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-06-04',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

const SAMPLE_SLUGS = [
  'ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen',
  'the-women-in-the-beauty-salon-a-story-numbers-won-t-tell-you',
  'in-northern-gaza-one-man-refuses-to-let-the-cats-starve',
  'north-dakota-law-enforcement-launch-series-of-brutal-terrorist-attacks-on-native-water',
];

async function generateMigration() {
  console.log('Fetching articles from Sanity...');

  const articles = await client.fetch(`
    *[_type == "article" && defined(slug.current)] {
      slug,
      publishedAt,
      viewCount
    }
    | order(_createdAt asc)
  `);

  console.log(`Found ${articles.length} total articles in Sanity`);

  // Filter out the 4 sample articles
  const remaining = articles.filter(
    (a) => !SAMPLE_SLUGS.includes(a.slug.current)
  );

  console.log(
    `${remaining.length} articles remaining after excluding 4 samples`
  );

  if (remaining.length === 0) {
    console.error('No remaining articles to migrate!');
    process.exit(1);
  }

  // Generate SQL using same format as migration 002
  let sql = `-- Populate remaining ${remaining.length} articles to view_count table
-- Excludes the 4 articles already added in migration 002
-- Auto-generated from Sanity articles
-- Uses same format as migration 002: GENERATE_SERIES to spread views across time

-- Disable triggers for bulk insert performance
ALTER TABLE public.view_count DISABLE TRIGGER ALL;

-- Insert synthetic view events spread across publication timeline
INSERT INTO public.view_count (slug, ip, ip_hash, city, state_province, country, viewed_at)
SELECT
  a.slug,
  NULL as ip,
  NULL as ip_hash,
  'migrated' as city,
  'migrated' as state_province,
  'migrated' as country,
  a.published_at + (
    INTERVAL '1 day' * (
      (ROW_NUMBER() OVER (PARTITION BY a.slug ORDER BY a.slug) - 1) *
      (EXTRACT(DAY FROM NOW() - a.published_at)::INT / NULLIF(a.view_count, 0))
    )
  ) as viewed_at
FROM (
  -- Remaining ${remaining.length} articles from Sanity
  VALUES\n`;

  const valueLines = remaining.map((article) => {
    const slug = article.slug.current || 'unknown';
    const viewCount = article.viewCount || 1;
    const publishedAt = article.publishedAt || new Date().toISOString();
    return `    ('${slug.replace(/'/g, "''")}', '${publishedAt}'::TIMESTAMP, ${viewCount})`;
  });

  sql += valueLines.join(',\n') + `
) a(slug, published_at, view_count)
CROSS JOIN LATERAL GENERATE_SERIES(1, a.view_count) AS gs(n);

-- Re-enable triggers
ALTER TABLE public.view_count ENABLE TRIGGER ALL;

-- Verify migration
SELECT
  COUNT(*) as total_events,
  COUNT(DISTINCT slug) as unique_articles,
  COUNT(CASE WHEN city = 'migrated' THEN 1 END) as migrated_views,
  MIN(viewed_at) as earliest_view,
  MAX(viewed_at) as latest_view
FROM public.view_count;`;

  console.log('\n=== GENERATED SQL ===\n');
  console.log(sql);

  // Also write to file
  const fs = await import('fs').then((m) => m.promises);
  const filename = `supabase/migrations/003_populate_remaining_${remaining.length}_articles.sql`;
  await fs.writeFile(
    filename,
    sql
  );
  console.log(`\nMigration written to: ${filename}`);
}

generateMigration().catch(console.error);
