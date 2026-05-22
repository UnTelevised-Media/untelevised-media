// src/lib/portal/live.ts
// Portal-specific Sanity Live setup.
// Uses previewDrafts perspective + read token so draft articles/pitches are
// visible, and defineLive so mutations in Sanity trigger instant RSC re-renders
// on the dashboard without any polling or manual refresh.
import { defineLive } from 'next-sanity/live';
import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '@/lib/sanity/env';

const serverToken = process.env.SANITY_API_READ_TOKEN;

// Live Content API requires the experimental vX API version.
const _portalLiveClient = createClient({
  projectId,
  dataset,
  apiVersion: 'vX',
  useCdn: false,
  token: serverToken ?? undefined,
  perspective: 'previewDrafts',
  stega: false,
});

// browserToken intentionally omitted — the server read token is not CORS-configured
// for browser use. Server-side live queries still re-run on Sanity mutations.
// Add NEXT_PUBLIC_SANITY_API_BROWSER_TOKEN here if browser-push draft updates are needed.
export const { sanityFetch: portalSanityFetch, SanityLive: PortalSanityLive } = defineLive({
  client: _portalLiveClient,
  serverToken,
});

/**
 * Typed convenience wrapper around portalSanityFetch.
 * Calling portalSanityFetch inside this function still registers the query
 * with the live layer — React re-renders the calling RSC on any relevant
 * Sanity mutation automatically.
 */
export async function portalFetch<T>(query: string, params?: Record<string, unknown>): Promise<T> {
  const result = await portalSanityFetch({
    query,
    ...(params ? { params } : {}),
    perspective: 'previewDrafts',
  });
  return result.data as T;
}
