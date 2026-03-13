/* eslint-disable react/function-component-definition */
// src/app/(user)/timelines/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';

import TimelineOverview from '@/components/timeline/TimelineOverview';
import LoadingSpinner from '@/components/global/LoadingSpinner';
import { BannerAd } from '@/components/ads';

import sanityFetch from '@/lib/sanity/lib/fetch';
import {
  queryFeaturedTimelines,
  queryRecentTimelineEvents,
  queryMilestoneEvents,
  queryTimelineCategories,
  queryAllTimelines,
} from '@/lib/sanity/lib/queries';

export const metadata: Metadata = {
  title: 'Interactive Timelines - UnTelevised Media',
  description: 'Explore comprehensive timelines of breaking news, investigations, and major events. Navigate through time to understand how stories unfold and connect.',
  keywords: 'timeline, breaking news, investigations, events, chronology, news timeline',
};

export default async function TimelinesPage() {
  const timelineData = await getTimelineData();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Banner Ad */}
        <div className="mb-8">
          <BannerAd
            slot="timeline-header"
            className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50"
          />
        </div>

        {/* Main Content */}
        <Suspense fallback={<LoadingSpinner />}>
          <TimelineOverview
            featuredTimelines={timelineData.featuredTimelines}
            recentEvents={timelineData.recentEvents}
            milestoneEvents={timelineData.milestoneEvents}
            categories={timelineData.categories}
            stats={timelineData.stats}
          />
        </Suspense>

        {/* Bottom Banner Ad */}
        <div className="mt-12">
          <BannerAd
            slot="timeline-footer"
            className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50"
          />
        </div>
      </div>
    </div>
  );
}

// Enhanced data fetching function
async function getTimelineData(): Promise<{
  featuredTimelines: Timeline[];
  recentEvents: TimelineEvent[];
  milestoneEvents: TimelineEvent[];
  categories: TimelineCategory[];
  stats: {
    totalTimelines: number;
    totalEvents: number;
    totalMilestones: number;
    activeTimelines: number;
  };
}> {
  try {
    // Fetch all data in parallel for better performance
    const [featuredTimelines, recentEvents, milestoneEvents, categories, allTimelines] = await Promise.all([
      sanityFetch({
        query: queryFeaturedTimelines,
        tags: ['timeline'],
      }) as Promise<Timeline[]>,
      sanityFetch({
        query: queryRecentTimelineEvents,
        tags: ['timelineEvent'],
      }) as Promise<TimelineEvent[]>,
      sanityFetch({
        query: queryMilestoneEvents,
        tags: ['timelineEvent'],
      }) as Promise<TimelineEvent[]>,
      sanityFetch({
        query: queryTimelineCategories,
        tags: ['timelineCategory'],
      }) as Promise<TimelineCategory[]>,
      sanityFetch({
        query: queryAllTimelines,
        tags: ['timeline'],
      }) as Promise<Timeline[]>,
    ]);

    // Calculate statistics
    const stats = {
      totalTimelines: allTimelines.length,
      totalEvents: recentEvents.length, // This would need a separate query for accurate count
      totalMilestones: milestoneEvents.length,
      activeTimelines: allTimelines.filter(timeline => 
        !timeline.timeRange?.endDate || new Date(timeline.timeRange.endDate) > new Date()
      ).length,
    };

    return {
      featuredTimelines,
      recentEvents,
      milestoneEvents,
      categories,
      stats,
    };
  } catch (error) {
    console.error('Failed to fetch timeline data:', error);
    return {
      featuredTimelines: [],
      recentEvents: [],
      milestoneEvents: [],
      categories: [],
      stats: {
        totalTimelines: 0,
        totalEvents: 0,
        totalMilestones: 0,
        activeTimelines: 0,
      },
    };
  }
}
