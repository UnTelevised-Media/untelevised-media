// src/components/homepage/ArticleGrid.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ClockIcon,
  UserIcon,
  ArrowUpRightIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

import urlForImage from '@/util/urlForImage';
import formatDate from '@/util/formatDate';
import getTimeSinceEvent from '@/util/getTimeSinceEvent';

interface ArticleGridProps {
  articles: Article[];
  showViewToggle?: boolean;
}

const ArticleGrid: React.FC<ArticleGridProps> = ({ articles, showViewToggle = true }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (!articles?.length) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/50'>
          <div className='h-6 w-6 animate-pulse rounded-full bg-untele/50' />
        </div>
        <h3 className='mb-2 text-xl font-semibold text-slate-300'>No articles available</h3>
        <p className='text-slate-500'>Check back soon for the latest updates</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className='space-y-4'>
        {showViewToggle && (
          <div className='mb-6 flex justify-end'>
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          </div>
        )}

        {articles.map((article) => (
          <ArticleListItem key={article._id} article={article} />
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {showViewToggle && (
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold text-slate-200'>Latest Coverage</h2>
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      )}

      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
        {articles.map((article, index) => (
          <ArticleCard key={article._id} article={article} priority={index < 3} />
        ))}
      </div>
    </div>
  );
};

// Grid Article Card Component
const ArticleCard: React.FC<{ article: Article; priority?: boolean }> = ({
  article,
  priority = false,
}) => {
  return (
    <Link href={`/post/${article.slug?.current}`}>
      <article className='group relative h-full overflow-hidden rounded-xl border border-slate-600/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-untele/50 hover:shadow-2xl'>
        {/* Image Section */}
        <div className='relative aspect-video overflow-hidden'>
          <Image
            src={urlForImage(article.mainImage as any)?.url() ?? ''}
            alt={article.mainImage?.alt ?? article.title}
            fill
            className='object-cover transition-transform duration-500 group-hover:scale-110'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            priority={priority}
          />

          {/* Overlay gradient */}
          <div className='absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent' />

          {/* Category badges */}
          <div className='absolute left-3 top-3 flex flex-wrap gap-2'>
            {article.categories?.slice(0, 2).map((category) => (
              <span
                key={category._id}
                className='rounded-full border border-untele/30 bg-untele/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm'
              >
                {category.title}
              </span>
            ))}
          </div>

          {/* Time indicator */}
          <div className='absolute bottom-3 right-3 flex items-center space-x-1 rounded-full bg-slate-900/80 px-2 py-1 text-xs text-slate-300 backdrop-blur-sm'>
            <ClockIcon className='h-3 w-3' />
            <span>{formatDate(article.eventDate || article._createdAt)}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className='space-y-4 p-6'>
          {/* Title */}
          <h3 className='line-clamp-2 text-lg font-bold text-slate-200 transition-colors group-hover:text-white'>
            {article.title}
          </h3>

          {/* Description */}
          <p className='line-clamp-3 text-sm leading-relaxed text-slate-400'>
            {article.description}
          </p>

          {/* Footer */}
          <div className='flex items-center justify-between border-t border-slate-700/50 pt-4'>
            <div className='flex items-center space-x-2'>
              <UserIcon className='h-4 w-4 text-slate-500' />
              <span className='text-sm text-slate-400 transition-colors hover:text-untele'>
                {article.author?.name}
              </span>
            </div>

            <div className='flex items-center space-x-3'>
              {/* Engagement icons */}
              <div className='flex items-center space-x-2 text-slate-500'>
                <EyeIcon className='h-4 w-4' />
                <HeartIcon className='h-4 w-4 cursor-pointer transition-colors hover:text-red-400' />
                <ShareIcon className='h-4 w-4 cursor-pointer transition-colors hover:text-untele' />
              </div>

              <ArrowUpRightIcon className='h-4 w-4 text-untele transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1' />
            </div>
          </div>
        </div>

        {/* Hover glow effect */}
        <div className='absolute -inset-0.5 -z-10 rounded-xl bg-gradient-to-r from-untele/0 via-untele/20 to-untele/0 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100' />
      </article>
    </Link>
  );
};

// List Article Item Component
const ArticleListItem: React.FC<{ article: Article }> = ({ article }) => {
  return (
    <Link href={`/post/${article.slug?.current}`}>
      <article className='group flex overflow-hidden rounded-lg border border-slate-600/50 bg-slate-800/30 backdrop-blur-sm transition-all duration-300 hover:border-untele/50 hover:bg-slate-700/30'>
        {/* Thumbnail */}
        <div className='relative h-24 w-32 flex-shrink-0'>
          <Image
            src={urlForImage(article.mainImage as any)?.url() ?? ''}
            alt={article.mainImage?.alt ?? article.title}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='128px'
          />
        </div>

        {/* Content */}
        <div className='flex flex-1 flex-col justify-between p-4'>
          <div className='space-y-2'>
            {/* Categories */}
            <div className='flex flex-wrap gap-1'>
              {article.categories?.slice(0, 2).map((category) => (
                <span
                  key={category._id}
                  className='rounded-full bg-untele/20 px-2 py-0.5 text-xs text-untele'
                >
                  {category.title}
                </span>
              ))}
            </div>

            {/* Title */}
            <h3 className='line-clamp-2 font-semibold text-slate-200 transition-colors group-hover:text-white'>
              {article.title}
            </h3>
          </div>

          <div className='flex items-center justify-between text-xs text-slate-400'>
            <span>{article.author?.name}</span>
            <span>
              {article.eventDate
                ? getTimeSinceEvent(article.eventDate)
                : formatDate(article._createdAt)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

// View Toggle Component
const ViewToggle: React.FC<{
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}> = ({ viewMode, setViewMode }) => {
  return (
    <div className='flex rounded-lg border border-slate-600 bg-slate-800/50 p-1'>
      <button
        onClick={() => setViewMode('grid')}
        className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
          viewMode === 'grid' ? 'bg-untele text-white' : 'text-slate-400 hover:text-white'
        }`}
      >
        Grid
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
          viewMode === 'list' ? 'bg-untele text-white' : 'text-slate-400 hover:text-white'
        }`}
      >
        List
      </button>
    </div>
  );
};

export default ArticleGrid;
