import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

/**
 * DEPRECATED: This cron job is no longer used
 * View counts are now stored in Supabase (view_count table) and synced via
 * the batch-geolocate-views Edge Function. Sanity viewCount is deprecated.
 *
 * Previously synced view counts from Supabase to Sanity daily.
 * Now that is handled by getTrendingArticles() querying Supabase directly.
 */
export async function GET(request: NextRequest) {
  // Verify cron authorization via secret header
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    status: 'deprecated',
    message:
      'This cron job is no longer used. View counts are now queried directly from Supabase.',
  });
}
