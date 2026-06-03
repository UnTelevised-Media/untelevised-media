// src\lib\sanity\lib\fetch.ts
import 'server-only';

import type { ClientPerspective } from 'next-sanity';
import type { QueryParams } from '@sanity/client';
import { draftMode } from 'next/headers';
import sanityClient from './client';
import { readToken } from './tokens';

const DEFAULT_PARAMS = {} as QueryParams;
const DEFAULT_TAGS = [] as string[];

// ISR ceiling: Sanity webhook revalidateTag fires on publish events, but this
// acts as a safety net so stale content never persists longer than 1 hour if
// the webhook misses a publish (network hiccup, misconfiguration, etc.).
const REVALIDATE_CEILING_SECONDS = 3600;

async function fetchISR<QueryResponse>({
  query,
  params = DEFAULT_PARAMS,
  tags = DEFAULT_TAGS,
  perspective = 'published',
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
  perspective?: ClientPerspective;
}): Promise<QueryResponse> {
  const isDraftMode = (await draftMode()).isEnabled;

  // Use draft perspective and token in draft mode — no ISR caching in preview
  if (isDraftMode) {
    return sanityClient.withConfig({ token: readToken }).fetch<QueryResponse>(query, params, {
      perspective: 'previewDrafts',
      useCdn: false,
      next: { tags },
    });
  }

  // Use regular fetch for published content with tag-based revalidation + time ceiling
  return sanityClient.fetch<QueryResponse>(query, params, {
    perspective,
    useCdn: true,
    next: { tags, revalidate: REVALIDATE_CEILING_SECONDS },
  });
}

export default fetchISR;

// Named export matching the next-sanity/live sanityFetch API ({ data: T } shape).
// Drop-in replacement for sanityFetch from lib/sanity/lib/live — pages get
// ISR + CDN edge caching instead of SSE connections held open for every visitor.
export async function sanityFetch<QueryResponse>(options: {
  query: string;
  params?: QueryParams;
  tags?: string[];
  perspective?: ClientPerspective;
}): Promise<{ data: QueryResponse }> {
  const data = await fetchISR<QueryResponse>(options);
  return { data };
}
