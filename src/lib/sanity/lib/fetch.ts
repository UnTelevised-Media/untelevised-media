// src\lib\sanity\lib\fetch.ts
// import 'server-only';

import type { ClientPerspective } from 'next-sanity';
import type { QueryParams } from '@sanity/client';
import client from './client';

const DEFAULT_PARAMS = {} as QueryParams;
const DEFAULT_TAGS = [] as string[];

export default async function sanityFetch<QueryResponse>({
  query,
  params = DEFAULT_PARAMS,
  tags = DEFAULT_TAGS,
  perspective,
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
  perspective?: Omit<ClientPerspective, 'raw'>;
}): Promise<QueryResponse> {
  perspective ??= 'published';

  return client.fetch<QueryResponse>(query, params, {
    perspective: 'published',
    // cache: 'force-cache',
    // cache: 'no-store',
    useCdn: true,
    next: { tags },
  });
}
