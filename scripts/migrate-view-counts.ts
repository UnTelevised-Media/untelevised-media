/**
 * Migration script: Copy viewCount data from Sanity to Supabase
 *
 * This script:
 * 1. Fetches all articles with viewCount from Sanity
 * 2. Creates synthetic view events in Supabase to match the totals
 * 3. Preserves the existing viewCount data during transition
 *
 * Usage: npx ts-node scripts/migrate-view-counts.ts
 *
 * Prerequisites:
 * - Supabase project created with view_events table
 * - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY set in .env.local
 * - SANITY_API_READ_TOKEN set in .env.local
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_READ_TOKEN = process.env.SANITY_API_READ_TOKEN;
const SANITY_API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-06-04';

// Validate environment variables
const missingVars = [];
if (!SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
if (!SUPABASE_SERVICE_ROLE_KEY) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
if (!SANITY_PROJECT_ID) missingVars.push('NEXT_PUBLIC_SANITY_PROJECT_ID');
if (!SANITY_DATASET) missingVars.push('NEXT_PUBLIC_SANITY_DATASET');

if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:', missingVars.join(', '));
  process.exit(1);
}

interface SanityArticle {
  _id: string;
  slug: { current: string };
  viewCount?: number;
  title: string;
}

interface ViewEventInsert {
  slug: string;
  ip_hash: string;
  viewed_at: string;
}

async function fetchSanityArticles(): Promise<SanityArticle[]> {
  console.log('📖 Fetching articles from Sanity...');

  const query = `
    *[_type == "article" && defined(slug.current)] {
      _id,
      slug,
      title,
      viewCount
    }
  `;

  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SANITY_READ_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Sanity API error: ${response.statusText}`);
  }

  const result = (await response.json()) as { result: SanityArticle[] };
  return result.result;
}

async function migrateViewCounts(): Promise<void> {
  console.log('🚀 Starting viewCount migration from Sanity to Supabase...\n');

  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');

  try {
    // Step 1: Fetch all articles from Sanity
    const articles = await fetchSanityArticles();
    console.log(`✓ Found ${articles.length} articles in Sanity\n`);

    // Step 2: Filter articles with viewCount
    const articlesWithViews = articles.filter((a) => (a.viewCount ?? 0) > 0);
    console.log(`📊 Articles with viewCount: ${articlesWithViews.length}`);
    console.log(
      `📊 Total views to migrate: ${articlesWithViews.reduce((sum, a) => sum + (a.viewCount ?? 0), 0)}\n`
    );

    if (articlesWithViews.length === 0) {
      console.log('✅ No viewCount data to migrate');
      return;
    }

    // Step 3: Create synthetic view events in Supabase
    console.log('📥 Inserting view events into Supabase...');
    let totalInserted = 0;
    let totalSkipped = 0;

    for (const article of articlesWithViews) {
      const slug = article.slug.current;
      const viewCount = article.viewCount ?? 0;

      if (viewCount <= 0) continue;

      // Create synthetic view events
      // We'll create events spread across the past 30 days to simulate realistic distribution
      const events: ViewEventInsert[] = [];
      const now = new Date();

      for (let i = 0; i < viewCount; i++) {
        // Distribute views across past 30 days (roughly)
        const daysAgo = Math.floor(Math.random() * 30);
        const eventDate = new Date(now);
        eventDate.setDate(eventDate.getDate() - daysAgo);

        events.push({
          slug,
          ip_hash: `migration-synthetic-${i}`, // Marked as synthetic for filtering if needed
          viewed_at: eventDate.toISOString(),
        });
      }

      // Insert in batches of 100
      for (let i = 0; i < events.length; i += 100) {
        const batch = events.slice(i, i + 100);
        const { error } = await supabase.from('view_events').insert(batch);

        if (error) {
          console.error(`❌ Error inserting views for "${slug}":`, error.message);
          totalSkipped += batch.length;
        } else {
          totalInserted += batch.length;
        }
      }

      console.log(`  ✓ ${slug}: ${viewCount} views`);
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`  📥 Inserted: ${totalInserted} view events`);
    console.log(`  ⚠️  Skipped: ${totalSkipped} view events`);

    // Step 4: Verify the migration
    console.log('\n🔍 Verifying migration...');
    const { count, error: countError } = await supabase
      .from('view_events')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error verifying migration:', countError.message);
    } else {
      console.log(`✓ Total view events in Supabase: ${count}`);
    }

    // Step 5: Sample data check
    const { data: sampleData, error: sampleError } = await supabase
      .from('view_events')
      .select('slug, COUNT(*) as count')
      .limit(5);

    if (sampleError) {
      console.error('❌ Error fetching sample data:', sampleError.message);
    } else {
      console.log('\n📋 Sample view counts (top 5 by slug):');
      // Group by slug manually since Supabase doesn't group in JS
      const slugCounts = new Map<string, number>();
      // Re-fetch to group
      const { data: allData } = await supabase.from('view_events').select('slug');
      for (const row of allData || []) {
        slugCounts.set(row.slug, (slugCounts.get(row.slug) ?? 0) + 1);
      }

      Array.from(slugCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([slug, count]) => {
          console.log(`  ${slug}: ${count} views`);
        });
    }

    console.log('\n🎉 Migration successful! Next steps:');
    console.log('  1. Verify viewCount data is correct in Supabase');
    console.log('  2. Deploy the code changes to production');
    console.log('  3. Monitor the /api/cron/sync-view-counts job');
    console.log('  4. Verify Sanity viewCount gets updated');
  } catch (err) {
    console.error('❌ Migration failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

// Run migration
migrateViewCounts();
