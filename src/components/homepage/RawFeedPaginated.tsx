'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import urlForImage from '@/util/url/urlForImage';
import formatDate from '@/util/date/formatDate';
import getArticleDate from '@/util/date/getArticleDate';
import { InFeedAd, AD_CONFIG } from '@/components/googleAdSense';
import type { RawFeedArticle } from '@/models/types/feeds';

const ARTICLES_PER_PAGE = 12;

interface Props {
  articles: RawFeedArticle[];
}

export default function RawFeedPaginated({ articles }: Props) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
  const visibleArticles = articles.slice(0, (page + 1) * ARTICLES_PER_PAGE);
  const hasMore = page < totalPages - 1;

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  // Group visible articles in chunks of 12 for ad placement
  const chunks: RawFeedArticle[][] = [];
  for (let i = 0; i < visibleArticles.length; i += ARTICLES_PER_PAGE) {
    chunks.push(visibleArticles.slice(i, i + ARTICLES_PER_PAGE));
  }

  return (
    <div>
      {chunks.map((chunk) => (
        chunk.length > 0 && (
          <div key={`chunk-${chunk[0]._id}`} className='mb-8'>
            <div className='grid gap-4 lg:grid-cols-2'>
              {chunk.map((article) => (
                <Link
                  key={article._id}
                  href={`/articles/${article.slug?.current ?? '#'}`}
                  className='group flex border-l-4 border-slate-300 bg-slate-50 p-4 transition-all hover:border-untele hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900'
                >
                  <div className='flex-shrink-0'>
                    <div className='relative h-16 w-16 overflow-hidden rounded'>
                      <Image
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        src={urlForImage(article.mainImage as any)?.url() ?? ''}
                        alt={article.title ?? 'Article'}
                        fill
                        className='object-cover transition-transform group-hover:scale-105'
                        loading='lazy'
                      />
                    </div>
                  </div>
                  <div className='ml-4 flex-1'>
                    <div className='flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-500'>
                      {article.author?.name && (
                        <>
                          <span className='font-black uppercase'>{article.author.name}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{formatDate(getArticleDate(article))}</span>
                      {article.categories?.[0] && (
                        <>
                          <span>•</span>
                          <span className='font-black uppercase text-untele'>{article.categories[0].title}</span>
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
                </Link>
              ))}
            </div>

            {/* Ad after every 12 articles */}
            <div className='mt-4'>
              <InFeedAd
                slot={AD_CONFIG.AD_SLOTS.IN_FEED}
                className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
              />
            </div>
          </div>
        )
      ))}

      {/* Load more button */}
      {hasMore && (
        <div className='flex justify-center py-8'>
          <button
            onClick={handleLoadMore}
            className='bg-untele px-8 py-3 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
          >
            LOAD MORE
          </button>
        </div>
      )}
    </div>
  );
}
