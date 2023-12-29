/* eslint-disable react/function-component-definition */
import Image from 'next/image';
import { groq } from 'next-sanity';
import { PortableText } from '@portabletext/react';
import { RichTextComponents } from '@/c/RichTextComponents';
import SocialShare from '@/c/SocialShare';
import { client } from '@/l/sanity.client';
import urlForImage from '@/u/urlForImage';
import Link from 'next/link';
import EventMap from '@/components/EventMap';
export { generateMetadata } from '@/util/generateLiveEventMetadata';

type Props = {
  params: {
    slug: string;
  };
};

export const revalidate = 15;

export async function generateStaticParams() {
  const query = groq`*[_type=='liveEvent']
  {
    slug
  }`;

  const slugs: Post[] = await client.fetch(query);
  const slugRoutes = slugs ? slugs.map((slug) => slug.slug.current) : [];

  return slugRoutes.map((slug) => ({
    slug,
  }));
}

async function Article({ params: { slug } }: Props) {
  const query = groq`
    *[_type == "liveEvent" && slug.current == $slug][0] {
      ...,
      tag[]->,
      keyEvent[]->,
      relatedArticles[]-> {
        slug,
        _id,
        title,
        _createdAt,
        description,
        eventDate,
      // Add other fields you want to retrieve from relatedArticles
    }
    }`;

  const liveEvent: LiveEvent = await client.fetch(query, { slug });

  // Combine relatedArticles and keyEvent into a single array
  const relatedArticles = liveEvent.relatedArticles || [];
  const keyEvent = liveEvent.keyEvent || [];
  const allEvents = [...relatedArticles, ...keyEvent];

  // Sort the combined array by date and time in descending order
  allEvents.sort((a, b) => {
    const dateA = new Date(a.eventDate);
    const dateB = new Date(b.eventDate);

    if (isNaN(dateA.getTime())) {
      return 1; // dateA is not a valid date, move it to the end
    } else if (isNaN(dateB.getTime())) {
      return -1; // dateB is not a valid date, move it to the end
    } else {
      return dateB.valueOf() - dateA.valueOf();
    }
  });

  function calculateTimeDifference(eventDate) {
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
  return (
    <>
      <hr className='mx-auto mb-8 max-w-[95wv] border-untele md:max-w-[85vw]' />

      <article className='mx-auto max-w-[95vw] pb-28 md:max-w-[85vw] lg:px-10'>
        {/* Top Section: Image, Title, Date, Description  */}
        <section className='flex flex-col space-x-4 text-slate-700 lg:flex-row'>
          {/* Image  */}
          <div className='h-auto min-w-max xl:w-full'>
            <Image
              src={urlForImage(liveEvent.mainImage).url()}
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
            {/* Title & Date    */}
            <div className='flex w-full  flex-col space-y-1'>
              {liveEvent.isCurrentEvent && (
                <h2 className='w-min animate-pulse rounded bg-untele px-3 py-1 text-2xl font-bold text-slate-200'>
                  Live
                </h2>
              )}
              <h1 className='w-full text-3xl font-bold'>{liveEvent.title}</h1>

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
            <div className='w-full'>
              <p className='w-full italic lg:text-xs xl:text-base'>
                {liveEvent.description}
              </p>
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
                    key={event.slug}
                    className='mb-3 flex flex-col rounded-lg border border-untele bg-slate-700/30 px-6 py-3'
                  >
                    <div className='flex flex-col space-y-1'>
                      <h3 className='text-base font-bold underline'>
                        {event.title}
                      </h3>
                      <h4 className='text-sm text-untele/70'>
                        {calculateTimeDifference(event.eventDate)}
                      </h4>
                      {liveEvent.relatedArticles?.includes(event) ? (
                        <p className='text-sm'>{event.description}</p>
                      ) : (
                        <PortableText
                          value={event.description}
                          components={RichTextComponents}
                        />
                      )}

                      {liveEvent.relatedArticles?.includes(event) && (
                        <Link
                          href={`/post/${event.slug.current}`}
                          className='cursor-pointer self-end text-blue-500 underline hover:opacity-80'
                        >
                          <button className='rounded-md border border-untele/40 bg-slate-700/30 px-3 py-1 font-bold text-untele/60'>
                            Read More
                          </button>
                        </Link>
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
            <PortableText
              value={liveEvent.body}
              components={RichTextComponents}
            />
          </div>
        </section>
      </article>
    </>
  );
}

export default Article;
