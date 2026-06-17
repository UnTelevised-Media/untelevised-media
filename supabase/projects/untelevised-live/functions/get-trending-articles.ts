import { createClient } from '@supabase/supabase-js';

interface TrendingArticle {
  slug: string;
  view_count: number;
  last_viewed: string;
}

/**
 * Get trending articles from view_count table
 * Queries views from the past N days, grouped by article slug
 *
 * @param daysBack - Number of days to look back (default 7 for weekly trending)
 * @param limit - Maximum number of articles to return (default 20)
 * @returns Array of trending articles with view counts
 */
export async function getTrendingArticles(
  daysBack: number = 7,
  limit: number = 20
): Promise<TrendingArticle[]> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await supabase
    .from('view_count')
    .select('slug, viewed_at')
    .gte(
      'created_date',
      new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );

  if (error) {
    console.error('[getTrendingArticles] Query error:', error);
    throw error;
  }

  // Aggregate view counts by slug
  const counts = new Map<string, { count: number; lastViewed: string }>();

  for (const row of data || []) {
    const current = counts.get(row.slug) || { count: 0, lastViewed: row.viewed_at };
    counts.set(row.slug, {
      count: current.count + 1,
      lastViewed:
        new Date(row.viewed_at) > new Date(current.lastViewed)
          ? row.viewed_at
          : current.lastViewed,
    });
  }

  // Sort by view count descending, return top N
  return Array.from(counts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([slug, meta]) => ({
      slug,
      view_count: meta.count,
      last_viewed: meta.lastViewed,
    }));
}

/**
 * HTTP handler for API requests
 * GET /functions/v1/get-trending-articles?days=7&limit=20
 */
Deno.serve(async (req) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '7');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const articles = await getTrendingArticles(days, limit);

    return new Response(JSON.stringify(articles), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[get-trending-articles] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch trending articles' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
