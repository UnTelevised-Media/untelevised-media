import React from 'react';
import ClientSideRoute from './ClientSideRoute';
import Image from 'next/image';
import urlForImage from '@/u/urlForImage';

type Props = {
  liveEvents: LiveEvent[];
};

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
  // Extract keyEvent and relatedArticles from liveEvents
  const { keyEvent, relatedArticles } = liveEvents[0];

  // Combine keyEvent and relatedArticles arrays and sort by date in descending order
  const allEvents = [...keyEvent, ...relatedArticles].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
  );

  // Select the most recent 10 items
  const sortedEvents = allEvents.slice(0, 12);

  return (
    <div>
      <hr className='mb-8 border-untele' />
      <div className='gap-x-10 gap-y-12 px-4 pb-4'>
        {liveEvents.map((liveEvent) => (
          <div className='flex space-x-4' key={liveEvent._id}>
            {/* Image & Read More Container  */}
            <div className='flex w-1/3 flex-1 flex-col justify-between'>
              {/* Image  */}
              <div className='relative h-80 drop-shadow-xl'>
                <Image
                  className='rounded-md object-cover object-left lg:object-center'
                  src={urlForImage(liveEvent.mainImage).url()}
                  fill
                  alt='Post Main Image'
                />
              </div>

              {/* Read More  */}
              <div className='mb-8 ml-4 w-full'>
                <ClientSideRoute
                  route={`/live-event/${liveEvent.slug?.current}`}
                  key={liveEvent._id}
                >
                  <button className='rounded-lg border border-slate-800/70 bg-untele p-6 py-3 text-slate-200 shadow-md '>
                    Full Event Info and Timeline Here: Read More
                  </button>
                </ClientSideRoute>
              </div>
            </div>

            {/* Info Block  */}
            <div className='flex w-1/5 flex-col space-y-2'>
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
                <p className='text-sm'>{liveEvent.description}</p>
              </div>
            </div>

            {/* Timeline  */}
            <div className='w-2/5'>
              {/* Timeline */}
              <ul className='custom-list'>
                {sortedEvents.map((event) => (
                  <li
                    key={event._id}
                    className='text-md custom-list li li::before mb-2 rounded-lg border border-untele bg-slate-700/30'
                  >
                    {event.title} -{' '}
                    <span className='relative -top-[1px] transform text-sm text-untele/80'>
                      {calculateTimeDifference(event.eventDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveWidget;
