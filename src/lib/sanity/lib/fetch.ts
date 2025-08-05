// src\lib\sanity\lib\fetch.ts
import 'server-only';

import type { ClientPerspective } from 'next-sanity';
import type { QueryParams } from '@sanity/client';
import { draftMode } from 'next/headers';
import sanityClient from './client';
import { readToken } from './tokens';

const DEFAULT_PARAMS = {} as QueryParams;
const DEFAULT_TAGS = [] as string[];

export default async function sanityFetch<QueryResponse>({
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

  // Use draft perspective and token in draft mode
  if (isDraftMode) {
    return sanityClient.withConfig({ token: readToken }).fetch<QueryResponse>(query, params, {
      perspective: 'previewDrafts',
      useCdn: false,
      next: { tags },
    });
  }

  // Use regular fetch for published content
  return sanityClient.fetch<QueryResponse>(query, params, {
    perspective,
    useCdn: true,
    next: { tags },
  });
}
