/* eslint-disable react/function-component-definition */
// src/app/(user)/live-event/[slug]/page.tsx
import Image from 'next/image';
import { groq } from 'next-sanity';
import { PortableText } from '@portabletext/react';
import { RichTextComponents } from '@/components/providers/RichTextComponents';
import SocialShare from '@/components/global/SocialShare';

import urlForImage from '@/u/urlForImage';
import EventMap from '@/components/post/EventMap';
import { SourcesPanel } from '@/components/post/SourcesPanel';

import ClientSideRoute from '@/components/providers/ClientSideRoute';
import formatDate from '@/util/formatDate';
import ClientTimeDisplay from '@/components/ui/ClientTimeDisplay';
import resolveHref from '@/util/resolveHref';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanityFetch } from '@/lib/sanity/lib/live';
import sanityClient from '@/lib/sanity/lib/client';
import { queryEventBySlug } from '@/lib/sanity/lib/queries';
import { buildLiveEventMetadata, getSanityOgImageUrl } from '@/util/metadata';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: liveEvent } = await sanityFetch({ query: queryEventBySlug, params: { slug }, tags: ['liveEvent'] });
  if (!liveEvent) return { title: 'Live Event Not Found' };
  return buildLiveEventMetadata(liveEvent, slug);
}

export default async function LiveEvent({ params }: Props) {
  const { slug } = await params;
  const liveEvent = await getEventBySlug(slug);
  if (!liveEvent) notFound();

  const allEvents = [
    // Check if liveEvent.relatedArticles is an array. If Truthy map over it and return an array of objects with the source property set to the source of the related article.
    ...(Array.isArray(liveEvent.relatedArticles)
      ? liveEvent.relatedArticles.map((article) => ({
          ...article,
          source: 'relatedArticles',
        }))
      : []),
    // Check if liveEvent.keyEvent is an array. If Truthy map over it and return an array of objects with the source property set to the source of the key event.
    ...(Array.isArray(liveEvent.keyEvent)
      ? liveEvent.keyEvent.map((event) => ({
          ...event,
          source: 'keyEvent',
        }))
      : []),
  ];

  // Sort the allEvents array based on the eventDate property
  allEvents.sort((a, b) => {
    // Check if either eventDate is not a valid date
    if (isNaN(Date.parse(a.eventDate)) || isNaN(Date.parse(b.eventDate))) {
      // If both dates are invalid, return 0 to indicate no change in order. This prevents sorting based on invalid dates
      return 0;
    }
    // Compare the eventDate strings directly to determine the order
    return a.eventDate > b.eventDate ? -1 : a.eventDate < b.eventDate ? 1 : 0;
  });

  const schemaEventStatusMap: Record<string, string> = {
    EventScheduled: 'https://schema.org/EventScheduled',
    EventCancelled: 'https://schema.org/EventCancelled',
    EventPostponed: 'https://schema.org/EventPostponed',
    EventMovedOnline: 'https://schema.org/EventMovedOnline',
  };

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: liveEvent.title,
    description: liveEvent.description,
    startDate: liveEvent.eventDate,
    endDate: liveEvent.endDate ?? undefined,
    eventStatus: liveEvent.eventStatus
      ? (schemaEventStatusMap[liveEvent.eventStatus] ?? 'https://schema.org/EventScheduled')
      : liveEvent.isCurrentEvent
        ? 'https://schema.org/EventScheduled'
        : 'https://schema.org/EventCompleted',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    location: liveEvent.location
      ? { '@type': 'Place', name: liveEvent.location }
      : { '@type': 'VirtualLocation', url: `https://www.untelevised.media/live-event/${slug}/` },
    image: getSanityOgImageUrl(liveEvent.mainImage),
    organizer: {
      '@type': 'NewsMediaOrganization',
      '@id': 'https://www.untelevised.media/#organization',
      name: 'UnTelevised Media',
      url: 'https://www.untelevised.media',
    },
    url: `https://www.untelevised.media/live-event/${slug}/`,
  };

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <hr className='mx-auto mb-8 max-w-[95wv] border-untele md:max-w-[85vw]' />
      <article className='mx-auto max-w-[95vw] pb-28 md:max-w-[85vw] lg:px-10'>
        {/* Top Section: Image, Title, Date, Description  */}
        <section className='flex flex-col space-x-4 text-slate-700 lg:flex-row'>
          {/* Image  */}
          <div className='h-auto min-w-max xl:w-full'>
            <Image
              src={
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                urlForImage(liveEvent.mainImage as any)?.url() ?? ''
              }
              alt='Image Description'
              style={{
                width: '100%',
                height: 'auto',
              }}
              width={550}
              height={475}
              className='rounded-lg'
            />
          </div>

          {/* Info Block  */}
          <div className='flex w-full flex-col space-y-2 py-2'>
            {/* Title & Date */}
            <div className='flex w-full flex-col space-y-1'>
              <div className='flex flex-wrap items-center gap-2'>
                {liveEvent.isCurrentEvent && (
                  <span className='animate-pulse rounded bg-untele px-3 py-1 text-sm font-bold uppercase tracking-widest text-slate-200'>
                    Live
                  </span>
                )}
                {liveEvent.eventStatus && liveEvent.eventStatus !== 'EventScheduled' && (
                  <span className={`rounded px-3 py-1 text-xs font-black uppercase tracking-widest text-white ${
                    liveEvent.eventStatus === 'EventCancelled'
                      ? 'bg-red-700'
                      : liveEvent.eventStatus === 'EventPostponed'
                        ? 'bg-amber-600'
                        : 'bg-blue-600'
                  }`}>
                    {liveEvent.eventStatus === 'EventCancelled'
                      ? 'Cancelled'
                      : liveEvent.eventStatus === 'EventPostponed'
                        ? 'Postponed'
                        : 'Moved Online'}
                  </span>
                )}
              </div>
              <h1 className='w-full text-3xl font-bold'>{liveEvent.title}</h1>
              {liveEvent.subtitle && (
                <p className='text-lg text-slate-500 dark:text-slate-400'>{liveEvent.subtitle}</p>
              )}

              {/* Location & Dates */}
              <div className='flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400'>
                {liveEvent.location && <span>📍 {liveEvent.location}</span>}
                <span>{formatDate(liveEvent.eventDate || liveEvent._createdAt)}</span>
                {liveEvent.endDate && (
                  <span>– {formatDate(liveEvent.endDate)}</span>
                )}
              </div>
            </div>
            {/* Description  */}
            <div className='w-full'>
              <p className='w-full italic lg:text-xs xl:text-base'>{liveEvent.description}</p>
            </div>
          </div>
        </section>

        <SocialShare
          url={`https://untelevised.media/live-event/${slug}`}
          title={liveEvent.title}
        />

        <div className='flex flex-col items-center justify-center space-x-4'>
          {/* Coverage Video  */}
          <div className='my-4 flex items-center justify-center'>
            <iframe
              width='720'
              height='420'
              className='rounded-lg border border-untele bg-slate-700/30'
              src={`${liveEvent.videoLink}`}
              title='YouTube video player'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen'
            />
          </div>

          <EventMap />
        </div>
        <section className='mt-12 flex flex-col space-y-4 lg:flex-row lg:space-x-5 lg:space-y-0'>
          {/* Timeline */}
          <div className='h-full lg:w-3/5'>
            {allEvents.length > 0 ? (
              <ul>
                {allEvents.map((event) => (
                  <li
                    key={event._id}
                    className='mb-3 flex flex-col rounded-lg border border-untele bg-slate-700/30 px-6 py-3'
                  >
                    <div className='flex flex-col space-y-1'>
                      <h3 className='text-base font-bold underline'>{event.title}</h3>
                      <ClientTimeDisplay
                        eventDate={event.eventDate}
                        showRelativeTime={true}
                        className='text-sm text-untele/70'
                      />
                      {event.source === 'relatedArticles' ? (
                        <>
                          <p>{event.description as string}</p>
                          <ClientSideRoute
                            route={resolveHref('article', event.slug?.current) ?? ''}
                          >
                            <button className='cursor-pointer self-end rounded-md border border-untele/40 bg-slate-700/30 px-3 py-1 font-bold text-untele/60 underline hover:text-blue-700 hover:opacity-80'>
                              Read More
                            </button>
                          </ClientSideRoute>
                        </>
                      ) : (
                        <PortableText
                          value={event.description as Block[]}
                          components={RichTextComponents}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='mb-3 flex flex-col rounded-lg border border-untele bg-slate-700/30 px-6 py-3 text-slate-700'>
                No events available at the moment. Please check back shortly.
              </p>
            )}
          </div>
          {/* Developments / Story */}
          <div className='mx-auto h-min rounded-lg border border-untele bg-slate-700/30 px-10 py-5 md:max-w-[70vw] lg:w-2/5'>
            <PortableText value={liveEvent.body} components={RichTextComponents} />
            <SourcesPanel sources={liveEvent.sources} methodology={liveEvent.methodology} />
          </div>
        </section>
      </article>
    </>
  );
}

// Call the Sanity Fetch Function for the Article by Slug
async function getEventBySlug(slug: string): Promise<LiveEvent | null> {
  try {
    // Fetch article data from Sanity
    const { data: post } = await sanityFetch({
      query: queryEventBySlug,
      params: { slug },
      tags: ['liveEvent'],
    });
    return post;
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
}

// // Generate the static params for the list of Live Events
export async function generateStaticParams() {
  const queryLiveEventStaticParams = groq`*[_type=='liveEvent'] { slug }`;
  // Use sanityClient directly to avoid draftMode() call during static generation
  const slugs: LiveEvent[] = await sanityClient.fetch(queryLiveEventStaticParams);
  const slugRoutes = slugs ? slugs.filter((item) => item?.slug?.current).map((item) => item.slug.current) : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
