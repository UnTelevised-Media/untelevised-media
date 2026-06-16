import crypto from 'crypto';
import { getServerClient } from './client';
import type { Database } from './client';

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

export async function recordViewEvent(slug: string, ip: string): Promise<void> {
  const client = getServerClient();
  const ipHash = hashIP(ip);

  const { error } = await client.from('view_events').insert({
    slug,
    ip_hash: ipHash,
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

  const { data, error } = await client
    .from('view_events')
    .select('slug')
    .eq('created_date', dateString);

  if (error) {
    console.error('[viewEvents] Failed to get view counts:', error);
    throw error;
  }

  // Count occurrences of each slug
  const counts = new Map<string, number>();
  for (const row of data || []) {
    counts.set(row.slug, (counts.get(row.slug) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([slug, count]) => ({ slug, count }));
}

/**
 * Batch delete view events after syncing (cleanup old data)
 */
export async function deleteViewEventsForDate(dateString: string): Promise<number> {
  const client = getServerClient();

  const { count, error } = await client
    .from('view_events')
    .delete()
    .eq('created_date', dateString);

  if (error) {
    console.error('[viewEvents] Failed to delete view events:', error);
    throw error;
  }

  return count ?? 0;
}
