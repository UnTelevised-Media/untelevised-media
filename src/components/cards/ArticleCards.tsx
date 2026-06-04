// src/components/cards/ArticleCards.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, ShareIcon, AlertTriangle, XCircle } from 'lucide-react';
import Link from 'next/link';

import formatDate from '@/util/formatDate';
import getArticleDate from '@/util/getArticleDate';
import urlForImage from '@/util/urlForImage';
import { getReadingTime } from '@/lib/readingTime';

// Enhanced Article Card - matches your existing design but with the blog card layout
const ArticleCard: React.FC<{ articles: Article[] }> = ({ articles }) => {
  if (!articles) {
    return null;
  }

  return (
    <>
      {articles.map((article) => (
        <Link href={`/articles/${article.slug?.current}`} key={article._id}>
          <article
            className='group relative flex flex-col overflow-hidden rounded-lg border border-slate-400 bg-slate-400/80 shadow-lg transition-all duration-300 hover:border-untele/50 hover:shadow-xl'
            aria-labelledby={`article-title-${article._id}`}
          >
            <div className='relative aspect-video overflow-hidden'>
              <Image
                src={urlForImage(article.mainImage as any)?.url() ?? ''}
                alt={article.mainImage?.alt ?? article.title}
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
                    className='inline-block w-fit rounded-full border border-untele/30 bg-untele/10 px-3 py-1 text-xs font-medium text-untele'
                  >
                    {category.title}
                  </span>
                ))}
              </div>

              {article.correction?.type === 'retraction' ? (
                <span className='mb-2 inline-flex items-center gap-1 bg-untele px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white'>
                  <XCircle className='h-2.5 w-2.5' aria-hidden='true' />
                  Retracted
                </span>
              ) : article.correction?.summary ? (
                <span className='mb-2 inline-flex items-center gap-1 bg-amber-400 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-black'>
                  <AlertTriangle className='h-2.5 w-2.5' aria-hidden='true' />
                  Corrected
                </span>
              ) : null}

              <h2
                id={`article-title-${article._id}`}
                className={`mb-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-untele${article.correction?.type === 'retraction' ? 'line-through opacity-60' : ''}`}
              >
                {article.title}
              </h2>

              <p className='mb-4 line-clamp-4 flex-grow text-sm text-slate-700'>
                {article.description}
              </p>

              <div className='mt-auto flex items-center justify-between'>
                <div className='text-sm text-slate-600'>{article.author?.name}</div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-slate-600'>
                    {formatDate(getArticleDate(article))}
                  </span>
                  <span className='text-xs uppercase tracking-widest text-slate-500'>
                    · {getReadingTime(article.body)}
                  </span>
                  <ArrowUpRight className='h-4 w-4 text-untele transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1' />
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
  if (!articles?.length) {
    return null;
  }

  return (
    <div className='flex flex-col gap-6 overflow-hidden'>
      {articles.map((article) => (
        <Link key={article._id} href={`/articles/${article.slug?.current}`}>
          <article className='flex h-24 overflow-hidden rounded-lg border border-slate-400 bg-slate-400/80 shadow-sm transition-all duration-300 hover:border-untele/50 hover:bg-slate-300'>
            {/* Thumbnail */}
            <div className='relative h-full w-24 flex-shrink-0'>
              <Image
                src={urlForImage(article.mainImage as any)?.url() ?? ''}
                alt={article.mainImage?.alt ?? article.title}
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
                      className='inline-block w-fit rounded-full border border-untele/30 bg-untele/20 px-1.5 py-0.5 text-[10px] font-medium text-untele'
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
                <span>{formatDate(getArticleDate(article))}</span>
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
  if (!article) {
    return null;
  }

  return (
    <Link href={`/articles/${article.slug?.current}`}>
      <div
        className='group relative mx-auto w-full max-w-[1400px] overflow-hidden rounded-lg border border-slate-400 shadow-xl transition-transform duration-500 hover:scale-105'
        aria-labelledby='featured-article-title'
      >
        <div className='relative h-[578px] w-full overflow-hidden'>
          <Image
            src={urlForImage(article.mainImage as any)?.url() ?? ''}
            alt={article.mainImage?.alt ?? article.title}
            fill
            className='absolute object-cover'
            sizes='(max-width: 1200px) 100vw, 1200px'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent' />
        </div>

        <div className='absolute bottom-0 left-0 w-full border-none bg-slate-900/60 backdrop-blur-sm transition duration-500 group-hover:bg-slate-800/70'>
          {article.categories?.[0] && (
            <span className='mb-1 ml-4 mt-2 inline-block rounded-full border border-untele bg-untele/90 px-3 py-1 text-xs font-medium text-white'>
              {article.categories[0].title}
            </span>
          )}

          {article.correction?.type === 'retraction' ? (
            <span className='mb-1 ml-4 inline-flex items-center gap-1 bg-untele px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white'>
              <XCircle className='h-2.5 w-2.5' aria-hidden='true' />
              Retracted
            </span>
          ) : article.correction?.summary ? (
            <span className='mb-1 ml-4 inline-flex items-center gap-1 bg-amber-400 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-black'>
              <AlertTriangle className='h-2.5 w-2.5' aria-hidden='true' />
              Corrected
            </span>
          ) : null}

          <h2
            id='featured-article-title'
            className={`mb-2 text-wrap px-4 text-2xl font-bold leading-6 text-white drop-shadow-lg${article.correction?.type === 'retraction' ? 'line-through opacity-60' : ''}`}
          >
            {article.title}
          </h2>

          <div className='flex items-center justify-between bg-gradient-to-t from-slate-900/90 to-transparent px-4 py-3'>
            <div className='flex items-center gap-4'>
              <p className='font-medium text-slate-300'>{article.author?.name}</p>
              <div className='flex items-center gap-2'>
                <ShareIcon className='h-4 w-4 cursor-pointer text-slate-400 transition-colors hover:text-untele' />
                <ArrowUpRight className='h-4 w-4 text-untele' />
              </div>
            </div>
            <div className='flex items-center gap-2 text-sm text-slate-400'>
              <span>
                {getArticleDate(article)
                  ? formatDate(getArticleDate(article))
                  : 'Date not available'}
              </span>
              <span className='text-xs uppercase tracking-widest'>
                · {getReadingTime(article.body)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export { ArticleCard, ArticleListCard, FeaturedArticleCard };
