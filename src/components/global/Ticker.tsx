import React from 'react';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';

const queryPost = groq`
  *[_type=='post'] {
    ...,
    slug,
    eventDate,
    publishedAt,
    title,
  } 
  | order(_createdAt desc)
`;

const queryKeyEvent = groq`
  *[_type=='keyEvent'] {
    ...,
    slug,
    eventDate,
    title,
  } 
`;

export default async function Ticker() {
  try {
    const posts = await client.fetch(queryPost);
    const keyEvents = await client.fetch(queryKeyEvent);

    const keyEventTitles = keyEvents.map((keyEvent) => ({
      title: keyEvent.title,
      date: keyEvent.eventDate || keyEvent.publishedAt,
    }));

    const postTitles = posts.map((post) => ({
      title: post.title,
      date: post.eventDate || post.publishedAt,
    }));

    const allTitles = [...keyEventTitles, ...postTitles].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

    // Return JSX here, inside the try block
    return (
      <div className='flex w-full overflow-hidden rounded-md border border-untele/30 bg-static shadow-lg'>
        <div className='marquee flex h-12 items-center justify-center '>
          <div className='track'>
            <div className='text-3xl font-bold'>
              {allTitles.map((title, index) => (
                <span key={index}>
                  {title.title} •{' '}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}
