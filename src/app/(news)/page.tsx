import type { Article, LiveEvent } from '@/models/types/sanity';
// src/app/(user)/page.tsx - Alternative Version
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import LiveWidget from '@/components/cards/LiveWidget';
import LoadingSpinner from '@/components/global/LoadingSpinner';
import { FeaturedArticleCard } from '@/components/cards/ArticleCards';
import RawFeedServer from '@/components/homepage/RawFeedServer';
import TrendingSection from '@/components/homepage/TrendingSection';
import FieldReportsServer from '@/components/homepage/FieldReportsServer';
import { SidebarAd, AD_CONFIG } from '@/components/googleAdSense';
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup';
import { SubscribedBanner } from '@/components/newsletter/SubscribedBanner';
import LatestAlertsServer from '@/components/global/LatestAlertsServer';

import { sanityFetch } from '@/lib/sanity/lib/fetch';
import {
  queryHomepageArticles,
  queryLiveEvents,
  queryBreakingArticles,
  queryTrendingIds,
} from '@/lib/sanity/lib/queries';
import urlForImage from '@/util/url/urlForImage';
import formatDate from '@/util/date/formatDate';
import getArticleDate from '@/util/date/getArticleDate';

export default async function HomePage() {
  const frontPageData = await getFrontPageData();
  const { articles, liveEvents, breakingArticles, trendingIds } = frontPageData;

  // Breaking articles come from their own query (breakingNews flag, publishedAt desc)
  const heroArticle = articles[0];

  // Build exclusion set from all sections that already display articles above the feed
  const excludedIds = new Set<string>(
    [
      heroArticle?._id,
      ...breakingArticles.map((a) => a._id),
      ...trendingIds.map((a: { _id: string }) => a._id),
    ].filter(Boolean) as string[]
  );

  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* Live Events Section */}
      {liveEvents.length > 0 && (
        <section className='border-b border-slate-300 bg-slate-50 dark:border-slate-800 dark:bg-slate-950'>
          <Suspense fallback={<LoadingSpinner />}>
            {/* LiveWidget expects flexible liveEvent data structure */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <LiveWidget liveEvents={liveEvents as any} />
          </Suspense>
        </section>
      )}

      {/* MAIN HERO SECTION */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-8 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-[1400px] px-4'>
          {/* Latest Alerts Ticker */}
          <div className='mb-8 overflow-hidden'>
            <Suspense fallback={<div className='border border-untele bg-white p-4 dark:bg-black'>Loading alerts...</div>}>
              <LatestAlertsServer />
            </Suspense>
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
                    {/* FeaturedArticleCard expects flexible article data */}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <FeaturedArticleCard article={heroArticle as any} />
                  </div>
                </Suspense>
              </div>

              {/* Breaking Now — fixed height only when beside the hero (lg+) */}
              <div className='flex flex-col border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 lg:h-[578px]'>
                <div className='shrink-0 border-b border-slate-300 bg-slate-100 px-4 py-3 dark:border-slate-700 dark:bg-slate-900'>
                  <h3 className='text-sm font-black uppercase tracking-widest text-untele'>
                    🔥 BREAKING NOW
                  </h3>
                </div>
                {breakingArticles.length === 0 ? (
                  <div className='flex flex-1 items-center justify-center text-xs text-slate-400 dark:text-slate-600'>
                    No breaking news at this time
                  </div>
                ) : (
                  <div className='breaking-scroll flex-1 divide-y divide-slate-200 overflow-y-auto dark:divide-slate-800'>
                    {breakingArticles.slice(0, 10).map((article) => (
                      <Link
                        key={article._id}
                        href={`/articles/${article.slug?.current}`}
                        className='group flex items-start gap-3 p-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900'
                      >
                        <div className='relative h-[60px] w-[80px] shrink-0 overflow-hidden bg-slate-200 dark:bg-slate-800'>
                          {article.mainImage && (
                            <Image
                              src={
                                urlForImage(article.mainImage)?.width(160).height(120).url() ?? ''
                              }
                              alt={article.title ?? 'Article'}
                              fill
                              sizes='80px'
                              className='object-cover'
                            />
                          )}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <h4 className='line-clamp-2 text-xs font-bold leading-snug text-slate-800 transition-colors group-hover:text-untele dark:text-slate-200'>
                            {article.title ?? 'Untitled'}
                          </h4>
                          <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                            {/* GROQ dereferences author->, TypeScript sees only reference */}
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(article.author as any)?.name} • {formatDate(getArticleDate(article))}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* AD · SUPPORT · MOST READ — three-column strip below hero */}
      <section className='border-b border-slate-300 bg-white py-12 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-[1400px] px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h2 className='text-lg font-black uppercase tracking-widest text-white'>
                Trending
              </h2>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-slate-200 lg:dark:divide-slate-800'>
            {/* Column 1 — Ad on top, CTA below */}
            <div className='flex flex-col justify-between lg:pr-8'>
              {/* Advertisement */}
              <div className='flex items-center justify-center'>
                <SidebarAd slot={AD_CONFIG.AD_SLOTS.HOMEPAGE_SIDEBAR} className='w-full' />
              </div>
              {/* Support Independent Media */}
              <div className='flex flex-col gap-5 bg-gradient-to-br from-untele/10 to-transparent p-6'>
                <div>
                  <div className='mb-4 inline-block bg-untele px-3 py-1'>
                    <span className='text-xs font-black uppercase tracking-widest text-white'>
                      Independent Media
                    </span>
                  </div>
                  <h3 className='mb-3 text-xl font-black uppercase leading-tight tracking-wide text-slate-900 dark:text-white'>
                    We go where others won&rsquo;t.
                  </h3>
                  <p className='text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
                    On-the-ground reporting that mainstream outlets ignore. Every dollar keeps us
                    in the field — uncensored, unsponsored, uncompromised.
                  </p>
                </div>
                <div className='flex flex-col gap-3 sm:flex-row'>
                  <Link
                    href='/support'
                    className='flex-1 bg-untele py-3 text-center text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
                  >
                    Become Member
                  </Link>
                  <Link
                    href='/careers'
                    className='flex-1 border-2 border-slate-900 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-900 transition-colors hover:bg-slate-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black'
                  >
                    Join the Mission
                  </Link>
                </div>
              </div>
            </div>

            {/* Column 2 — #1 Most Read featured card */}
            <div className='flex flex-col lg:px-8'>
              <TrendingSection variant='card' />
            </div>

            {/* Column 3 — #2–10 compact list */}
            <div className='lg:pl-8'>
              <TrendingSection variant='list' />
            </div>
          </div>
        </div>
      </section>

      {/* FIELD REPORTS GRID */}
      <section className='border-b border-slate-300 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-[1400px] px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h2 className='text-lg font-black uppercase tracking-widest text-white'>
                FIELD REPORTS
              </h2>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <Suspense
            fallback={
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className='h-64 animate-pulse bg-slate-100 dark:bg-slate-800' />
                ))}
              </div>
            }
          >
            <FieldReportsServer />
          </Suspense>
        </div>
      </section>

      {/* MORE NEWS - RAW FEED WITH PAGINATION */}
      <section className='border-b border-slate-300 bg-white py-12 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-[1400px] px-4'>
          <Suspense fallback={<div>Loading articles...</div>}>
            <RawFeedServer excludedIds={Array.from(excludedIds)} />
          </Suspense>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className='border-t-4 border-untele bg-gradient-to-b from-untele/20 to-white py-12 dark:to-black'>
        <div className='mx-auto max-w-[1400px] px-4 text-center'>
          <h2 className='mb-4 text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
            THE TRUTH WON&rsquo;T REPORT ITSELF
          </h2>
          <p className='mb-8 text-lg text-slate-700 dark:text-slate-300'>
            We go where mainstream media won&rsquo;t. Support independent journalism that exposes
            what they won&rsquo;t cover.
          </p>
          <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <Link
              href='/donate'
              className='bg-untele px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
            >
              FUND THE TRUTH
            </Link>
            <Link
              href='/careers'
              className='border-2 border-slate-900 bg-transparent px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-900 transition-colors hover:bg-slate-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black'
            >
              JOIN THE MISSION
            </Link>
          </div>
        </div>
      </section>

      {/* NEWSLETTER — very bottom of page */}
      <section className='border-t border-slate-300 bg-white px-4 py-12 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-[1400px]'>
          <Suspense>
            <SubscribedBanner brandColor='#D70606' />
          </Suspense>
          <NewsletterSignup list='news' source='homepage' />
        </div>
      </section>
    </div>
  );
}

async function getFrontPageData(): Promise<{
  articles: Article[];
  liveEvents: LiveEvent[];
  breakingArticles: Article[];
  trendingIds: { _id: string }[];
}> {
  try {
    // Calculate 14 days ago for breaking articles filter
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const breakingCutoffDate = fourteenDaysAgo.toISOString().split('T')[0];

    const [
      { data: liveEvents },
      { data: articles },
      { data: breakingArticles },
      { data: trendingIds },
    ] = await Promise.all([
      sanityFetch({ query: queryLiveEvents, tags: ['liveEvent'] }),
      sanityFetch({ query: queryHomepageArticles, tags: ['article'] }),
      sanityFetch({ query: queryBreakingArticles, params: { cutoffDate: breakingCutoffDate }, tags: ['article'] }),
      sanityFetch({ query: queryTrendingIds, tags: ['article'] }),
    ]);

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      liveEvents: (liveEvents as any[] as LiveEvent[]) ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      articles: (articles as any[] as Article[]) ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      breakingArticles: (breakingArticles as any[] as Article[]) ?? [],
      trendingIds: (trendingIds as { _id: string }[]) ?? [],
    };
  } catch (error) {
    console.error('Failed to fetch front page data:', error);
    return {
      articles: [],
      liveEvents: [],
      breakingArticles: [],
      trendingIds: [],
    };
  }
}
