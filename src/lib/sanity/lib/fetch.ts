// src\lib\sanity\lib\fetch.ts
import 'server-only';

import type { ClientPerspective } from 'next-sanity';
import type { QueryParams } from '@sanity/client';
import { draftMode } from 'next/headers';
import sanityClient from './client';
import { readToken } from './tokens';

const DEFAULT_PARAMS = {} as QueryParams;
const DEFAULT_TAGS = [] as string[];

// ISR ceiling: revalidateTag() via the Sanity webhook handles all content changes
// instantly. This ceiling is purely a failsafe for missed webhooks — a page would
// be caught and rebuilt within 24 hours even if a webhook failed completely.
// Previously 3600 (1 h); raised to 86400 (24 h) to reduce time-based ISR writes
// by 24× now that the webhook GROQ filter eliminates viewCount-only mutations.
const REVALIDATE_CEILING_SECONDS = 86400;

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
