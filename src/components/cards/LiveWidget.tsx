import React from 'react';
import ClientSideRoute from '../ClientSideRoute';
import Image from 'next/image';
import urlForImage from '@/u/urlForImage';

type Props = {
  liveEvents: LiveEvent[];
};

export const revalidate = 15;

// A Function to calculate the difference between the current time and eventTime set from the Database.
function calculateTimeDifference(eventDate: string) {
  const eventTime = new Date(eventDate).getTime();
  const currentTime = new Date().getTime();

  const timeDifference = currentTime - eventTime;

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  }
}

const LiveWidget = ({ liveEvents }: Props) => {
  // Check if liveEvents has any items and return nothing if empty
  if (liveEvents.length === 0) {
    return;
  }

  return (
    <div>
      <hr className='mb-8 border-untele' />
      <div className='gap-x-10 gap-y-12 px-4 pb-4'>
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
                    src={urlForImage(liveEvent.mainImage).url()}
                    fill
                    alt='Post Main Image'
                  />
                )}
              </div>

              {/* Read More  */}
              <div className='flex w-full justify-center lg:justify-start'>
                <ClientSideRoute
                  route={`/live-event/${liveEvent.slug?.current}`}
                  key={liveEvent._id}
                >
                  <button className='mt-6 rounded-lg border border-slate-800/70 bg-untele p-6 py-3 text-slate-200 shadow-md lg:mb-8 lg:ml-4 lg:mt-2'>
                    Full Event Info and Timeline Here: Read More
                  </button>
                </ClientSideRoute>
              </div>
            </div>

            {/* Info Block  */}
            <div className='flex flex-col space-y-2 lg:w-1/5'>
              {/* Title & Date    */}
              <div className='flex w-full  flex-col space-y-1'>
                {liveEvent.isCurrentEvent && (
                  <h2 className='w-min animate-pulse rounded bg-untele px-3 py-1 text-2xl font-bold text-slate-200'>
                    Live
                  </h2>
                )}
                <h1 className='text-xl font-bold'>{liveEvent.title}</h1>

                <div>
                  {/* <h3>{liveEvent.location}</h3> */}
                  <p>
                    {new Date(liveEvent.eventDate).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {/* Description  */}
              <div className=''>
                <p className='line-clamp-15 text-sm'>{liveEvent.description}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className='lg:w-2/5'>
              {/* Proceed with mapping over keyEvent and relatedArticles */}
              {(liveEvent.keyEvent && liveEvent.keyEvent.length > 0) ||
              (liveEvent.relatedArticles &&
                liveEvent.relatedArticles.length > 0) ? (
                <ul className='custom-list'>
                  {/* Sort events inside the map function */}
                  {[
                    ...(liveEvent.keyEvent || []),
                    ...(liveEvent.relatedArticles || []),
                  ]
                    .sort(
                      (a, b) =>
                        new Date(b.eventDate).getTime() -
                        new Date(a.eventDate).getTime(),
                    )
                    .slice(0, 12)
                    .map((event) => (
                      <li
                        key={event._id}
                        className='li li::before mb-2 rounded-lg border border-untele bg-slate-700/30 text-sm custom-list'
                      >
                        {event.title} -{' '}
                        <span className='relative -top-[1px] transform text-sm font-light text-untele'>
                          {calculateTimeDifference(event.eventDate)}
                        </span>
                      </li>
                    ))}
                </ul>
              ) : (
                // Handle the case when both keyEvent and relatedArticles are missing or empty
                <div className='mb-2 rounded-lg border border-untele bg-slate-700/30 text-sm'>
                  No events at this time, please stand by...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveWidget;
