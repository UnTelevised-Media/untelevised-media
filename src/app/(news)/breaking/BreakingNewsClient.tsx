'use client';

import React, { Fragment, useState } from 'react';
import Image from 'next/image';

import urlForImage from '@/util/urlForImage';

import ClientSideRoute from '@/components/providers/ClientSideRoute';
import formatDate from '@/util/formatDate';
import resolveHref from '@/util/resolveHref';
import { InFeedAd, AD_CONFIG } from '@/components/ads';

interface LiveEvent {
  _id: string;
  _createdAt: string;
  title: string;
  description?: string;
  subtitle?: string;
  mainImage?: unknown;
  slug?: { current: string };
  eventDate?: string;
  endDate?: string;
  eventStatus?: string;
  isCurrentEvent?: boolean;
  location?: string;
}

interface Article {
  _id: string;
  _createdAt: string;
  title: string;
  description?: string;
  mainImage?: unknown;
  slug?: { current: string };
  publishedAt?: string;
}

interface Props {
  initialEvents: LiveEvent[];
  initialArticles: Article[];
}

export default function BreakingNewsClient({ initialEvents, initialArticles }: Props) {
  const [viewMode, setViewMode] = useState<'bars' | 'cards'>('bars');

  const allItems = React.useMemo(() => {
    const items = [
      ...initialEvents.map((event) => ({ ...event, type: 'liveEvent' as const })),
      ...initialArticles.map((article) => ({ ...article, type: 'article' as const })),
    ];

    items.sort((a, b) => {
      const dateA =
        a.type === 'liveEvent'
          ? new Date(a.eventDate || a._createdAt)
          : new Date(a.publishedAt || a._createdAt);
      const dateB =
        b.type === 'liveEvent'
          ? new Date(b.eventDate || b._createdAt)
          : new Date(b.publishedAt || b._createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    return items;
  }, [initialEvents, initialArticles]);

  return (
    <>
      <hr className='mx-auto mb-8 max-w-6xl border-untele' />
      <article className='mx-auto max-w-6xl px-4 pb-28'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-4xl font-bold'>Breaking News</h1>
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
        {allItems.length > 0 ? (
          viewMode === 'cards' ? (
            <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
              {allItems.map((item, index) => (
                <Fragment key={item._id}>
                  <BreakingCard item={item} />
                  {(index + 1) % 6 === 0 && index < allItems.length - 1 && (
                    <div className='md:col-span-2 xl:col-span-3'>
                      <InFeedAd
                        slot={AD_CONFIG.AD_SLOTS.BREAKING_IN_FEED}
                        className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
                      />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          ) : (
            <ul className='space-y-6'>
              {allItems.map((item, index) => (
                <Fragment key={item._id}>
                  <BreakingBar item={item} />
                  {(index + 1) % 6 === 0 && index < allItems.length - 1 && (
                    <li>
                      <InFeedAd
                        slot={AD_CONFIG.AD_SLOTS.BREAKING_IN_FEED}
                        className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
                      />
                    </li>
                  )}
                </Fragment>
              ))}
            </ul>
          )
        ) : (
          <p className='text-center text-slate-400'>
            No breaking news or active events at the moment.
          </p>
        )}
      </article>
    </>
  );
}

// View Toggle Component
const ViewToggle: React.FC<{
  viewMode: 'bars' | 'cards';
  setViewMode: (mode: 'bars' | 'cards') => void;
}> = ({ viewMode, setViewMode }) => {
  return (
    <div className='flex rounded-lg border border-slate-600 bg-slate-800/50 p-1'>
      <button
        onClick={() => setViewMode('bars')}
        className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
          viewMode === 'bars' ? 'bg-untele text-white' : 'text-slate-400 hover:text-white'
        }`}
      >
        Bars
      </button>
      <button
        onClick={() => setViewMode('cards')}
        className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
          viewMode === 'cards' ? 'bg-untele text-white' : 'text-slate-400 hover:text-white'
        }`}
      >
        Cards
      </button>
    </div>
  );
};

// Breaking Bar Component (List View)
const BreakingBar: React.FC<{ item: any }> = ({ item }) => (
  <li className='rounded-lg border border-untele bg-slate-700/30 p-6'>
    <div className='flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0'>
      {/* Image */}
      {item.mainImage && (
        <div className='flex-shrink-0'>
          <Image
            src={urlForImage(item.mainImage)?.url() ?? ''}
            alt={item.title}
            width={300}
            height={200}
            className='rounded-lg object-cover'
          />
        </div>
      )}
      {/* Content */}
      <div className='flex flex-col space-y-2'>
        <div className='flex items-center gap-2'>
          {item.type === 'liveEvent' && item.isCurrentEvent && (
            <span className='animate-pulse rounded bg-untele px-3 py-1 text-sm font-bold uppercase tracking-widest text-slate-200'>
              Live
            </span>
          )}
          {item.type === 'article' && (
            <span className='rounded bg-red-600 px-3 py-1 text-sm font-bold uppercase tracking-widest text-white'>
              Breaking
            </span>
          )}
          {item.type === 'liveEvent' &&
            item.eventStatus &&
            item.eventStatus !== 'EventScheduled' && (
              <span
                className={`rounded px-3 py-1 text-xs font-black uppercase tracking-widest text-white ${
                  item.eventStatus === 'EventCancelled'
                    ? 'bg-red-700'
                    : item.eventStatus === 'EventPostponed'
                      ? 'bg-amber-600'
                      : 'bg-blue-600'
                }`}
              >
                {item.eventStatus === 'EventCancelled'
                  ? 'Cancelled'
                  : item.eventStatus === 'EventPostponed'
                    ? 'Postponed'
                    : 'Moved Online'}
              </span>
            )}
        </div>
        <h2 className='text-2xl font-bold'>{item.title}</h2>
        {item.subtitle && <p className='text-lg text-slate-400'>{item.subtitle}</p>}
        <p className='text-slate-300'>{item.description}</p>
        <div className='flex flex-wrap gap-3 text-sm text-slate-400'>
          {item.type === 'liveEvent' && item.location && <span>📍 {item.location}</span>}
          <span>
            {item.type === 'liveEvent'
              ? formatDate(item.eventDate || item._createdAt)
              : formatDate(item.publishedAt || item._createdAt)}
          </span>
          {item.type === 'liveEvent' && item.endDate && <span>– {formatDate(item.endDate)}</span>}
        </div>
        <ClientSideRoute
          route={
            item.type === 'liveEvent'
              ? (resolveHref('live-event', item.slug?.current) ?? '')
              : (resolveHref('article', item.slug?.current) ?? '')
          }
        >
          <button className='self-start rounded-md border border-untele/40 bg-slate-700/30 px-4 py-2 font-bold text-untele/60 underline hover:text-blue-700 hover:opacity-80'>
            Read More
          </button>
        </ClientSideRoute>
      </div>
    </div>
  </li>
);

// Breaking Card Component (Grid View)
const BreakingCard: React.FC<{ item: any }> = ({ item }) => (
  <ClientSideRoute
    route={
      item.type === 'liveEvent'
        ? (resolveHref('live-event', item.slug?.current) ?? '')
        : (resolveHref('article', item.slug?.current) ?? '')
    }
  >
    <article className='group relative h-full cursor-pointer overflow-hidden rounded-xl border border-slate-600/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-untele/50 hover:shadow-2xl'>
      {/* Image Section */}
      <div className='relative aspect-video overflow-hidden'>
        <Image
          src={urlForImage(item.mainImage)?.url() ?? ''}
          alt={item.title}
          fill
          className='object-cover transition-transform duration-500 group-hover:scale-110'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />

        {/* Overlay gradient */}
        <div className='absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent' />

        {/* Badges */}
        <div className='absolute left-4 top-4 flex flex-wrap gap-2'>
          {item.type === 'liveEvent' && item.isCurrentEvent && (
            <span className='animate-pulse rounded bg-untele px-2 py-1 text-xs font-bold uppercase tracking-widest text-slate-200'>
              Live
            </span>
          )}
          {item.type === 'article' && (
            <span className='rounded bg-red-600 px-2 py-1 text-xs font-bold uppercase tracking-widest text-white'>
              Breaking
            </span>
          )}
          {item.type === 'liveEvent' &&
            item.eventStatus &&
            item.eventStatus !== 'EventScheduled' && (
              <span
                className={`rounded px-2 py-1 text-xs font-black uppercase tracking-widest text-white ${
                  item.eventStatus === 'EventCancelled'
                    ? 'bg-red-700'
                    : item.eventStatus === 'EventPostponed'
                      ? 'bg-amber-600'
                      : 'bg-blue-600'
                }`}
              >
                {item.eventStatus === 'EventCancelled'
                  ? 'Cancelled'
                  : item.eventStatus === 'EventPostponed'
                    ? 'Postponed'
                    : 'Moved Online'}
              </span>
            )}
        </div>
      </div>

      {/* Content */}
      <div className='p-6'>
        <h2 className='mb-2 text-xl font-bold text-white transition-colors group-hover:text-untele'>
          {item.title}
        </h2>
        {item.subtitle && <p className='mb-2 text-sm text-slate-400'>{item.subtitle}</p>}
        <p className='mb-4 line-clamp-3 text-sm text-slate-300'>{item.description}</p>
        <div className='flex flex-wrap gap-2 text-xs text-slate-400'>
          {item.type === 'liveEvent' && item.location && <span>📍 {item.location}</span>}
          <span>
            {item.type === 'liveEvent'
              ? formatDate(item.eventDate || item._createdAt)
              : formatDate(item.publishedAt || item._createdAt)}
          </span>
          {item.type === 'liveEvent' && item.endDate && <span>– {formatDate(item.endDate)}</span>}
        </div>
      </div>
    </article>
  </ClientSideRoute>
);
