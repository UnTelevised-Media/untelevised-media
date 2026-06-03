import React from 'react';
import { Metadata } from 'next';
import PastEventsPage from '@/components/pages/PastEventsPage';
import { sanityFetch } from '@/lib/sanity/lib/live';
import { queryPastEvents } from '@/lib/sanity/lib/queries';

export const metadata: Metadata = {
  title: 'Past Events | UnTelevised Media',
  description:
    'Explore our comprehensive archive of previously covered live events. Browse through historical events, key moments, and detailed coverage from our past live reporting.',
  keywords:
    'past events, live event archive, historical coverage, event history, UnTelevised Media',
  openGraph: {
    title: 'Past Events Archive | UnTelevised Media',
    description:
      'Discover the complete archive of live events previously covered by UnTelevised Media. Explore historical moments and detailed event coverage.',
    type: 'website',
    url: 'https://untelevised.media/past-events',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Past Events Archive | UnTelevised Media',
    description:
      'Browse through our comprehensive archive of previously covered live events and historical moments.',
  },
};

async function getPastEvents(): Promise<LiveEvent[]> {
  try {
    const { data: pastEvents } = await sanityFetch({
      query: queryPastEvents,
      tags: ['liveEvent'],
    });
    return (pastEvents as LiveEvent[]) || [];
  } catch (error) {
    console.error('Error fetching past events:', error);
    return [];
  }
}

const PastEvents = async () => {
  const pastEvents = await getPastEvents();

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
      <div className='mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8'>
        {/* Page Header */}
        <div className='mb-12 text-center'>
          <h1 className='mb-4 text-4xl font-bold text-slate-900 dark:text-white md:text-5xl'>
            Past Events Archive
          </h1>
          <p className='mx-auto max-w-3xl text-lg text-slate-600 dark:text-slate-300'>
            Explore our comprehensive collection of previously covered live events. From breaking
            news to major developments, discover the moments that shaped our coverage.
          </p>
        </div>

        {/* Past Events Component */}
        <PastEventsPage initialEvents={pastEvents} />
      </div>
    </div>
  );
};

// Generate static params for better SEO
export async function generateStaticParams() {
  return [];
}

// Revalidate every hour to ensure fresh content
export const revalidate = 3600;

export default PastEvents;
