/* eslint-disable react/function-component-definition */
// src/app/(user)/timeline/[slug]/page.tsx
import { Metadata } from 'next';
import { groq } from 'next-sanity';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { Calendar, Clock, Users, Star, ArrowLeft, Bookmark } from 'lucide-react';

import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/global/LoadingSpinner';

// Defer framer-motion heavy timeline visualization — only needed after page load
const TimelineJSVisualization = dynamic(
  () => import('@/components/timeline/TimelineJSVisualization'),
  { loading: () => <LoadingSpinner /> },
);
import { RichTextComponents } from '@/components/providers/RichTextComponents';
import SocialShare from '@/components/global/SocialShare';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RectangleAd, BannerAd } from '@/components/ads';

import { sanityFetch } from '@/lib/sanity/lib/live';
import sanityClient from '@/lib/sanity/lib/client';
import { queryTimelineBySlug } from '@/lib/sanity/lib/queries';
import urlForImage from '@/util/urlForImage';
import formatDate from '@/util/formatDate';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TimelinePage({ params }: Props) {
  const { slug } = await params;
  const timeline = await getTimelineBySlug(slug);

  if (!timeline) {
    notFound();
  }

  const events = timeline.events ?? [];
  const categories = timeline.categories ?? [];

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: timeline.title,
    description: timeline.shortDescription ?? undefined,
    url: `https://www.untelevised.media/timeline/${slug}/`,
    numberOfItems: events.length,
    itemListElement: events.map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: event.title,
      ...(event.eventDate ? { url: `https://www.untelevised.media/timeline/${slug}/#event-${index + 1}` } : {}),
    })),
  };

  return (
    <div className='min-h-screen bg-white dark:bg-black'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
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

        {/* Timeline Header */}
        <div className='mb-8'>
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
            {/* Main Content */}
            <div className='space-y-6 lg:col-span-2'>
              {/* Title and Meta */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2'>
                  {timeline.isFeatured && (
                    <Badge className='flex items-center gap-1 bg-yellow-500 text-yellow-900'>
                      <Star className='h-3 w-3' />
                      Featured
                    </Badge>
                  )}
                  <Badge variant='secondary' className='capitalize'>
                    {timeline.timelineType}
                  </Badge>
                </div>

                <h1 className='text-3xl font-bold text-slate-900 dark:text-slate-100 lg:text-4xl'>
                  {timeline.title}
                </h1>

                {timeline.shortDescription && (
                  <p className='text-lg text-slate-600 dark:text-slate-400'>
                    {timeline.shortDescription}
                  </p>
                )}

                {/* Timeline Meta */}
                <div className='flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400'>
                  {timeline.timeRange?.startDate && (
                    <div className='flex items-center gap-1'>
                      <Calendar className='h-4 w-4' />
                      <span>
                        {formatDate(timeline.timeRange.startDate)}
                        {timeline.timeRange.endDate &&
                          ` - ${formatDate(timeline.timeRange.endDate)}`}
                        {!timeline.timeRange.endDate && ' - Ongoing'}
                      </span>
                    </div>
                  )}

                  <div className='flex items-center gap-1'>
                    <Clock className='h-4 w-4' />
                    <span>
                      {events.length} event{events.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {timeline.author && (
                    <div className='flex items-center gap-1'>
                      <Users className='h-4 w-4' />
                      <span>By {timeline.author.name}</span>
                      {timeline.collaborators && timeline.collaborators.length > 0 && (
                        <span>+{timeline.collaborators.length} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {categories.map((category) => (
                      <Link
                        key={category._id}
                        href={`/timeline/category/${category.slug.current}`}
                      >
                        <Badge
                          variant='outline'
                          className='hover:bg-slate-100 dark:hover:bg-slate-800'
                        >
                          {category.title}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className='flex items-center gap-4'>
                  <SocialShare url={`/timeline/${timeline.slug.current}`} title={timeline.title} />
                  <Button variant='outline' size='sm' className='flex items-center gap-2'>
                    <Bookmark className='h-4 w-4' />
                    Save Timeline
                  </Button>
                </div>
              </div>

              {/* Description */}
              {timeline.description && (
                <div className='prose prose-slate dark:prose-invert max-w-none'>
                  <PortableText value={timeline.description} components={RichTextComponents} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Cover Image */}
              {timeline.coverImage && (
                <div className='relative aspect-video overflow-hidden rounded-lg'>
                  <Image
                    src={urlForImage(timeline.coverImage)?.url() ?? ''}
                    alt={timeline.coverImage.alt ?? timeline.title}
                    fill
                    className='object-cover'
                  />
                </div>
              )}

              {/* Rectangle Ad */}
              <RectangleAd
                slot='timeline-sidebar'
                className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
              />

              {/* Quick Stats */}
              <div className='space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-900'>
                <h3 className='font-semibold text-slate-900 dark:text-slate-100'>
                  Timeline Stats
                </h3>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-slate-600 dark:text-slate-400'>Total Events</span>
                    <span className='font-medium'>{events.length}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-600 dark:text-slate-400'>Milestones</span>
                    <span className='font-medium'>
                      {events.filter((event) => event.isMilestone).length}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-600 dark:text-slate-400'>Time Span</span>
                    <span className='font-medium'>
                      {timeline.timeRange?.startDate && timeline.timeRange?.endDate
                        ? `${Math.ceil((new Date(timeline.timeRange.endDate).getTime() - new Date(timeline.timeRange.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                        : 'Ongoing'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Ad */}
        <div className='mb-8'>
          <BannerAd
            slot='timeline-content'
            className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
          />
        </div>

        {/* TimelineJS Visualization */}
        <div className='mb-8'>
          <TimelineJSVisualization
            timeline={timeline}
            events={events}
            height='700px'
            options={{
              hash_bookmark: true,
              default_bg_color: 'white',
              scale_factor: 2,
              initial_zoom: 2,
              timenav_position: 'bottom',
              start_at_slide: 0,
              language: 'en',
            }}
          />
        </div>

        {/* Related Content */}
        {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
        {(timeline.author || timeline.collaborators?.length) && (
          <div className='mt-12 rounded-lg bg-slate-50 p-6 dark:bg-slate-900'>
            <h3 className='mb-4 text-xl font-bold text-slate-900 dark:text-slate-100'>
              Timeline Contributors
            </h3>
            <div className='space-y-4'>
              {timeline.author && (
                <div className='flex items-center gap-3'>
                  {timeline.author.image && (
                    <div className='relative h-12 w-12 overflow-hidden rounded-full'>
                      <Image
                        src={urlForImage(timeline.author.image)?.url() ?? ''}
                        alt={timeline.author.name}
                        fill
                        className='object-cover'
                      />
                    </div>
                  )}
                  <div>
                    <h4 className='font-medium text-slate-900 dark:text-slate-100'>
                      {timeline.author.name}
                    </h4>
                    <p className='text-sm text-slate-600 dark:text-slate-400'>
                      {timeline.author.title ?? 'Timeline Author'}
                    </p>
                  </div>
                </div>
              )}

              {timeline.collaborators?.map((collaborator) => (
                <div key={collaborator._id} className='flex items-center gap-3'>
                  {collaborator.image && (
                    <div className='relative h-10 w-10 overflow-hidden rounded-full'>
                      <Image
                        src={urlForImage(collaborator.image)?.url() ?? ''}
                        alt={collaborator.name}
                        fill
                        className='object-cover'
                      />
                    </div>
                  )}
                  <div>
                    <h5 className='font-medium text-slate-900 dark:text-slate-100'>
                      {collaborator.name}
                    </h5>
                    <p className='text-sm text-slate-600 dark:text-slate-400'>Collaborator</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const timeline = await getTimelineBySlug(slug);

  if (!timeline) {
    return {
      title: 'Timeline Not Found - UnTelevised Media',
    };
  }

  const title = timeline.seoSettings?.metaTitle ?? timeline.title;
  const description =
    timeline.seoSettings?.metaDescription ??
    timeline.shortDescription ??
    timeline.description?.[0]?.children?.[0]?.text ??
    '';

  return {
    title: `${title} - UnTelevised Media`,
    description,
    keywords: timeline.seoSettings?.keywords ?? timeline.tags?.join(', ') ?? '',
    openGraph: {
      title,
      description,
      images: timeline.coverImage ? [urlForImage(timeline.coverImage)?.url() ?? ''] : [],
    },
  };
}

// Fetch timeline data by slug
async function getTimelineBySlug(slug: string): Promise<Timeline | null> {
  try {
    const { data: timeline } = await sanityFetch({
      query: queryTimelineBySlug,
      params: { slug },
      tags: ['timeline'],
    });
    return timeline;
  } catch (error) {
    console.error('Failed to fetch timeline:', error);
    return null;
  }
}

// Generate static params for the timeline list
export async function generateStaticParams() {
  const queryTimelineStaticParams = groq`*[_type=='timeline' && isPublished == true] { slug }`;
  // Use sanityClient directly to avoid draftMode() call during static generation
  const slugs: Timeline[] = await sanityClient.fetch(queryTimelineStaticParams);
  const slugRoutes = slugs ? slugs.map((slug) => slug.slug.current) : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
