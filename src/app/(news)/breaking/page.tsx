/* eslint-disable react/function-component-definition */
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

  return (
    <BreakingNewsClient
      initialEvents={(liveEvents as any[]) ?? []}
      initialArticles={(breakingArticles as any[]) ?? []}
    />
  );
}
