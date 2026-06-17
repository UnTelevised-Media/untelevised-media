import 'server-only';

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client.from('view_count') as any).insert({
    slug,
    ip_hash: ipHash,
    viewed_at: new Date().toISOString(),
    // created_date: should be auto-set by the DB or have a default
  });

  if (error) {
    console.error('[viewEvents] Failed to record view:', error);
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

  // Type assertion needed for Supabase strict typing

  const { data, error } = await (client
    .from('view_count')
    .select('slug')
    .eq('created_date', dateString) as any);

  if (error) {
    console.error('[viewEvents] Failed to get view counts:', error);
    throw error;
  }

  // Count occurrences of each slug
  const counts = new Map<string, number>();
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

/**
 * Get trending articles from view_count table, aggregated by slug
 */
export async function getTrendingArticles(
  daysBack: number = 7,
  limit: number = 31
): Promise<TrendingArticle[]> {
  const client = getServerClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const dateStr = startDate.toISOString().split('T')[0];

  const { data, error } = await (client
    .from('view_count')
    .select('slug, viewed_at')
    .gte('created_date', dateStr) as any);

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

  return Array.from(counts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([slug, meta]) => ({
      slug,
      view_count: meta.count,
      last_viewed: meta.lastViewed,
    }));
}
