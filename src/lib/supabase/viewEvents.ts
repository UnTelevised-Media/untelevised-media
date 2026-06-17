import 'server-only';

import crypto from 'crypto';
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
  return crypto.createHash('sha256').update(ip).digest('hex');
}

export async function recordViewEvent(slug: string, ip: string): Promise<void> {
  const client = getServerClient();

  // Store raw IP (encrypted at rest) and NULL fields for batch job geolocation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client.from('view_count') as any).insert({
    slug,
    ip: ip, // Raw IP, will be used by batch job for geolocation
    ip_hash: null, // Will be set by batch job after geolocation
    city: null,
    state_province: null,
    country: null,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
