/* eslint-disable react/function-component-definition */
// src/app/(user)/page.tsx - Alternative Version
import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import LiveWidget from '@/components/cards/LiveWidget';
import LoadingSpinner from '@/components/global/LoadingSpinner';
import { FeaturedArticleCard } from '@/components/cards/ArticleCards';

import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryAllPost, queryLiveEvents, queryCategories } from '@/lib/sanity/lib/queries';
import urlForImage from '@/util/urlForImage';

export default async function HomePage() {
  const frontPageData = await getFrontPageData();
  const { posts, liveEvents, categories } = frontPageData;

  // Split articles for different sections
  const heroArticle = posts[0];
  const breakingNews = posts.slice(1, 4);
  const featuredStories = posts.slice(4, 10);
  const moreNews = posts.slice(10);

  return (
    <div className='min-h-screen bg-black text-slate-100'>
      {/* BREAKING ALERT BAR */}
      <div className='border-b-2 border-untele bg-untele/95 py-2'>
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
      </div>

      {/* Live Events Section */}
      {liveEvents.length > 0 && (
        <section className='border-b border-slate-800 bg-slate-950'>
          <Suspense fallback={<LoadingSpinner />}>
            <LiveWidget liveEvents={liveEvents} />
          </Suspense>
        </section>
      )}

      {/* MAIN HERO SECTION */}
      <section className='border-b border-slate-800 bg-gradient-to-b from-slate-950 to-black py-8'>
        <div className='mx-auto max-w-7xl px-4'>
          {/* Breaking News Ticker */}
          <div className='mb-8 overflow-hidden border border-untele bg-black'>
            <div className='border-b border-untele bg-untele px-4 py-2'>
              <h2 className='text-sm font-black uppercase tracking-widest text-white'>
                ⚡ LATEST ALERTS
              </h2>
            </div>
            <div className='bg-black p-4'>
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
                  <div className='relative overflow-hidden border-2 border-untele bg-slate-950'>
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
              <div className='space-y-4'>
                <div className='border border-slate-700 bg-slate-950'>
                  <div className='border-b border-slate-700 bg-slate-900 px-4 py-3'>
                    <h3 className='text-sm font-black uppercase tracking-widest text-untele'>
                      🔥 BREAKING NOW
                    </h3>
                  </div>
                  <div className='p-4 space-y-4'>
                    {breakingNews.map((article, index) => (
                      <div key={article._id} className='border-b border-slate-800 pb-4 last:border-b-0'>
                        <div className='flex items-start space-x-3'>
                          <span className='mt-1 flex h-6 w-6 items-center justify-center bg-untele text-xs font-black text-white'>
                            {index + 1}
                          </span>
                          <div>
                            <h4 className='text-sm font-bold text-slate-200 hover:text-untele cursor-pointer'>
                              {article.title}
                            </h4>
                            <p className='mt-1 text-xs text-slate-400'>
                              {article.author?.name} • Just now
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Support Box */}
                <div className='border-2 border-untele bg-gradient-to-b from-untele/20 to-black p-6'>
                  <h3 className='mb-3 text-sm font-black uppercase tracking-widest text-untele'>
                    SUPPORT INDEPENDENT MEDIA
                  </h3>
                  <p className='mb-4 text-xs text-slate-300'>
                    We&rsquo;re ON THE GROUND where others won&rsquo;t go. Help us keep reporting the truth.
                  </p>
                  <button className='w-full bg-untele py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-red-600 transition-colors'>
                    DONATE NOW
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FEATURED STORIES GRID */}
      <section className='border-b border-slate-800 bg-slate-950 py-12'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h2 className='text-lg font-black uppercase tracking-widest text-white'>
                FIELD REPORTS
              </h2>
            </div>
            <div className='h-px flex-1 bg-slate-700' />
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {featuredStories.map((article) => (
              <div key={article._id} className='group border border-slate-700 bg-black transition-all hover:border-untele'>
                <div className='aspect-video overflow-hidden'>
                  <img
                    src={urlForImage(article.mainImage as any)?.url() || ''}
                    alt={article.title}
                    className='h-full w-full object-cover transition-transform group-hover:scale-105'
                  />
                </div>
                <div className='p-4'>
                  {article.categories?.[0] && (
                    <span className='mb-2 inline-block bg-untele px-2 py-1 text-xs font-black uppercase tracking-widest text-white'>
                      {article.categories[0].title}
                    </span>
                  )}
                  <h3 className='mb-2 font-bold text-slate-200 group-hover:text-untele line-clamp-2'>
                    {article.title}
                  </h3>
                  <p className='mb-3 text-xs text-slate-400 line-clamp-2'>
                    {article.description}
                  </p>
                  <div className='flex items-center justify-between text-xs text-slate-500'>
                    <span className='font-bold uppercase'>{article.author?.name}</span>
                    <span>JUST IN</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MORE NEWS - RAW FEED STYLE */}
      <section className='bg-black py-12'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 border-b border-slate-800 pb-4'>
            <h2 className='text-2xl font-black uppercase tracking-widest text-untele'>
               RAW FEED
            </h2>
            <p className='mt-2 text-sm text-slate-400'>
              Unfiltered. Uncensored. Direct from our correspondents.
            </p>
          </div>

          <div className='grid gap-4 lg:grid-cols-2'>
            {moreNews.map((article, index) => (
              <div key={article._id} className='group flex border-l-4 border-slate-700 bg-slate-950 p-4 transition-all hover:border-untele hover:bg-slate-900'>
                <div className='flex-shrink-0'>
                  <div className='flex h-12 w-12 items-center justify-center bg-untele text-sm font-black text-white'>
                    {index + 1}
                  </div>
                </div>
                <div className='ml-4 flex-1'>
                  <div className='flex items-center space-x-2 text-xs text-slate-500'>
                    <span className='font-black uppercase'>{article.author?.name}</span>
                    <span>•</span>
                    <span>MOMENTS AGO</span>
                    {article.categories?.[0] && (
                      <>
                        <span>•</span>
                        <span className='font-black uppercase text-untele'>
                          {article.categories[0].title}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className='mt-1 font-bold text-slate-200 group-hover:text-untele'>
                    {article.title}
                  </h3>
                  <p className='mt-1 text-sm text-slate-400 line-clamp-2'>
                    {article.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className='border-t-4 border-untele bg-gradient-to-b from-untele/20 to-black py-12'>
        <div className='mx-auto max-w-4xl px-4 text-center'>
          <h2 className='mb-4 text-3xl font-black uppercase tracking-widest text-white'>
            THE TRUTH WON&rsquo;T REPORT ITSELF
          </h2>
                            <p className='mb-8 text-lg text-slate-300'>
            We go where mainstream media won&rsquo;t. Support independent journalism that exposes what they won&rsquo;t cover.
          </p>
          <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <button className='bg-untele px-8 py-4 text-sm font-black uppercase tracking-widest text-white hover:bg-red-600 transition-colors'>
              FUND THE TRUTH
            </button>
            <button className='border-2 border-white bg-transparent px-8 py-4 text-sm font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors'>
              JOIN THE MISSION
            </button>
          </div>
        </div>
      </section>

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
  categories: Category[] 
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
      }) as Promise<Category[]>
    ]);

    return { liveEvents, posts, categories };
  } catch (error) {
    console.error('Failed to fetch front page data:', error);
    return { posts: [], liveEvents: [], categories: [] };
  }
}