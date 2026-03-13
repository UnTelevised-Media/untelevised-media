'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import urlForImage from '@/util/urlForImage';
import formatDate from '@/util/formatDate';
import getArticleDate from '@/util/getArticleDate';
import { InFeedAd, BannerAd, AD_CONFIG } from '@/components/ads';

interface RawFeedProps {
  articles: Article[];
}

const ARTICLES_PER_PAGE = 6;

const RawFeed: React.FC<RawFeedProps> = ({ articles }) => {
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE);

  const visibleArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + ARTICLES_PER_PAGE, articles.length));
  };

  return (
    <section className='bg-white py-12 dark:bg-black'>
      <div className='mx-auto max-w-[1400px] px-4'>
        <div className='mb-8 border-b border-slate-300 pb-4 dark:border-slate-800'>
          <h2 className='text-2xl font-black uppercase tracking-widest text-untele'>RAW FEED</h2>
          <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>
            Unfiltered. Uncensored. Direct from our correspondents.
          </p>
        </div>

        <div className='grid gap-4 lg:grid-cols-2'>
          {visibleArticles.map((article, index) => (
            <React.Fragment key={article._id}>
              <div className='group flex border-l-4 border-slate-300 bg-slate-50 p-4 transition-all hover:border-untele hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900'>
                <div className='flex-shrink-0'>
                  <div className='relative h-16 w-16 overflow-hidden rounded'>
                    <Image
                      src={
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        urlForImage(article.mainImage as any)?.url() ?? ''
                      }
                      alt={article.title}
                      fill
                      className='object-cover transition-transform group-hover:scale-105'
                    />
                  </div>
                </div>
                <div className='ml-4 flex-1'>
                  <div className='flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-500'>
                    <span className='font-black uppercase'>{article.author?.name}</span>
                    <span>•</span>
                    <span>{formatDate(getArticleDate(article))}</span>
                    {article.categories?.[0] && (
                      <>
                        <span>•</span>
                        <span className='font-black uppercase text-untele'>
                          {article.categories[0].title}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className='mt-1 font-bold text-slate-800 group-hover:text-untele dark:text-slate-200'>
                    {article.title}
                  </h3>
                  <p className='mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400'>
                    {article.description}
                  </p>
                </div>
              </div>

              {/* Add in-feed ad after every 6 articles */}
              {(index + 1) % 6 === 0 && index < visibleArticles.length - 1 && (
                <div className='lg:col-span-2'>
                  <InFeedAd
                    slot={AD_CONFIG.AD_SLOTS.IN_FEED}
                    className='my-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Banner ad before load more button */}
        {visibleCount >= 12 && (
          <div className='mt-8'>
            <BannerAd
              slot={AD_CONFIG.AD_SLOTS.FEED_PAGINATION}
              className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
            />
          </div>
        )}

        {hasMore && (
          <div className='mt-8 flex justify-center'>
            <button
              onClick={loadMore}
              className='bg-untele px-8 py-3 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
            >
              LOAD MORE
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RawFeed;
