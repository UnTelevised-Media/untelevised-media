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

export const { sanityFetch: portalSanityFetch, SanityLive: PortalSanityLive } = defineLive({
  client: _portalLiveClient,
  serverToken,
  browserToken: serverToken,
});
