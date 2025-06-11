/* eslint-disable react/function-component-definition */
// src/app/(user)/page.tsx
import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import ArticleShowcase from '@/components/showcase/ArticleShowcase';
import LiveWidget from '@/components/cards/LiveWidget';
import LoadingSpinner from '@/components/global/LoadingSpinner';
import { FeaturedArticleCard } from '@/components/cards/ArticleCards';
import ArticleCategories from '@/components/global/ArticleCategories';

import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryAllPost, queryLiveEvents, queryCategories } from '@/lib/sanity/lib/queries';

export default async function HomePage() {
  const frontPageData = await getFrontPageData();
  const { posts, liveEvents, categories } = frontPageData;

  // Get featured article (most recent or most important)
  const featuredArticle = posts[0];
  const otherArticles = posts.slice(1);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      {/* Live Events Section */}
      {liveEvents.length > 0 && (
        <section className='relative mx-auto max-w-[95vw] md:max-w-[85vw]'>
          <Suspense fallback={<LoadingSpinner />}>
            <LiveWidget liveEvents={liveEvents} />
          </Suspense>
        </section>
      )}

      <div className='mx-auto max-w-[95vw] md:max-w-[85vw]'>
        <hr className='mb-8 border-untele' />

        {/* Hero Featured Article Section */}
        {featuredArticle && (
          <section className='mb-12'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-3xl font-bold text-slate-200 md:text-4xl'>
                <span className='bg-gradient-to-r from-untele to-red-400 bg-clip-text text-transparent'>
                  Breaking News
                </span>
              </h2>
              <div className='flex items-center space-x-2'>
                <div className='h-2 w-2 animate-pulse rounded-full bg-untele'></div>
                <span className='text-sm font-medium text-slate-300'>Live Updates</span>
              </div>
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <FeaturedArticleCard article={featuredArticle} />
            </Suspense>
          </section>
        )}

        {/* Main Content Grid */}
        <div className='grid gap-8 lg:grid-cols-4'>
          {/* Left Sidebar - Categories */}
          <aside className='lg:col-span-1'>
            <div className='sticky top-32 space-y-6'>
              <Suspense fallback={<LoadingSpinner />}>
                <ArticleCategories />
              </Suspense>

              {/* Trending Topics */}
              <div className='rounded-lg border border-slate-600 bg-slate-800/50 p-6 backdrop-blur-sm'>
                <h3 className='mb-4 border-b border-untele/30 pb-2 text-lg font-bold text-slate-200'>
                  Trending Topics
                </h3>
                <div className='space-y-3'>
                  {[
                    'Breaking Coverage',
                    'Live Updates',
                    'Investigation Reports',
                    'Field Reporting',
                  ].map((topic, index) => (
                    <div key={index} className='flex items-center space-x-3'>
                      <span className='font-bold text-untele'>#{index + 1}</span>
                      <span className='cursor-pointer text-sm text-slate-300 transition-colors hover:text-white'>
                        {topic}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className='rounded-lg border border-slate-600 bg-slate-800/50 p-6 backdrop-blur-sm'>
                <h3 className='mb-4 border-b border-untele/30 pb-2 text-lg font-bold text-slate-200'>
                  News Feed Stats
                </h3>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-slate-400'>Stories Today</span>
                    <span className='font-bold text-untele'>{posts.length}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-slate-400'>Live Events</span>
                    <span className='font-bold text-untele'>{liveEvents.length}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-slate-400'>Categories</span>
                    <span className='font-bold text-untele'>{categories.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className='lg:col-span-3'>
            <Suspense fallback={<LoadingSpinner />}>
              <ArticleShowcase articles={otherArticles} categories={categories} />
            </Suspense>
          </main>
        </div>

        {/* Call to Action Section */}
        <section className='mb-8 mt-16'>
          <div className='relative overflow-hidden rounded-xl border border-slate-600 bg-gradient-to-r from-slate-800 to-slate-700 p-8 text-center backdrop-blur-sm'>
            <div className='bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] absolute inset-0 opacity-20' />

            <div className='relative z-10'>
              <h3 className='mb-4 text-2xl font-bold text-white md:text-3xl'>
                Support Independent Journalism
              </h3>
              <p className='mx-auto mb-6 max-w-2xl text-lg text-slate-300'>
                Help us continue bringing you unfiltered news and real-time coverage of events that
                matter. Your support keeps our reporting free and independent.
              </p>
              <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
                <a
                  href='/donate'
                  className='inline-flex items-center justify-center rounded-lg bg-untele px-8 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-untele/90'
                >
                  Support Our Mission
                </a>
                <a
                  href='/about'
                  className='inline-flex items-center justify-center rounded-lg border border-slate-500 bg-slate-800/50 px-8 py-3 font-medium text-slate-200 backdrop-blur-sm transition-all duration-200 hover:bg-slate-700/50'
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Analytics */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

// Enhanced data fetching function
async function getFrontPageData(): Promise<{
  posts: Article[];
  liveEvents: LiveEvent[];
  categories: Category[];
}> {
  try {
    // Fetch all data in parallel for better performance
    const [liveEvents, posts, categories] = await Promise.all([
      sanityFetch({
        query: queryLiveEvents,
        tags: ['liveEvent'],
      }) as Promise<LiveEvent[]>,
      sanityFetch({
        query: queryAllPost,
        tags: ['post'],
      }) as Promise<Article[]>,
      sanityFetch({
        query: queryCategories,
        tags: ['category'],
      }) as Promise<Category[]>,
    ]);

    return { liveEvents, posts, categories };
  } catch (error) {
    console.error('Failed to fetch front page data:', error);
    return { posts: [], liveEvents: [], categories: [] };
  }
}
