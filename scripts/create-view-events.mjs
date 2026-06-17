import { createClient } from '@supabase/supabase-js'

const url = 'https://qdocpanuicwyhlcthudc.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkb2NwYW51aWN3eWhsY3RodWRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQxNTEwMywiZXhwIjoyMDkyOTkxMTAzfQ.xtA178cg139YME88x4aLIwiv9a1Tpn91sdj2Rs2Zpmg'

const supabase = createClient(url, key)

console.log('🚀 Creating view_events table in Supabase...\n')

try {
  // Test table access first
  const { error: testError, data: testData } = await supabase
    .from('view_events')
    .select('count()', { count: 'exact', head: true })

  if (!testError) {
    console.log('✅ view_events table already exists!')
    process.exit(0)
  }

  if (testError && testError.message.includes('does not exist')) {
    console.log('⚠️  Table does not exist')
    console.log('📝 You must create it manually in Supabase SQL Editor\n')
    console.log('Go to: https://supabase.com/dashboard → Project → SQL Editor')
    console.log('Click "New Query" and paste:\n')
    console.log('='.repeat(70))

    const sql = `CREATE TABLE IF NOT EXISTS view_events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  viewed_at TIMESTAMP DEFAULT NOW(),
  created_date DATE GENERATED ALWAYS AS (viewed_at::date) STORED
);

CREATE INDEX IF NOT EXISTS idx_slug_date ON view_events(slug, created_date);
CREATE INDEX IF NOT EXISTS idx_created_date ON view_events(created_date);
CREATE INDEX IF NOT EXISTS idx_ip_hash ON view_events(ip_hash);

ALTER TABLE view_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_anonymous_inserts" ON view_events;
DROP POLICY IF EXISTS "disallow_anonymous_selects" ON view_events;
DROP POLICY IF EXISTS "service_role_full_access" ON view_events;

CREATE POLICY "allow_anonymous_inserts" ON view_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "disallow_anonymous_selects" ON view_events FOR SELECT TO anon WITH CHECK (false);
CREATE POLICY "service_role_full_access" ON view_events FOR ALL TO service_role USING (true);

GRANT INSERT ON view_events TO anon;
GRANT SELECT, DELETE ON view_events TO service_role;
GRANT USAGE ON SEQUENCE view_events_id_seq TO service_role;`

    console.log(sql)
    console.log('='.repeat(70))
    console.log('\nThen click "Run" and return here.')
  }
} catch (err) {
  console.error('❌ Error:', err.message)
}
