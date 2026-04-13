/* eslint-disable react/function-component-definition */
// src/app/(user)/timeline/category/[slug]/page.tsx
import { Metadata } from 'next';
import { groq } from 'next-sanity';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Star } from 'lucide-react';

import TimelineEventCard from '@/components/timeline/TimelineEventCard';
import TimelineCard from '@/components/timeline/TimelineCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BannerAd, RectangleAd } from '@/components/ads';

import { sanityFetch } from '@/lib/sanity/lib/live';
import sanityClient from '@/lib/sanity/lib/client';
import { queryTimelineEventsByCategory, queryTimelinesByCategory } from '@/lib/sanity/lib/queries';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TimelineCategoryPage({ params }: Props) {
  const { slug } = await params;
  const categoryData = await getCategoryData(slug);

  if (!categoryData.category) {
    notFound();
  }

  const { category, events, timelines } = categoryData;

  const getCategoryColor = (color: string) => {
    const colorMap = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      pink: 'bg-pink-500',
      teal: 'bg-teal-500',
      gray: 'bg-gray-500',
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-500';
  };

  return (
    <div className='min-h-screen bg-white dark:bg-black'>
      <div className='container mx-auto px-4 py-8'>
        {/* Back Navigation */}
        <div className='mb-6'>
          <Link href='/timelines'>
            <Button variant='outline' className='flex items-center gap-2'>
              <ArrowLeft className='h-4 w-4' />
              Back to Timelines
            </Button>
          </Link>
        </div>

        {/* Category Header */}
        <div className='mb-8'>
          <div className='mb-4 flex items-center gap-4'>
            <div className={`h-6 w-6 rounded-full ${getCategoryColor(category.color)}`} />
            <h1 className='text-3xl font-bold text-slate-900 dark:text-slate-100 lg:text-4xl'>
              {category.title}
            </h1>
          </div>

          {category.description && (
            <p className='max-w-3xl text-lg text-slate-600 dark:text-slate-400'>
              {category.description}
            </p>
          )}

          {/* Category Stats */}
          <div className='mt-6 flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              <span>
                {timelines.length} timeline{timelines.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              <span>
                {events.length} event{events.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Star className='h-4 w-4' />
              <span>
                {events.filter((event) => event.isMilestone).length} milestone
                {events.filter((event) => event.isMilestone).length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Banner Ad */}
        <div className='mb-8'>
          <BannerAd
            slot='timeline-category-header'
            className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
          />
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* Main Content */}
          <div className='space-y-8 lg:col-span-2'>
            {/* Timelines in this Category */}
            {timelines.length > 0 && (
              <section>
                <h2 className='mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100'>
                  Timelines in {category.title}
                </h2>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  {timelines.map((timeline) => (
                    <TimelineCard
                      key={timeline._id}
                      timeline={timeline}
                      showAuthor={true}
                      showEventCount={true}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recent Events in this Category */}
            {events.length > 0 && (
              <section>
                <div className='mb-6 flex items-center justify-between'>
                  <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
                    Recent Events
                  </h2>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline' className='text-xs'>
                      {events.length} total events
                    </Badge>
                  </div>
                </div>

                <div className='space-y-4'>
                  {events.slice(0, 10).map((event) => (
                    <TimelineEventCard
                      key={event._id}
                      event={event}
                      variant='compact'
                      showAuthor={true}
                      showRelated={false}
                    />
                  ))}
                </div>

                {events.length > 10 && (
                  <div className='mt-6 text-center'>
                    <Button variant='outline'>Load More Events</Button>
                  </div>
                )}
              </section>
            )}

            {/* Milestone Events */}
            {events.filter((event) => event.isMilestone).length > 0 && (
              <section>
                <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-100'>
                  <Star className='h-6 w-6 text-yellow-500' />
                  Milestone Events
                </h2>
                <div className='space-y-4'>
                  {events
                    .filter((event) => event.isMilestone)
                    .slice(0, 5)
                    .map((event) => (
                      <TimelineEventCard
                        key={event._id}
                        event={event}
                        variant='default'
                        showAuthor={true}
                        showRelated={false}
                      />
                    ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Rectangle Ad */}
            <RectangleAd
              slot='timeline-category-sidebar'
              className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
            />

            {/* Category Details */}
            <div className='space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-900'>
              <h3 className='font-semibold text-slate-900 dark:text-slate-100'>
                Category Details
              </h3>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-slate-600 dark:text-slate-400'>Total Timelines</span>
                  <span className='font-medium'>{timelines.length}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600 dark:text-slate-400'>Total Events</span>
                  <span className='font-medium'>{events.length}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600 dark:text-slate-400'>Milestone Events</span>
                  <span className='font-medium'>
                    {events.filter((event) => event.isMilestone).length}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600 dark:text-slate-400'>Category Color</span>
                  <div className='flex items-center gap-2'>
                    <div className={`h-3 w-3 rounded-full ${getCategoryColor(category.color)}`} />
                    <span className='font-medium capitalize'>{category.color}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Categories */}
            {category.parentCategory && (
              <div className='rounded-lg bg-slate-50 p-4 dark:bg-slate-900'>
                <h3 className='mb-3 font-semibold text-slate-900 dark:text-slate-100'>
                  Parent Category
                </h3>
                <Link href={`/timeline/category/${category.parentCategory.slug.current}`}>
                  <div className='flex items-center gap-3 rounded p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800'>
                    <div
                      className={`h-3 w-3 rounded-full ${getCategoryColor(category.parentCategory.color)}`}
                    />
                    <span className='text-sm font-medium'>{category.parentCategory.title}</span>
                  </div>
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className='space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-900'>
              <h3 className='font-semibold text-slate-900 dark:text-slate-100'>Quick Actions</h3>
              <div className='space-y-2'>
                <Link href={`/timeline/create?category=${category.slug.current}`}>
                  <Button variant='outline' size='sm' className='w-full justify-start'>
                    Create Timeline in {category.title}
                  </Button>
                </Link>
                <Link href={`/timeline/event/create?category=${category.slug.current}`}>
                  <Button variant='outline' size='sm' className='w-full justify-start'>
                    Add Event to {category.title}
                  </Button>
                </Link>
                <Button variant='outline' size='sm' className='w-full justify-start'>
                  Subscribe to Updates
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoryData = await getCategoryData(slug);

  if (!categoryData.category) {
    return {
      title: 'Timeline Category Not Found - UnTelevised Media',
    };
  }

  const { category, events, timelines } = categoryData;
  const title = category.title;
  const description =
    category.description ??
    `Browse timelines and events in the ${category.title} category. ${timelines.length} timelines and ${events.length} events available.`;

  return {
    title: `${title} Timeline Category - UnTelevised Media`,
    description,
    keywords: `${category.title}, timeline category, events, news timeline`,
  };
}

// Fetch category data
async function getCategoryData(slug: string): Promise<{
  category: TimelineCategory | null;
  events: TimelineEvent[];
  timelines: Timeline[];
}> {
  try {
    // First get the category
    const categoryQuery = groq`*[_type=='timelineCategory' && slug.current == $slug][0] {
      ...,
      parentCategory->{
        _id,
        title,
        slug,
        color
      }
    }`;

    const { data: category } = await sanityFetch({
      query: categoryQuery,
      params: { slug },
      tags: ['timelineCategory'],
    });

    if (!category) {
      return { category: null, events: [], timelines: [] };
    }

    // Get events and timelines in parallel
    const [{ data: events }, { data: timelines }] = await Promise.all([
      sanityFetch({
        query: queryTimelineEventsByCategory,
        params: { categoryId: category._id },
        tags: ['timelineEvent'],
      }),
      sanityFetch({
        query: queryTimelinesByCategory,
        params: { categoryId: category._id },
        tags: ['timeline'],
      }),
    ]);

    return { category, events, timelines };
  } catch (error) {
    console.error('Failed to fetch category data:', error);
    return { category: null, events: [], timelines: [] };
  }
}

// Generate static params for the category list
export async function generateStaticParams() {
  const queryTimelineCategoryStaticParams = groq`*[_type=='timelineCategory' && isActive == true] { slug }`;
  // Use sanityClient directly to avoid draftMode() call during static generation
  const slugs: TimelineCategory[] = await sanityClient.fetch(queryTimelineCategoryStaticParams);
  const slugRoutes = slugs ? slugs.filter((item) => item?.slug?.current).map((item) => item.slug.current) : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
