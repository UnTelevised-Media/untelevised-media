// src/lib/portal/fetch.ts
// Sanity fetch helper for portal queries — always uses the read token
// to support draft content preview in the portal.
import 'server-only';

import type { QueryParams } from '@sanity/client';
import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '@/lib/sanity/env';
import { readToken } from '@/lib/sanity/lib/tokens';

/** Portal client — authenticated with read token so draft docs are visible. */
export const portalClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: readToken ?? undefined,
  perspective: 'previewDrafts', // Show drafts without duplicate published versions
  stega: false, // Prevent stega encoding in portal data
});

/**
 * Non-reactive portal fetch for read-only dashboard lists (articles, sources, etc).
 * Uses stable API version instead of experimental vX for better performance.
 *
 * For editor pages (edit/create articles), use portalFetch from @/lib/portal/live instead,
 * which provides reactive updates via defineLive when Sanity data changes.
 *
 * When params is undefined, calls fetch with query only to match the correct
 * Sanity client overload and avoid undefined parameter serialization errors.
 */
export async function portalFetch<T>(query: string, params?: QueryParams): Promise<T> {
  // Only pass params if they exist — calling with undefined params would
  // trigger Sanity client's internal parameter binding code unnecessarily
  // and could cause "Cannot read properties of undefined (reading 'localsInner')" errors
  if (params && Object.keys(params).length > 0) {
    return portalClient.fetch<T>(query, params);
  }
  return portalClient.fetch<T>(query);
}
