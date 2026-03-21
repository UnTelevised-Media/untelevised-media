// src/components/cards/ArticleCardLg.tsx
// Single-article card used in category and tag grid pages.
// Wrapped externally by ClientSideRoute (Link) — no internal Link element.
import Image from 'next/image';
import { ArrowUpRight, AlertTriangle, XCircle } from 'lucide-react';

import formatDate from '@/util/formatDate';
import getArticleDate from '@/util/getArticleDate';
import urlForImage from '@/util/urlForImage';
import { getReadingTime } from '@/lib/readingTime';

type Props = {
  post: Article;
};

const ArticleCardLg = ({ post }: Props) => {
  const imageUrl = urlForImage(post.mainImage as any)?.url();

  return (
    <article
      className='group relative flex flex-col overflow-hidden rounded-lg border border-slate-400 bg-slate-400/80 shadow-lg transition-all duration-300 hover:border-untele/50 hover:shadow-xl'
      aria-labelledby={`article-title-${post._id}`}
    >
      {/* Image */}
      <div className='relative aspect-video overflow-hidden'>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.mainImage?.alt ?? post.title}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        ) : (
          <div className='h-full w-full bg-slate-700' />
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent' />
      </div>

      {/* Content */}
      <div className='flex flex-1 flex-col bg-slate-400 p-6'>
        {/* Category pills */}
        {post.categories && post.categories.length > 0 && (
          <div className='mb-4 flex flex-wrap gap-2'>
            {post.categories.map((category) => (
              <span
                key={category._id ?? category.title}
                className='inline-block w-fit rounded-full border border-untele/30 bg-untele/10 px-3 py-1 text-xs font-medium text-untele'
              >
                {category.title}
              </span>
            ))}
          </div>
        )}

        {/* Correction badges */}
        {post.correction?.type === 'retraction' ? (
          <span className='mb-2 inline-flex items-center gap-1 bg-untele px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white'>
            <XCircle className='h-2.5 w-2.5' aria-hidden='true' />
            Retracted
          </span>
        ) : post.correction?.summary ? (
          <span className='mb-2 inline-flex items-center gap-1 bg-amber-400 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-black'>
            <AlertTriangle className='h-2.5 w-2.5' aria-hidden='true' />
            Corrected
          </span>
        ) : null}

        {/* Title */}
        <h2
          id={`article-title-${post._id}`}
          className={`mb-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-untele${post.correction?.type === 'retraction' ? ' line-through opacity-60' : ''}`}
        >
          {post.title}
        </h2>

        {/* Description */}
        <p className='mb-4 line-clamp-4 flex-grow text-sm text-slate-700'>
          {post.description}
        </p>

        {/* Meta row */}
        <div className='mt-auto flex items-center justify-between'>
          <span className='text-sm text-slate-600'>{post.author?.name}</span>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-slate-600'>
              {formatDate(getArticleDate(post))}
            </span>
            {post.body && (
              <span className='text-xs uppercase tracking-widest text-slate-500'>
                · {getReadingTime(post.body)}
              </span>
            )}
            <ArrowUpRight className='h-4 w-4 text-untele transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1' />
          </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleCardLg;
