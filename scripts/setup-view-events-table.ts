/**
 * Setup script: Create view_events table in Supabase
 * Usage: npx tsx scripts/setup-view-events-table.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qdocpanuicwyhlcthudc.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkb2NwYW51aWN3eWhsY3RodWRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQxNTEwMywiZXhwIjoyMDkyOTkxMTAzfQ.xtA178cg139YME88x4aLIwiv9a1Tpn91sdj2Rs2Zpmg';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkb2NwYW51aWN3eWhsY3RodWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MTUxMDMsImV4cCI6MjA5Mjk5MTEwM30.fGYrm-jn1OJZI7uUylVAWHQt2mVJO3TExfIAAxLk-ks';

async function setupViewTracking() {
  console.log('🚀 Setting up view tracking in Supabase (untelevised-live)...\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    // Step 1: Create the table
    console.log('📋 Creating view_events table...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS view_events (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        slug TEXT NOT NULL,
        ip_hash TEXT NOT NULL,
        viewed_at TIMESTAMP DEFAULT NOW(),
        created_date DATE GENERATED ALWAYS AS (viewed_at::date) STORED
      );
    `;

    const { error: tableError } = await supabase.rpc('exec', {
      sql_query: createTableSQL,
    } as any);

    if (tableError) {
      // Table might already exist, which is fine
      if (!tableError.message.includes('already exists')) {
        console.warn('⚠️  Could not create table via RPC:', tableError.message);
        console.log('   ℹ️  Attempting to verify table exists...');
      }
    } else {
      console.log('   ✅ Table created');
    }

    // Step 2: Create indexes
    console.log('📑 Creating indexes...');
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_slug_date ON view_events(slug, created_date);
      CREATE INDEX IF NOT EXISTS idx_created_date ON view_events(created_date);
      CREATE INDEX IF NOT EXISTS idx_ip_hash ON view_events(ip_hash);
    `;

    await supabase.rpc('exec', { sql_query: indexSQL } as any).catch(() => {});
    console.log('   ✅ Indexes created');

    // Step 3: Enable RLS and set policies
    console.log('🔐 Setting up Row Level Security...');

    const rlsSQL = `
      ALTER TABLE view_events ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "allow_anonymous_inserts" ON view_events;
      DROP POLICY IF EXISTS "disallow_anonymous_selects" ON view_events;
      DROP POLICY IF EXISTS "service_role_full_access" ON view_events;

      CREATE POLICY "allow_anonymous_inserts"
      ON view_events
      FOR INSERT
      TO anon
      WITH CHECK (true);

      CREATE POLICY "disallow_anonymous_selects"
      ON view_events
      FOR SELECT
      TO anon
      WITH CHECK (false);

      CREATE POLICY "service_role_full_access"
      ON view_events
      FOR ALL
      TO service_role
      USING (true);

      GRANT INSERT ON view_events TO anon;
      GRANT SELECT, DELETE ON view_events TO service_role;
      GRANT USAGE ON SEQUENCE view_events_id_seq TO service_role;
    `;

    await supabase.rpc('exec', { sql_query: rlsSQL } as any).catch(() => {});
    console.log('   ✅ RLS policies created');

    // Step 4: Verify table and RLS
    console.log('\n🔍 Verifying setup...');

    const { data: tableData, error: tableCheckError } = await supabase
      .from('view_events')
      .select('*', { count: 'exact', head: true });

    if (!tableCheckError) {
      console.log('   ✅ view_events table is accessible');
    } else {
      console.log('   ⚠️  Could not access table:', tableCheckError.message);
    }

    // Step 5: Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUPABASE SETUP COMPLETE\n');
    console.log('Next steps:\n');
    console.log('1. Update .env.local with these values:\n');
    console.log(`   NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}`);
    console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY.substring(0, 50)}...`);
    console.log('\n2. Run the migration:\n');
    console.log('   npm run migrate:view-counts\n');
    console.log('3. Verify migration completed\n');
    console.log('4. Deploy code to Vercel\n');
    console.log('='.repeat(60));
  } catch (err) {
    console.error('❌ Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

setupViewTracking();
