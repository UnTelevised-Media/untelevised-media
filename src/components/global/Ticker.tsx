// src/components/global/Ticker.tsx
import React from 'react';
import { groq } from 'next-sanity';
import sanityClient from '@/lib/sanity/lib/client';

// Types for the specific query results
interface ArticleQueryResult {
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
  type: 'article' | 'keyEvent';
}

const queryArticles = groq`
  *[_type=='article'] {
    ...,
    slug,
    eventDate,
    publishedAt,
    title,
  } 
  | order(_createdAt desc)[0...20]
`;

const queryKeyEvent = groq`
  *[_type=='keyEvent'] {
    ...,
    slug,
    eventDate,
    title,
  } 
  | order(eventDate desc)[0...10]
`;

export default async function Ticker() {
  try {
    const [articles, keyEvents] = await Promise.all([
      sanityClient.fetch<ArticleQueryResult[]>(queryArticles),
      sanityClient.fetch<KeyEventQueryResult[]>(queryKeyEvent),
    ]);

    const keyEventTitles: TitleWithDate[] = keyEvents.map((keyEvent: KeyEventQueryResult) => ({
      title: keyEvent.title,
      date: keyEvent.eventDate,
      type: 'keyEvent',
    }));

    const articleTitles: TitleWithDate[] = articles.map((article: ArticleQueryResult) => ({
      title: article.title,
      date: article.eventDate ?? article.publishedAt ?? '',
      type: 'article',
    }));

    const allTitles: TitleWithDate[] = [...keyEventTitles, ...articleTitles]
      .filter((item) => item.date) // Filter out items without dates
      .sort(
        (a: TitleWithDate, b: TitleWithDate) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 15); // Limit to top 15 most recent

    // If no content, show default message
    if (allTitles.length === 0) {
      return (
        <div className='relative flex h-16 w-full items-center overflow-hidden bg-gradient-to-r from-slate-800/80 to-slate-700/80'>
          <div className='marquee flex items-center justify-center'>
            <div className='track'>
              <div className='flex items-center space-x-8 text-lg font-bold text-slate-300 lg:text-xl'>
                <span className='flex items-center space-x-2'>
                  <div className='h-2 w-2 animate-pulse rounded-full bg-untele' />
                  <span>Welcome to UnTelevised Media - Your source for independent news</span>
                </span>
                <span className='text-untele'>•</span>
                <span>Breaking news and live coverage</span>
                <span className='text-untele'>•</span>
                <span>Unfiltered reporting from the field</span>
                <span className='text-untele'>•</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className='relative flex h-16 w-full items-center overflow-hidden bg-gradient-to-r from-slate-800/80 to-slate-700/80'>
        {/* Animated background bars */}
        <div className='absolute inset-0 flex items-center'>
          <div className='h-0.5 w-full animate-pulse bg-gradient-to-r from-transparent via-untele/30 to-transparent' />
        </div>

        <div className='marquee relative flex items-center justify-center'>
          <div className='track'>
            <div className='flex items-center space-x-8 text-lg font-bold text-slate-200 lg:text-xl'>
              {allTitles.map((titleItem: TitleWithDate, index: number) => (
                <React.Fragment key={`${titleItem.type}-${index}`}>
                  <span className='flex items-center space-x-3'>
                    {/* Type indicator */}
                    <div
                      className={`h-2 w-2 rounded-full ${
                        titleItem.type === 'keyEvent' ? 'animate-pulse bg-red-400' : 'bg-blue-400'
                      }`}
                    />

                    {/* Breaking/Live indicator for recent items */}
                    {index < 3 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                          titleItem.type === 'keyEvent'
                            ? 'border border-red-500/30 bg-red-500/20 text-red-300'
                            : 'border border-blue-500/30 bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {titleItem.type === 'keyEvent' ? 'LIVE' : 'NEW'}
                      </span>
                    )}

                    {/* Title */}
                    <span className='transition-colors duration-200 hover:text-white'>
                      {titleItem.title}
                    </span>
                  </span>

                  {/* Separator */}
                  <span className='text-2xl font-bold text-untele'>•</span>
                </React.Fragment>
              ))}

              {/* Loop back indicator */}
              <span className='flex items-center space-x-3'>
                <div className='h-2 w-2 animate-pulse rounded-full bg-untele' />
                <span className='font-bold text-untele'>CONTINUING COVERAGE</span>
              </span>
              <span className='text-2xl font-bold text-untele'>•</span>
            </div>
          </div>
        </div>

        {/* Volume/Activity indicator */}
        <div className='absolute bottom-1 right-2 flex items-center space-x-1'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='h-1 w-1 animate-pulse rounded-full bg-untele/60'
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching ticker data:', error);
    return (
      <div className='relative flex h-16 w-full items-center overflow-hidden bg-gradient-to-r from-slate-800/80 to-slate-700/80'>
        <div className='marquee flex items-center justify-center'>
          <div className='track'>
            <div className='flex items-center space-x-8 text-lg font-bold text-slate-300 lg:text-xl'>
              <span className='flex items-center space-x-2'>
                <div className='h-2 w-2 animate-pulse rounded-full bg-yellow-500' />
                <span>News feed temporarily unavailable</span>
              </span>
              <span className='text-untele'>•</span>
              <span>Please check back shortly for live updates</span>
              <span className='text-untele'>•</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
