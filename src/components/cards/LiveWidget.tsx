/* eslint-disable react/function-component-definition */
import React from 'react';
import ClientSideRoute from '../providers/ClientSideRoute';
import Image from 'next/image';
import urlForImage from '@/u/urlForImage';
import resolveHref from '@/util/resolveHref';
import formatDate from '@/util/formatDate';
import getTimeSinceEvent from '@/util/getTimeSinceEvent';

type Props = {
  liveEvents: LiveEvent[];
};

export default function LiveWidget({ liveEvents }: Props) {
  // Check if liveEvents has any items and return nothing if empty
  if (liveEvents.length === 0) {
    return;
  }

  return (
    <div>
      <hr className='mb-8 border-untele' />
      <div className='mx-auto w-full max-w-[1500px] items-center justify-center gap-x-10 gap-y-12 px-4 pb-4'>
        {/* Map over active liveEvents that are passed from the main page */}
        {liveEvents.map((liveEvent) => (
          <div
            className='flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0'
            key={liveEvent._id}
          >
            {/* Image & Read More Container  */}
            <div className='flex flex-1 flex-col justify-between lg:w-1/3'>
              {/* Image  */}
              <div className='relative h-80 drop-shadow-xl'>
                {liveEvent.mainImage && (
                  <Image
                    className='rounded-md object-cover object-left lg:object-center'
                    src={urlForImage(liveEvent.mainImage as any)?.url() ?? ''}
                    fill
                    alt='Post Main Image'
                  />
                )}
              </div>

              {/* Read More  */}
              <div className='flex w-full justify-center lg:justify-start'>
                <ClientSideRoute
                  route={resolveHref('liveevent', liveEvent.slug?.current) ?? ''}
                  key={liveEvent._id}
                >
                  <button className='mt-6 rounded-lg border border-slate-400/70 bg-untele p-6 py-3 text-white shadow-md dark:border-slate-800/70 lg:mb-8 lg:ml-4 lg:mt-2'>
                    Full Event Info and Timeline Here: Read More
                  </button>
                </ClientSideRoute>
              </div>
            </div>

            {/* Info Block  */}
            <div className='flex flex-col space-y-2 lg:w-1/5'>
              {/* Title & Date    */}
              <div className='flex w-full flex-col space-y-1'>
                {liveEvent.isCurrentEvent && (
                  <h2 className='w-min animate-pulse rounded bg-untele px-3 py-1 text-2xl font-bold text-white'>
                    Live
                  </h2>
                )}
                <h1 className='text-xl font-bold text-slate-900 dark:text-white'>
                  {liveEvent.title}
                </h1>

                <div>
                  {liveEvent.location && (
                    <h3 className='text-slate-800 dark:text-slate-200'>{liveEvent.location}</h3>
                  )}
                  <p className='text-slate-700 dark:text-slate-300'>
                    {formatDate(liveEvent.eventDate || liveEvent._createdAt)}
                  </p>
                </div>
              </div>
              {/* Description  */}
              <div className=''>
                <p className='line-clamp-15 text-sm text-slate-700 dark:text-slate-300'>
                  {liveEvent.description}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className='lg:w-2/5'>
              {/* Proceed with mapping over keyEvent and relatedArticles */}
              {(liveEvent.keyEvent && liveEvent.keyEvent.length > 0) ||
              (liveEvent.relatedArticles && liveEvent.relatedArticles.length > 0) ? (
                <ul className='custom-list'>
                  {/* Sort events inside the map function */}
                  {[...(liveEvent.keyEvent || []), ...(liveEvent.relatedArticles || [])]
                    .sort(
                      (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
                    )
                    .slice(0, 9)
                    .map((event) => (
                      <li
                        key={event._id}
                        className='li li::before deco custom-list mb-2 rounded-lg border border-untele px-1 py-0.5 bg-slate-300/30 text-sm text-slate-800 dark:bg-slate-700/30 dark:text-slate-200'
                      >
                        {event.title} -{' '}
                        <span className='relative -top-[1px] transform text-sm font-light text-untele'>
                          {getTimeSinceEvent(event.eventDate)}
                        </span>
                      </li>
                    ))}
                </ul>
              ) : (
                // Handle the case when both keyEvent and relatedArticles are missing or empty
                <div className='mb-2 rounded-lg border border-untele bg-slate-300/30 text-sm text-slate-800 dark:bg-slate-700/30 dark:text-slate-200'>
                  No events at this time, please stand by...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
