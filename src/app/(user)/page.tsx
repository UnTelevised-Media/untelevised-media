/* eslint-disable react/function-component-definition */
// src/app/(user)/page.tsx - Alternative Version
import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Link from 'next/link';

import LiveWidget from '@/components/cards/LiveWidget';
import LoadingSpinner from '@/components/global/LoadingSpinner';
import { FeaturedArticleCard } from '@/components/cards/ArticleCards';
import RawFeed from '@/components/homepage/RawFeed';

import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryAllArticles, queryLiveEvents, queryCategories } from '@/lib/sanity/lib/queries';
import urlForImage from '@/util/urlForImage';
import formatDate from '@/util/formatDate';

export default async function HomePage() {
  const frontPageData = await getFrontPageData();
  const { articles, liveEvents } = frontPageData;

  // Split articles for different sections
  const heroArticle = articles[0];
  const breakingNews = articles.slice(1, 5);
  const featuredStories = articles.slice(5, 11);
  const moreNews = articles.slice(11);

  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* BREAKING ALERT BAR */}
      {/* <div className='border-b-2 border-untele bg-untele/95 py-2'>
        <div className='mx-auto flex max-w-7xl items-center justify-center space-x-4 px-4'>
          <div className='flex items-center space-x-2'>
            <div className='h-3 w-3 animate-pulse rounded-full bg-white' />
            <span className='text-sm font-black uppercase tracking-widest text-white'>
              BREAKING
            </span>
          </div>
          <div className='hidden animate-pulse text-center text-sm font-bold text-white md:block'>
            LIVE COVERAGE: Major events unfolding - Click for real-time updates
          </div>
        </div>
      </div> */}

      {/* Live Events Section */}
      {liveEvents.length > 0 && (
        <section className='border-b border-slate-300 bg-slate-50 dark:border-slate-800 dark:bg-slate-950'>
          <Suspense fallback={<LoadingSpinner />}>
            <LiveWidget liveEvents={liveEvents} />
          </Suspense>
        </section>
      )}

      {/* MAIN HERO SECTION */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-8 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-7xl px-4'>
          {/* Breaking News Ticker */}
          <div className='mb-8 overflow-hidden border border-untele bg-white dark:bg-black'>
            <div className='border-b border-untele bg-untele px-4 py-2'>
              <h2 className='text-sm font-black uppercase tracking-widest text-white'>
                ⚡ LATEST ALERTS
              </h2>
            </div>
            <div className='bg-white p-4 dark:bg-black'>
              <div className='flex animate-pulse space-x-8 text-untele'>
                {breakingNews.map((article, index) => (
                  <span key={index} className='whitespace-nowrap font-bold'>
                    • {article.title}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Article */}
          {heroArticle && (
            <div className='grid gap-8 lg:grid-cols-3'>
              <div className='lg:col-span-2'>
                <Suspense fallback={<LoadingSpinner />}>
                  <div className='relative overflow-hidden border-2 border-untele bg-slate-100 dark:bg-slate-950'>
                    <div className='absolute left-0 top-0 bg-untele px-3 py-1'>
                      <span className='text-xs font-black uppercase tracking-widest text-white'>
                        HEADLINE
                      </span>
                    </div>
                    <FeaturedArticleCard article={heroArticle} />
                  </div>
                </Suspense>
              </div>

              {/* Breaking News Sidebar */}
              <div className='flex h-full flex-col space-y-4'>
                <div className='border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950'>
                  <div className='border-b border-slate-300 bg-slate-100 px-4 py-3 dark:border-slate-700 dark:bg-slate-900'>
                    <h3 className='text-sm font-black uppercase tracking-widest text-untele'>
                      🔥 BREAKING NOW
                    </h3>
                  </div>
                  <div className='space-y-3 p-3'>
                    {breakingNews.map((article) => (
                      <div
                        key={article._id}
                        className='border-b border-slate-300 pb-3 last:border-b-0 dark:border-slate-800'
                      >
                        <div>
                          <h4 className='line-clamp-2 cursor-pointer text-xs font-bold text-slate-800 hover:text-untele dark:text-slate-200'>
                            {article.title}
                          </h4>
                          <p className='mt-1 text-xs text-slate-600 dark:text-slate-400'>
                            {article.author?.name} •{' '}
                            {formatDate(article.eventDate || article._createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Support Box */}
                <div className='mt-auto border-2 border-untele bg-gradient-to-b from-untele/20 to-slate-100 p-6 dark:to-black'>
                  <h3 className='mb-3 text-sm font-black uppercase tracking-widest text-untele'>
                    SUPPORT INDEPENDENT MEDIA
                  </h3>
                  <p className='mb-4 text-xs text-slate-700 dark:text-slate-300'>
                    We&rsquo;re ON THE GROUND where others won&rsquo;t go. Help us keep reporting
                    the truth.
                  </p>
                  <Link href='/donate'>
                    <button className='w-full bg-untele py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'>
                      DONATE NOW
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FEATURED STORIES GRID */}
      <section className='border-b border-slate-300 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h2 className='text-lg font-black uppercase tracking-widest text-white'>
                FIELD REPORTS
              </h2>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {featuredStories.map((article) => (
              <div
                key={article._id}
                className='group flex h-full flex-col border border-slate-300 bg-white transition-all hover:border-untele dark:border-slate-700 dark:bg-black'
              >
                <div className='aspect-video overflow-hidden'>
                  <img
                    src={urlForImage(article.mainImage as any)?.url() || ''}
                    alt={article.title}
                    className='h-full w-full object-cover transition-transform group-hover:scale-105'
                  />
                </div>
                <div className='flex flex-1 flex-col p-4'>
                  {article.categories?.[0] && (
                    <span className='mb-2 inline-block bg-untele px-2 py-1 text-xs font-black uppercase tracking-widest text-white'>
                      {article.categories[0].title}
                    </span>
                  )}
                  <h3 className='mb-2 line-clamp-2 font-bold text-slate-800 group-hover:text-untele dark:text-slate-200'>
                    {article.title}
                  </h3>
                  <p className='mb-3 line-clamp-2 flex-1 text-xs text-slate-600 dark:text-slate-400'>
                    {article.description}
                  </p>
                  <div className='mt-auto flex items-center justify-between text-xs text-slate-600 dark:text-slate-500'>
                    <span className='font-bold uppercase'>{article.author?.name}</span>
                    <span>{formatDate(article.eventDate || article._createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MORE NEWS - RAW FEED STYLE */}
      <RawFeed articles={moreNews} />

      {/* BOTTOM CTA */}
      <section className='border-t-4 border-untele bg-gradient-to-b from-untele/20 to-white py-12 dark:to-black'>
        <div className='mx-auto max-w-4xl px-4 text-center'>
          <h2 className='mb-4 text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
            THE TRUTH WON&rsquo;T REPORT ITSELF
          </h2>
          <p className='mb-8 text-lg text-slate-700 dark:text-slate-300'>
            We go where mainstream media won&rsquo;t. Support independent journalism that exposes
            what they won&rsquo;t cover.
          </p>
          <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <button className='bg-untele px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'>
              FUND THE TRUTH
            </button>
            <button className='border-2 border-slate-900 bg-transparent px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-900 transition-colors hover:bg-slate-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black'>
              JOIN THE MISSION
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Enhanced data fetching function
async function getFrontPageData(): Promise<{
  articles: Article[];
  liveEvents: LiveEvent[];
  categories: Category[];
}> {
  try {
    // Fetch all data in parallel for better performance
    const [liveEvents, articles, categories] = await Promise.all([
      sanityFetch({
        query: queryLiveEvents,
        tags: ['liveEvent'],
      }) as Promise<LiveEvent[]>,
      sanityFetch({
        query: queryAllArticles,
        tags: ['article'],
      }) as Promise<Article[]>,
      sanityFetch({
        query: queryCategories,
        tags: ['category'],
      }) as Promise<Category[]>,
    ]);

    return { liveEvents, articles, categories };
  } catch (error) {
    console.error('Failed to fetch front page data:', error);
    return { articles: [], liveEvents: [], categories: [] };
  }
}
