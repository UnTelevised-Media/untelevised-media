/* eslint-disable import/prefer-default-export */
import 'server-only';

import { groq } from 'next-sanity';

import { client } from '@/lib/sanity/client';

import { readToken as token } from '@/lib/sanity/tokens';

// Used in `generateStaticParams`
// This may end up unused
export async function generateStaticSlugs(type: string) {
  // Not using loadQuery as it's optimized for fetching in the RSC lifecycle
  return client
    .withConfig({
      token,
      perspective: 'published',
      useCdn: false,
      stega: false,
    })
    .fetch<string[]>(
      groq`*[_type == $type && defined(slug.current)]{"slug": slug.current}`,
      { type },
      {
        next: {
          tags: [type],
        },
      },
    );
}
