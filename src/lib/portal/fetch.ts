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
 * Convenience wrapper for portalClient.fetch() that uses previewDrafts perspective
 * to show both published and draft articles. Uses the regular Sanity API (stable version)
 * instead of the experimental Live Content API for better performance.
 */
export async function portalFetch<T>(query: string, params?: QueryParams): Promise<T> {
  // Only pass params if they exist and contain at least one key
  // Passing undefined or empty params object can cause issues with Sanity client
  if (params && Object.keys(params).length > 0) {
    return portalClient.fetch<T>(query, params);
  }
  return portalClient.fetch<T>(query);
}
