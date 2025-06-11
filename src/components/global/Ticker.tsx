// src/components/global/Ticker.tsx
import React from 'react';
import { groq } from 'next-sanity';
import client from '@/lib/sanity/lib/client';

// Types for the specific query results
interface PostQueryResult {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  eventDate?: string;
  publishedAt?: string;
}

interface KeyEventQueryResult {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  eventDate: string;
}

interface TitleWithDate {
  title: string;
  date: string;
}

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
    const posts: PostQueryResult[] = await client.fetch(queryPost);
    const keyEvents: KeyEventQueryResult[] = await client.fetch(queryKeyEvent);

    const keyEventTitles: TitleWithDate[] = keyEvents.map((keyEvent: KeyEventQueryResult) => ({
      title: keyEvent.title,
      date: keyEvent.eventDate,
    }));

    const postTitles: TitleWithDate[] = posts.map((post: PostQueryResult) => ({
      title: post.title,
      date: post.eventDate ?? post.publishedAt ?? '',
    }));

    const allTitles: TitleWithDate[] = [...keyEventTitles, ...postTitles].sort(
      (a: TitleWithDate, b: TitleWithDate) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Return JSX here, inside the try block
    return (
      <div className='border-untele/30 bg-static flex w-full overflow-hidden rounded-md border shadow-lg'>
        <div className='marquee flex h-12 items-center justify-center'>
          <div className='track'>
            <div className='text-xl font-bold lg:text-3xl'>
              {allTitles.map((titleItem: TitleWithDate, index: number) => (
                <span key={index}>{titleItem.title} • </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return (
      <div className='border-untele/30 bg-static flex w-full overflow-hidden rounded-md border shadow-lg'>
        <div className='marquee flex h-12 items-center justify-center'>
          <div className='track'>
            <div className='text-xl font-bold lg:text-3xl'>
              <span>Unable to load news ticker • </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
