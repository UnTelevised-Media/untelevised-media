/* eslint-disable react/function-component-definition */
// src/app/(news)/breaking/page.tsx

import type { Metadata } from 'next';
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

export default function BreakingNews() {
  return <BreakingNewsClient />;
}
