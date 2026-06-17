import { createClient } from '@supabase/supabase-js';
import geoip from 'npm:geoip-lite';
import crypto from 'node:crypto';

interface ViewRow {
  id: number;
  ip: string | null;
}

interface GeoLocation {
  city: string;
  state_province: string;
  country: string;
}

/**
 * Batch geolocation job for view_count table
 * Runs daily at midnight CST (06:00 UTC)
 *
 * Process:
 * 1. Query rows where ip_hash IS NULL (unprocessed)
 * 2. Geolocate IP using geoip-lite
 * 3. Hash IP with SHA256
 * 4. Update row with: city, state_province, country, ip_hash
 * 5. Clear raw IP (set to NULL) for privacy
 */
export async function batchGeolocationJob() {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  console.log('[batch-geolocate-views] Starting batch geolocation job');

  // Query rows that need geolocation
  const { data: rows, error: selectError } = await supabase
    .from('view_count')
    .select('id, ip')
    .is('ip_hash', null)
    .limit(10000);

  if (selectError) {
    console.error('[batch-geolocate-views] Select error:', selectError);
    throw selectError;
  }

  if (!rows || rows.length === 0) {
    console.log('[batch-geolocate-views] No rows to process');
    return { processed: 0, message: 'No rows to process' };
  }

  console.log(`[batch-geolocate-views] Processing ${rows.length} rows`);

  // Process each row
  let processedCount = 0;
  for (const row of rows as ViewRow[]) {
    const geo = getGeolocation(row.ip);
    const ipHash = row.ip ? hashIP(row.ip) : 'unknown';

    // Update row with geolocation data and hash
    const { error: updateError } = await supabase
      .from('view_count')
      .update({
        ip_hash: ipHash,
        city: geo.city,
        state_province: geo.state_province,
        country: geo.country,
        ip: null, // Clear raw IP for privacy
      })
      .eq('id', row.id);

    if (updateError) {
      console.error(`[batch-geolocate-views] Failed to update row ${row.id}:`, updateError);
    } else {
      processedCount++;
    }
  }

  console.log(`[batch-geolocate-views] Completed. Processed ${processedCount} rows`);
  return { processed: processedCount };
}

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

function getGeolocation(ip: string | null): GeoLocation {
  if (!ip || ip === 'unknown') {
    return { city: 'unknown', state_province: 'unknown', country: 'unknown' };
  }

  const geo = geoip.lookup(ip);
  if (!geo) {
    return { city: 'unknown', state_province: 'unknown', country: 'unknown' };
  }

  return {
    city: geo.city || 'unknown',
    state_province: geo.timezone?.split('/')[0] || geo.state || 'unknown',
    country: geo.country || 'unknown',
  };
}

/**
 * HTTP handler - can be triggered manually or by cron
 * POST /functions/v1/batch-geolocate-views
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
    const result = await batchGeolocationJob();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[batch-geolocate-views] Error:', error);
    return new Response(JSON.stringify({ error: 'Batch job failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
