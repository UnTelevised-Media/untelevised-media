/* eslint-disable react/function-component-definition */
// src/app/(user)/timeline/event/[slug]/page.tsx
import { Metadata } from 'next';
import { groq } from 'next-sanity';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  ArrowLeft,
  ExternalLink,
  Users,
  AlertTriangle,
  Search,
} from 'lucide-react';

import { RichTextComponents } from '@/components/providers/RichTextComponents';
import SocialShare from '@/components/global/SocialShare';
import TimelineEventCard from '@/components/timeline/TimelineEventCard';
import { FeaturedArticleCard } from '@/components/cards/ArticleCards';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RectangleAd, BannerAd } from '@/components/ads';

import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryTimelineEventBySlug } from '@/lib/sanity/lib/queries';
import sanityClient from '@/lib/sanity/lib/client';
import urlForImage from '@/util/urlForImage';
import formatDate from '@/util/formatDate';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TimelineEventPage({ params }: Props) {
  const { slug } = await params;
  const event = await getTimelineEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'breaking':
        return <AlertTriangle className='h-5 w-5' />;
      case 'investigation':
        return <Search className='h-5 w-5' />;
      case 'live':
        return <Clock className='h-5 w-5' />;
      default:
        return <Calendar className='h-5 w-5' />;
    }
  };

  const getImportanceColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800';
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800';
    }
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

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* Main Content */}
          <div className='space-y-8 lg:col-span-2'>
            {/* Event Header */}
            <div className='space-y-6'>
              {/* Badges */}
              <div className='flex flex-wrap items-center gap-2'>
                {event.isMilestone && (
                  <Badge className='flex items-center gap-1 bg-yellow-500 text-yellow-900'>
                    <Star className='h-3 w-3' />
                    Milestone Event
                  </Badge>
                )}
                <Badge
                  variant={event.importanceLevel === 'critical' ? 'destructive' : 'secondary'}
                  className={`capitalize ${getImportanceColor(event.importanceLevel)}`}
                >
                  {event.importanceLevel} Importance
                </Badge>
                <Badge variant='outline' className='flex items-center gap-1 capitalize'>
                  {getEventTypeIcon(event.eventType)}
                  {event.eventType}
                </Badge>
              </div>

              {/* Title */}
              <h1 className='text-3xl font-bold text-slate-900 dark:text-slate-100 lg:text-4xl'>
                {event.title}
              </h1>

              {/* Event Meta */}
              <div className='flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  <span>{formatDate(event.eventDate)}</span>
                  {event.endDate && <span> - {formatDate(event.endDate)}</span>}
                </div>

                {event.location && (
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4' />
                    <span>{event.location}</span>
                  </div>
                )}

                {event.author && (
                  <div className='flex items-center gap-2'>
                    <Users className='h-4 w-4' />
                    <span>By {event.author.name}</span>
                  </div>
                )}
              </div>

              {/* Categories */}
              {event.timelineCategories && event.timelineCategories.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {event.timelineCategories.map((category) => (
                    <Link key={category._id} href={`/timeline/category/${category.slug.current}`}>
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

              {/* Social Share */}
              <SocialShare url={`/timeline/event/${event.slug.current}`} title={event.title} />
            </div>

            {/* Main Image */}
            {event.mainImage && (
              <div className='relative aspect-video overflow-hidden rounded-lg'>
                <Image
                  src={urlForImage(event.mainImage)?.url() ?? ''}
                  alt={event.mainImage.alt ?? event.title}
                  fill
                  className='object-cover'
                  priority
                />
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className='prose prose-lg prose-slate dark:prose-invert max-w-none'>
                <p className='text-lg leading-relaxed'>{event.description}</p>
              </div>
            )}

            {/* Banner Ad */}
            <BannerAd
              slot='timeline-event-content'
              className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
            />

            {/* Detailed Description */}
            {event.detailedDescription && (
              <div className='prose prose-slate dark:prose-invert max-w-none'>
                <PortableText value={event.detailedDescription} components={RichTextComponents} />
              </div>
            )}

            {/* Media Attachments */}
            {event.mediaAttachments && event.mediaAttachments.length > 0 && (
              <div className='space-y-4'>
                <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
                  Media Gallery
                </h2>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {event.mediaAttachments.map((media, index) => (
                    <div key={index} className='space-y-2'>
                      {media._type === 'image' ? (
                        <div className='relative aspect-video overflow-hidden rounded-lg'>
                          <Image
                            src={urlForImage(media)?.url() ?? ''}
                            alt={media.alt ?? `Media ${index + 1}`}
                            fill
                            className='object-cover'
                          />
                        </div>
                      ) : media._type === 'video' ? (
                        <div className='flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800'>
                          <a
                            href={media.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-2 text-slate-600 hover:text-untele dark:text-slate-400'
                          >
                            <ExternalLink className='h-5 w-5' />
                            <span>{media.title ?? 'Watch Video'}</span>
                          </a>
                        </div>
                      ) : null}
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(media as any).caption && (
                        <p className='text-sm text-slate-600 dark:text-slate-400'>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(media as any).caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            {event.externalLinks && event.externalLinks.length > 0 && (
              <div className='space-y-4'>
                <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
                  External Resources
                </h2>
                <div className='space-y-3'>
                  {event.externalLinks.map((link, index) => (
                    <div
                      key={index}
                      className='rounded-lg border border-slate-200 p-4 dark:border-slate-700'
                    >
                      <a
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='group flex items-start gap-3'
                      >
                        <ExternalLink className='mt-0.5 h-5 w-5 text-slate-400 group-hover:text-untele' />
                        <div>
                          <h3 className='font-medium text-slate-900 group-hover:text-untele dark:text-slate-100'>
                            {link.title}
                          </h3>
                          {link.description && (
                            <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
                              {link.description}
                            </p>
                          )}
                          <p className='mt-1 text-xs text-slate-500 dark:text-slate-500'>
                            {new URL(link.url).hostname}
                          </p>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Rectangle Ad */}
            <RectangleAd
              slot='timeline-event-sidebar'
              className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
            />

            {/* Event Details */}
            <div className='space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-900'>
              <h3 className='font-semibold text-slate-900 dark:text-slate-100'>Event Details</h3>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-slate-600 dark:text-slate-400'>Event Type</span>
                  <span className='font-medium capitalize'>{event.eventType}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600 dark:text-slate-400'>Importance</span>
                  <span className='font-medium capitalize'>{event.importanceLevel}</span>
                </div>
                {event.location && (
                  <div className='flex justify-between'>
                    <span className='text-slate-600 dark:text-slate-400'>Location</span>
                    <span className='font-medium'>{event.location}</span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span className='text-slate-600 dark:text-slate-400'>Published</span>
                  <span className='font-medium'>
                    {event.publishedAt ? formatDate(event.publishedAt) : 'Draft'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className='space-y-3'>
                <h3 className='font-semibold text-slate-900 dark:text-slate-100'>Tags</h3>
                <div className='flex flex-wrap gap-2'>
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant='outline' className='text-xs'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Related Timeline Events */}
            {event.relatedTimelineEvents && event.relatedTimelineEvents.length > 0 && (
              <div className='space-y-3'>
                <h3 className='font-semibold text-slate-900 dark:text-slate-100'>
                  Related Events
                </h3>
                <div className='space-y-3'>
                  {event.relatedTimelineEvents.slice(0, 3).map((relatedEvent) => (
                    <TimelineEventCard
                      key={relatedEvent._id}
                      event={relatedEvent}
                      variant='compact'
                      showAuthor={false}
                      showRelated={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Articles */}
        {event.relatedArticles && event.relatedArticles.length > 0 && (
          <div className='mt-12 space-y-6'>
            <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              Related Articles
            </h2>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {event.relatedArticles.slice(0, 6).map((article) => (
                <FeaturedArticleCard key={article._id} article={article} />
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
  const event = await getTimelineEventBySlug(slug);

  if (!event) {
    return {
      title: 'Timeline Event Not Found - UnTelevised Media',
    };
  }

  const title = event.title;
  const description = event.description ?? '';

  return {
    title: `${title} - Timeline Event - UnTelevised Media`,
    description,
    keywords: event.keywords ?? event.tags?.join(', ') ?? '',
    openGraph: {
      title,
      description,
      images: event.mainImage ? [urlForImage(event.mainImage)?.url() ?? ''] : [],
    },
  };
}

// Fetch timeline event data by slug
async function getTimelineEventBySlug(slug: string): Promise<TimelineEvent | null> {
  try {
    const event: TimelineEvent = await sanityFetch({
      query: queryTimelineEventBySlug,
      params: { slug },
      tags: ['timelineEvent'],
    });
    return event;
  } catch (error) {
    console.error('Failed to fetch timeline event:', error);
    return null;
  }
}

// Generate static params for the timeline event list
export async function generateStaticParams() {
  const query = groq`*[_type=='timelineEvent' && isPublished == true] { slug }`;
  const slugs: TimelineEvent[] = await sanityClient.fetch(query);
  const slugRoutes = slugs ? slugs.map((slug) => slug.slug.current) : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
