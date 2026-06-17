import { createClient } from '@supabase/supabase-js';

const URL = 'https://qdocpanuicwyhlcthudc.supabase.co';
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkb2NwYW51aWN3eWhsY3RodWRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQxNTEwMywiZXhwIjoyMDkyOTkxMTAzfQ.xtA178cg139YME88x4aLIwiv9a1Tpn91sdj2Rs2Zpmg';

async function verifyTable() {
  const supabase = createClient(URL, SERVICE_KEY);

  console.log('🔍 Checking view_events table...\n');

  // Try to select with service role
  const { data, error } = await supabase
    .from('view_events')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('❌ Error accessing table:', error.message);
    console.error('Error details:', error);

    // Try to get table info from information_schema
    const { data: tableInfo, error: infoError } = await supabase.rpc('exec', {
      sql_query: `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = 'view_events';
      `,
    } as any);

    if (infoError) {
      console.log('⚠️  Cannot query information_schema via RPC');
    } else {
      console.log('Table info:', tableInfo);
    }
  } else {
    console.log('✅ Table exists and is accessible!');
    console.log(`   Found ${data === null ? '0' : 'some'} rows\n`);

    // Try to insert a test record
    console.log('📝 Testing INSERT permissions...');
    const { error: insertError } = await supabase.from('view_events').insert([
      {
        slug: 'test-article',
        ip_hash: 'test-hash',
      },
    ]);

    if (insertError) {
      console.error('❌ INSERT failed:', insertError.message);
    } else {
      console.log('✅ INSERT works!');

      // Clean up test record
      await supabase.from('view_events').delete().eq('slug', 'test-article');
      console.log('   (cleaned up test record)\n');

      console.log('🎉 Table is ready for migration!');
      console.log('Run: npm run migrate:view-counts');
    }
  }
}

verifyTable().catch(console.error);
