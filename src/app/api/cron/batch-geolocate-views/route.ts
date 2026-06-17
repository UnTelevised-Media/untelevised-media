import { NextRequest, NextResponse } from 'next/server';
import geoip from 'geoip-lite';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 300; // 5 minutes

/**
 * Daily batch job: geolocate views and hash IPs
 * Runs at midnight CST, processes all rows where ip_hash IS NULL
 * Uses geoip-lite to lookup: city, state_province, country
 */
export async function GET(request: NextRequest) {
  // Verify cron authorization via secret header
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Initialize Supabase client with service role (full access)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('[batch-geolocate-views] Starting geolocation batch job');

    // Query rows that need geolocation (ip_hash IS NULL)
    const { data: rows, error: selectError } = await supabase
      .from('view_count')
      .select('id, ip')
      .is('ip_hash', null)
      .limit(10000); // Process up to 10k rows per batch

    if (selectError) {
      console.error('[batch-geolocate-views] Failed to select rows:', selectError);
      return NextResponse.json({ error: 'Failed to select rows' }, { status: 500 });
    }

    if (!rows || rows.length === 0) {
      console.log('[batch-geolocate-views] No rows to process');
      return NextResponse.json({ processed: 0, message: 'No rows to process' });
    }

    console.log(`[batch-geolocate-views] Processing ${rows.length} rows`);

    // Batch update: geolocate and hash each IP
    const updates = rows.map((row: { id: number; ip: string | null }) => {
      if (!row.ip || row.ip === 'unknown') {
        return {
          id: row.id,
          ip_hash: 'unknown',
          city: 'unknown',
          state_province: 'unknown',
          country: 'unknown',
        };
      }

      // Lookup geolocation
      const geo = geoip.lookup(row.ip);

      // Hash IP
      const ipHash = crypto.createHash('sha256').update(row.ip).digest('hex');

      return {
        id: row.id,
        ip_hash: ipHash,
        city: geo?.city || 'unknown',
        state_province: geo?.timezone?.split('/')[0] || geo?.state || 'unknown',
        country: geo?.country || 'unknown',
      };
    });

    console.log(`[batch-geolocate-views] Updating ${updates.length} rows with geolocation data`);

    // Update rows with geolocation + ip_hash
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('view_count')
        .update({
          ip_hash: update.ip_hash,
          city: update.city,
          state_province: update.state_province,
          country: update.country,
          // Clear raw IP after geolocation (for privacy)
          ip: null,
        })
        .eq('id', update.id);

      if (updateError) {
        console.error(`[batch-geolocate-views] Failed to update row ${update.id}:`, updateError);
      }
    }

    console.log(`[batch-geolocate-views] Completed batch job. Processed ${updates.length} rows`);

    return NextResponse.json({
      processed: updates.length,
      message: `Geolocated and hashed ${updates.length} view events`,
    });
  } catch (err) {
    console.error('[batch-geolocate-views] Error:', err);
    return NextResponse.json(
      {
        error: 'Failed to process batch geolocation',
        message: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
