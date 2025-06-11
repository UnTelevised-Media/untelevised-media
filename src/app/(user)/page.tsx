/* eslint-disable react/function-component-definition */
// src/app/(user)/page.tsx
import ArticleCardLg from '@/components/cards/ArticleCardLg';
import LiveWidget from '@/components/cards/LiveWidget';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ClientSideRoute from '@/components/providers/ClientSideRoute';

import resolveHref from '@/util/resolveHref';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryAllPost, queryLiveEvents } from '@/lib/sanity/lib/queries';

export default async function HomePage() {
  const frontPageNews = await getFrontPageNews();
  const { posts, liveEvents } = frontPageNews;

  return (
    <div className='mx-auto max-w-[95wv] md:max-w-[85vw]'>
      <LiveWidget liveEvents={liveEvents} />
      <div>
        <hr className='border-untele mb-8' />
        <div className='grid grid-cols-1 gap-x-10 gap-y-12 px-10 pb-24 md:grid-cols-2 xl:grid-cols-3'>
          {posts.map((post) => (
            <ClientSideRoute route={resolveHref('post', post.slug?.current) ?? ''} key={post._id}>
              <ArticleCardLg post={post} />
            </ClientSideRoute>
          ))}
        </div>
      </div>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

// Call the Sanity Fetch Function for the Front Page News
async function getFrontPageNews(): Promise<{ posts: Article[]; liveEvents: LiveEvent[] }> {
  try {
    // Fetch live event data from Sanity for only Live Events isCurrentEvent = ture
    const liveEvents: LiveEvent[] = await sanityFetch({
      query: queryLiveEvents,
      tags: ['liveEvent'],
    });

    // Fetch article data from Sanity for all articles
    const posts: Article[] = await sanityFetch({
      query: queryAllPost,
      tags: ['post'],
    });

    // Return both post and liveEvent data
    return { liveEvents, posts };
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return { posts: [], liveEvents: [] }; // Return empty arrays in case of error
  }
}
