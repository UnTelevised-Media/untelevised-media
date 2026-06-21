import 'server-only';

import { unstable_cache } from 'next/cache';
import { createHash } from 'crypto';
import { getServerClient } from './client';

interface ViewEvent {
  id: number;
  slug: string;
  ip: string | null;
  ip_hash: string | null;
  city: string | null;
  state_province: string | null;
  country: string | null;
  viewed_at: string;
  created_date: string;
}

function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

export async function recordViewEvent(slug: string, ip: string): Promise<void> {
  const client = getServerClient();

  const ipHash = hashIP(ip);
  const viewedAt = new Date().toISOString();

  // Supabase client type inference is incomplete for dynamic table names
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client.from('view_count') as any).insert({
    slug,
    ip_hash: ipHash,
    viewed_at: viewedAt,
    // created_date: should be auto-set by the DB or have a default
  });

  if (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    console.error('[recordViewEvent] Insert failed:', {
      code: err.code,
      message: err.message,
      details: err.details,
    });
    throw error;
  }
}

export interface ViewCountBySlug {
  slug: string;
  count: number;
}

/**
 * Get aggregated view counts for a specific date
 */
export async function getViewCountsByDate(dateString: string): Promise<ViewCountBySlug[]> {
  const client = getServerClient();

  // Supabase client type inference is incomplete for chained query methods
  const result = await (client
    .from('view_count')
    .select('slug')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .eq('created_date', dateString) as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = result as any;

  if (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    console.error('[viewEvents] Failed to get view counts:', err);
    throw error;
  }

  // Count occurrences of each slug
  const counts = new Map<string, number>();
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const rows = (data || []) as Pick<ViewEvent, 'slug'>[];
  for (const row of rows) {
    counts.set(row.slug, (counts.get(row.slug) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([slug, count]) => ({ slug, count }));
}

/**
 * Batch delete view events after syncing (cleanup old data)
 */
export async function deleteViewEventsForDate(dateString: string): Promise<number> {
  const client = getServerClient();

  const { count, error } = await client.from('view_count').delete().eq('created_date', dateString);

  if (error) {
    console.error('[viewEvents] Failed to delete view events:', error);
    throw error;
  }

  return count ?? 0;
}

export interface TrendingArticle {
  slug: string;
  view_count: number;
  last_viewed: string;
}

interface GetTrendingArticlesResponse {
  slug: string;
  view_count: string;
  last_viewed: string;
}

/**
 * Get trending articles from view_count table, aggregated by slug
 * Uses Supabase RPC for server-side aggregation and caches results for 5 minutes
 * NOTE: Requires SQL function created in Supabase dashboard:
 * CREATE OR REPLACE FUNCTION get_trending_articles(days_back integer, result_limit integer)
 * RETURNS TABLE(slug text, view_count bigint, last_viewed timestamptz)
 * LANGUAGE sql STABLE SECURITY DEFINER
 * AS $$ SELECT slug, COUNT(*)::bigint AS view_count, MAX(viewed_at)::timestamptz AS last_viewed
 *     FROM view_count WHERE created_date >= (CURRENT_DATE - days_back)
 *     GROUP BY slug ORDER BY view_count DESC LIMIT result_limit; $$;
 */
export const getTrendingArticles = unstable_cache(
  async (daysBack: number = 7, limit: number = 31): Promise<TrendingArticle[]> => {
    const client = getServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = (await (client as any).rpc('get_trending_articles', {
      days_back: daysBack,
      result_limit: limit,
    })) as {
      data: GetTrendingArticlesResponse[] | null;
      error: { code: string; message: string; details: string } | null;
    };

    if (error) {
      console.error('[getTrendingArticles] Supabase RPC error:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      throw error;
    }

    return (data ?? []).map((row) => ({
      slug: row.slug,
      view_count: Number(row.view_count),
      last_viewed: row.last_viewed,
    }));
  },
  ['supabase-trending'],
  { revalidate: 300, tags: ['trending'] }
);

/**
 * Get most read articles from Supabase, filtered by category
 * NOTE: The categorySlugs parameter is not used in the current implementation.
 * This function returns the same aggregated view counts as getTrendingArticles.
 * Uses Supabase RPC for server-side aggregation and caches results for 5 minutes.
 */
export const getMostReadByCategory = unstable_cache(
  async (
    categorySlugs: string[],
    daysBack: number = 7,
    limit: number = 5
  ): Promise<TrendingArticle[]> => {
    const client = getServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = (await (client as any).rpc('get_trending_articles', {
      days_back: daysBack,
      result_limit: limit,
    })) as {
      data: GetTrendingArticlesResponse[] | null;
      error: { code: string; message: string; details: string } | null;
    };

    if (error) {
      console.error('[getMostReadByCategory] Query error:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      throw error;
    }

    return (data ?? []).map((row) => ({
      slug: row.slug,
      view_count: Number(row.view_count),
      last_viewed: row.last_viewed,
    }));
  },
  ['supabase-trending-category'],
  { revalidate: 300, tags: ['trending'] }
);
