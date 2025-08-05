// src/components/global/Ticker.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { groq } from 'next-sanity';
import sanityClient from '@/lib/sanity/lib/client';

// Types for the specific query results
interface ArticleQueryResult {
  _id: string;
  title: string;
  _createdAt: string;
}

interface KeyEventQueryResult {
  _id: string;
  title: string;
  _createdAt: string;
}

interface TickerItem {
  title: string;
  createdAt: string;
  type: 'article' | 'keyEvent';
}

const queryArticles = groq`
  *[_type=='article'] {
    _id,
    title,
    _createdAt
  }
  | order(_createdAt desc)
`;

const queryKeyEvent = groq`
  *[_type=='keyEvent'] {
    _id,
    title,
    _createdAt
  }
  | order(_createdAt desc)
`;

const  Ticker = () => {
  const [allItems, setAllItems] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        setIsLoading(true);
        const [articles, keyEvents] = await Promise.all([
          sanityClient.fetch<ArticleQueryResult[]>(queryArticles),
          sanityClient.fetch<KeyEventQueryResult[]>(queryKeyEvent),
        ]);

        // Combine and sort by creation date - get ALL items, not just limited
        const combinedItems: TickerItem[] = [
          ...articles.map((article) => ({
            title: article.title,
            createdAt: article._createdAt,
            type: 'article' as const,
          })),
          ...keyEvents.map((keyEvent) => ({
            title: keyEvent.title,
            createdAt: keyEvent._createdAt,
            type: 'keyEvent' as const,
          })),
        ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // Sort by creation order (oldest first for proper display)

        setAllItems(combinedItems);
        setError(null);
      } catch (err) {
        console.error('Error fetching ticker data:', err);
        setError('Failed to load ticker data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickerData();

    // Refresh data every 5 minutes to get new content
    const interval = setInterval(fetchTickerData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className='relative flex h-12 w-full items-center overflow-hidden bg-slate-100 dark:bg-slate-800'>
        <div className='marquee flex items-center justify-center'>
          <div className='track'>
            <div className='flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-slate-300'>
              <span className='flex items-center space-x-2'>
                <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500' />
                <span>Loading latest headlines...</span>
              </span>
              <span className='text-untele'>•</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='relative flex h-12 w-full items-center overflow-hidden bg-slate-100 dark:bg-slate-800'>
        <div className='marquee flex items-center justify-center'>
          <div className='track'>
            <div className='flex items-center space-x-6 text-sm font-medium text-slate-600 dark:text-slate-300'>
              <span className='flex items-center space-x-2'>
                <div className='h-1.5 w-1.5 rounded-full bg-yellow-500' />
                <span>News feed temporarily unavailable</span>
              </span>
              <span className='text-untele'>•</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No content state
  if (allItems.length === 0) {
    return (
      <div className='relative flex h-12 w-full items-center overflow-hidden bg-slate-100 dark:bg-slate-800'>
        <div className='marquee flex items-center justify-center'>
          <div className='track'>
            <div className='flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-slate-300'>
              <span>Welcome to UnTelevised Media</span>
              <span className='text-untele'>•</span>
              <span>Independent news and live coverage</span>
              <span className='text-untele'>•</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create duplicated content for seamless looping
  const tickerContent = (
    <>
      {allItems.map((item, index) => (
        <React.Fragment key={`${item.type}-${item.createdAt}-${index}`}>
          <span className='flex items-center space-x-2 whitespace-nowrap'>
            {/* Simple type indicator */}
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                item.type === 'keyEvent' ? 'bg-red-500' : 'bg-blue-500'
              }`}
            />
            {/* Clean title display */}
            <span>{item.title}</span>
          </span>
          {/* Simple separator */}
          <span className='text-untele'>•</span>
        </React.Fragment>
      ))}
    </>
  );

  return (
    <div className='relative flex h-12 w-full items-center overflow-hidden bg-slate-100 dark:bg-slate-800'>
      <div className='marquee relative flex items-center justify-center'>
        <div className='track'>
          <div className='flex items-center space-x-6 text-sm font-medium text-slate-700 dark:text-slate-200'>
            {tickerContent}
            {/* Duplicate content for seamless loop */}
            {tickerContent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ticker;
