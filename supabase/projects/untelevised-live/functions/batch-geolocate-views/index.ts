import { createClient } from 'jsr:@supabase/supabase-js@2';
import crypto from 'node:crypto';

interface ViewRow {
  id: number;
  ip: string | null;
}

/**
 * Batch IP hashing job for view_count table
 * Runs daily at midnight CST (06:00 UTC)
 *
 * Process:
 * 1. Query rows where ip_hash IS NULL (unprocessed)
 * 2. Hash IP with SHA256
 * 3. Update row with: ip_hash, and set ip to NULL for privacy
 *
 * Note: Geolocation should be done separately via external service
 * (geoip-lite is too large for Supabase Edge Functions)
 */
export async function batchIPHashingJob() {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  console.log('[batch-ip-hashing] Starting batch IP hashing job');

  // Query rows that need IP hashing
  const { data: rows, error: selectError } = await supabase
    .from('view_count')
    .select('id, ip')
    .is('ip_hash', null)
    .limit(5000);

  if (selectError) {
    console.error('[batch-ip-hashing] Select error:', selectError);
    throw selectError;
  }

  if (!rows || rows.length === 0) {
    console.log('[batch-ip-hashing] No rows to process');
    return { processed: 0, message: 'No rows to process' };
  }

  console.log(`[batch-ip-hashing] Processing ${rows.length} rows`);

  let processedCount = 0;
  for (const row of rows as ViewRow[]) {
    const ipHash = row.ip ? hashIP(row.ip) : 'unknown';

    // Update row with hashed IP, clear raw IP for privacy
    const { error: updateError } = await supabase
      .from('view_count')
      .update({
        ip_hash: ipHash,
        ip: null, // Clear raw IP for privacy
      })
      .eq('id', row.id);

    if (updateError) {
      console.error(`[batch-ip-hashing] Failed to update row ${row.id}:`, updateError);
    } else {
      processedCount++;
    }
  }

  console.log(`[batch-ip-hashing] Completed. Processed ${processedCount} rows`);
  return { processed: processedCount };
}

function hashIP(ip: string): string {
  // Simple hash using crypto - for Deno Edge Functions
  // Returns hex string of SHA256 hash
  const key = new TextEncoder().encode(ip);
  return new Promise<string>((resolve) => {
    crypto.subtle.digest('SHA-256', key).then((hashBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      resolve(hashHex);
    });
  }).catch(() => 'error-hashing-ip');
}

/**
 * HTTP handler - triggered by cron or manual POST
 * POST /functions/v1/batch-ip-hashing
 * Header: Authorization: Bearer {CRON_SECRET}
 */
Deno.serve(async (req) => {
  // Verify cron authorization
  const authHeader = req.headers.get('authorization');
  const expectedAuth = `Bearer ${Deno.env.get('CRON_SECRET')}`;

  if (!authHeader || authHeader !== expectedAuth) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const result = await batchIPHashingJob();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[batch-ip-hashing] Error:', error);
    return new Response(JSON.stringify({ error: 'Batch job failed', message: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
