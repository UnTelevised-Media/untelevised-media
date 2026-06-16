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
  perspective: 'drafts', // Show drafts without duplicate published versions
  stega: false, // Prevent stega encoding in portal data
});

/**
 * Convenience wrapper for portalClient.fetch() for compatibility with
 * code that previously used the Live Content API. Uses the regular Sanity
 * API with the drafts perspective instead of expensive vX subscriptions.
 */
export async function portalFetch<T>(query: string, params?: QueryParams): Promise<T> {
  if (params) {
    return portalClient.fetch<T>(query, params);
  }
  return portalClient.fetch<T>(query);
}
