import React from 'react';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';

const queryPost = groq`
  *[_type=='post'] {
    ...,
    eventDate,
    title,
  } 
  | order(_createdAt desc)
`;

const queryLiveEvent = groq`
  *[_type=='liveEvent'] {
    ...,
    slug,
    keyEvent[]->{
      title,
      eventDate,
    },
    relatedArticles[]-> {
      slug,
      _id,
      title,
      eventDate,
    }
  } 
`;

export default async function Ticker() {
  const posts = await client.fetch(queryPost);
  const liveEvents = await client.fetch(queryLiveEvent);

  const keyEventTitles = liveEvents.reduce((titles, event) => {
    if (event.keyEvent) {
      const keyEventTitles = event.keyEvent.map((keyEvent) => keyEvent.title);
      titles.push(...keyEventTitles);
    }
    return titles;
  }, []);

  const postTitles = posts.map((post) => post.title);

  const allTitles = [...keyEventTitles, ...postTitles].sort(
    (a, b) =>
      new Date(b.eventDate || b.publishedAt).getTime() -
      new Date(a.eventDate || a.publishedAt).getTime(),
  );

  return (
    <div className='flex w-full overflow-hidden rounded-md border border-untele/30 bg-static shadow-lg'>
      <div className='marquee flex h-12 items-center justify-center '>
        <div className='track'>
          <div className='text-3xl font-bold'>
            {allTitles.map((title, index) => (
              <span key={index}>{title} • </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
