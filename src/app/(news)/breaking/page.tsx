// src/app/(news)/breaking/page.tsx
import type { Metadata } from 'next';
import { sanityFetch } from '@/lib/sanity/lib/fetch';
import { queryLiveEvents, queryBreakingArticles } from '@/lib/sanity/lib/queries';
import BreakingNewsClient from './BreakingNewsClient';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Breaking News | UnTelevised Media',
    description: 'Latest breaking news and active live events from UnTelevised Media.',
    openGraph: {
      title: 'Breaking News | UnTelevised Media',
      description: 'Latest breaking news and active live events from UnTelevised Media.',
      type: 'website',
    },
  };
}

export default async function BreakingNews() {
  const [{ data: liveEvents }, { data: breakingArticles }] = await Promise.all([
    sanityFetch({ query: queryLiveEvents, tags: ['liveEvent'] }),
    sanityFetch({ query: queryBreakingArticles, tags: ['article', 'breaking'] }),
  ]);

  // BreakingNewsClient expects flexible data structures
  return (
    <BreakingNewsClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialEvents={(liveEvents as any[]) ?? []}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialArticles={(breakingArticles as any[]) ?? []}
    />
  );
}
