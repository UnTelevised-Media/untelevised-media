import { NextRequest, NextResponse } from 'next/server';
import { getViewCountsByDate, deleteViewEventsForDate } from '@/lib/supabase/viewEvents';
import { writeClient } from '@/lib/sanity/lib/write-client';

export const maxDuration = 60;

/**
 * Cron job to sync view counts from Supabase to Sanity daily
 * Triggered once per day by Vercel Cron
 */
export async function GET(request: NextRequest) {
  // Verify cron authorization via secret header
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get view counts from Supabase for yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    console.log(`[sync-view-counts] Processing views for date: ${dateStr}`);

    const viewCounts = await getViewCountsByDate(dateStr);

    if (viewCounts.length === 0) {
      console.log('[sync-view-counts] No view events found for date');
      return NextResponse.json({ synced: 0, message: 'No view events found' });
    }

    console.log(`[sync-view-counts] Found ${viewCounts.length} unique articles with views`);

    // Fetch all articles from Sanity by their slugs
    const slugs = viewCounts.map((v) => v.slug);
    const articles = await writeClient.fetch<
      { _id: string; slug: { current: string }; viewCount?: number }[]
    >(
      `*[_type == "article" && slug.current in $slugs] {
        _id,
        slug,
        viewCount
      }`,
      { slugs }
    );

    if (articles.length === 0) {
      console.warn('[sync-view-counts] No articles found in Sanity for slugs:', slugs);
      return NextResponse.json({
        synced: 0,
        error: 'No articles found in Sanity',
      });
    }

    console.log(`[sync-view-counts] Found ${articles.length} articles in Sanity`);

    // Build mutation patches to increment viewCount
    const patches = articles
      .map((article) => {
        const viewCount = viewCounts.find((v) => v.slug === article.slug.current);
        if (!viewCount || viewCount.count === 0) return null;

        return {
          patch: {
            id: article._id,
            // Use setIfMissing to initialize viewCount if it doesn't exist
            inc: { viewCount: viewCount.count },
          },
        };
      })
      .filter((p) => p !== null);

    if (patches.length === 0) {
      console.log('[sync-view-counts] No patches to apply');
      return NextResponse.json({ synced: 0, message: 'No patches to apply' });
    }

    console.log(`[sync-view-counts] Applying ${patches.length} patches to Sanity`);

    // Apply mutations asynchronously (non-blocking)
    await writeClient.mutate(patches as any[], { visibility: 'async' });

    // Clean up old view events from Supabase
    const deleted = await deleteViewEventsForDate(dateStr);
    console.log(`[sync-view-counts] Deleted ${deleted} view events from Supabase`);

    return NextResponse.json({
      synced: patches.length,
      deleted,
      message: `Synced ${patches.length} articles and deleted ${deleted} old events`,
    });
  } catch (err) {
    console.error('[sync-view-counts] Error:', err);
    return NextResponse.json(
      {
        error: 'Failed to sync view counts',
        message: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
