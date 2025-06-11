// src/components/cards/ArticleCards.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, ShareIcon } from 'lucide-react';
import Link from 'next/link';

import formatDate from '@/util/formatDate';
import urlForImage from '@/util/urlForImage';

// Enhanced Article Card - matches your existing design but with the blog card layout
const ArticleCard: React.FC<{ articles: Article[] }> = ({ articles }) => {
  if (!articles) return null;

  return (
    <>
      {articles.map((article) => (
        <Link href={`/post/${article.slug?.current}`} key={article._id}>
          <article
            className='hover:border-untele/50 group relative flex flex-col overflow-hidden rounded-lg border border-slate-400 bg-slate-400/80 shadow-lg transition-all duration-300 hover:shadow-xl'
            aria-labelledby={`article-title-${article._id}`}
          >
            <div className='relative aspect-video overflow-hidden'>
              <Image
                src={urlForImage(article.mainImage as any)?.url() || ''}
                alt={article.mainImage?.alt || article.title}
                fill
                className='object-cover transition-transform duration-300 group-hover:scale-105'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent' />
            </div>

            <div className='flex flex-1 flex-col bg-slate-400 p-6'>
              <div className='mb-4 flex flex-wrap gap-2'>
                {article.categories?.map((category) => (
                  <span
                    key={category._id}
                    className='bg-untele/10 border-untele/30 text-untele rounded-full border px-3 py-1 text-xs font-medium'
                  >
                    {category.title}
                  </span>
                ))}
              </div>

              <h2
                id={`article-title-${article._id}`}
                className='group-hover:text-untele mb-2 text-xl font-bold text-slate-900 transition-colors'
              >
                {article.title}
              </h2>

              <p className='mb-4 line-clamp-3 flex-grow text-sm text-slate-700'>
                {article.description}
              </p>

              <div className='mt-auto flex items-center justify-between'>
                <div className='text-sm text-slate-600'>{article.author?.name}</div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-slate-600'>
                    {formatDate(article.eventDate || article._createdAt)}
                  </span>
                  <ArrowUpRight className='text-untele h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1' />
                </div>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </>
  );
};

// Compact Article List Card
const ArticleListCard: React.FC<{ articles: Article[] }> = ({ articles }) => {
  if (!articles?.length) return null;

  return (
    <div className='flex flex-col gap-6 overflow-hidden'>
      {articles.map((article) => (
        <Link key={article._id} href={`/post/${article.slug?.current}`}>
          <article className='hover:border-untele/50 flex h-24 overflow-hidden rounded-lg border border-slate-400 bg-slate-400/80 shadow-sm transition-all duration-300 hover:bg-slate-300'>
            {/* Thumbnail */}
            <div className='relative h-full w-24 flex-shrink-0'>
              <Image
                src={urlForImage(article.mainImage as any)?.url() || ''}
                alt={article.mainImage?.alt || article.title}
                fill
                className='object-cover'
                sizes='96px'
              />
            </div>

            {/* Content */}
            <div className='flex flex-1 flex-col justify-between space-y-1 p-2'>
              <div className='space-y-2'>
                {/* Category Pills */}
                <div className='flex flex-wrap gap-1'>
                  {article.categories?.map((category) => (
                    <span
                      key={category._id}
                      className='bg-untele/20 border-untele/30 text-untele rounded-full border px-1.5 py-0.5 text-[10px] font-medium'
                    >
                      {category.title}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3 className='line-clamp-2 text-sm font-medium text-slate-900'>
                  {article.title}
                </h3>
              </div>

              <div className='mt-auto flex items-center justify-between text-xs text-slate-600'>
                <span>{article.author?.name}</span>
                <span>{formatDate(article.eventDate || article._createdAt)}</span>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
};

// Featured Article Card - Hero style
const FeaturedArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  if (!article) return null;

  return (
    <Link href={`/post/${article.slug?.current}`}>
      <div
        className='group relative mx-auto w-full max-w-6xl overflow-hidden rounded-lg border border-slate-400 shadow-xl transition-transform duration-500 hover:scale-105'
        aria-labelledby='featured-article-title'
      >
        <div className='relative h-[578px] w-full overflow-hidden'>
          <Image
            src={urlForImage(article.mainImage as any)?.url() || ''}
            alt={article.mainImage?.alt || article.title}
            fill
            className='absolute object-cover'
            sizes='(max-width: 1200px) 100vw, 1200px'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent' />
        </div>

        <div className='absolute bottom-0 left-0 w-full border-none bg-slate-900/60 backdrop-blur-sm transition duration-500 group-hover:bg-slate-800/70'>
          {article.categories?.[0] && (
            <span className='bg-untele/90 border-untele mb-1 ml-4 mt-2 inline-block rounded-full border px-3 py-1 text-xs font-medium text-white'>
              {article.categories[0].title}
            </span>
          )}

          <h2
            id='featured-article-title'
            className='mb-2 text-wrap px-4 text-2xl font-bold leading-6 text-white drop-shadow-lg'
          >
            {article.title}
          </h2>

          <div className='flex items-center justify-between bg-gradient-to-t from-slate-900/90 to-transparent px-4 py-3'>
            <div className='flex items-center gap-4'>
              <p className='font-medium text-slate-300'>{article.author?.name}</p>
              <div className='flex items-center gap-2'>
                <ShareIcon className='hover:text-untele h-4 w-4 cursor-pointer text-slate-400 transition-colors' />
                <ArrowUpRight className='text-untele h-4 w-4' />
              </div>
            </div>
            <p className='text-sm text-slate-400'>
              {article.eventDate || article._createdAt
                ? formatDate(article.eventDate || article._createdAt)
                : 'Date not available'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export { ArticleCard, ArticleListCard, FeaturedArticleCard };
