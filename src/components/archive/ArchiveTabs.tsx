'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { List, LayoutGrid } from 'lucide-react';
import formatDate from '@/util/formatDate';
import getArticleDate from '@/util/getArticleDate';
import urlForImage from '@/util/urlForImage';
import { RectangleAd, AD_CONFIG } from '@/components/ads';

export interface ArchiveArticle {
  _id: string;
  _createdAt: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  eventDate?: string | null;
  description?: string;
  mainImage?: { asset: { _ref: string }; alt?: string };
  author?: { name: string } | null;
  categories?: { title: string; slug: { current: string } }[];
}

interface Props {
  articles: ArchiveArticle[];
  currentYear: number;
}

type View = 'list' | 'cards';

export default function ArchiveTabs({ articles, currentYear }: Props) {
  const YEARS = Array.from(
    { length: currentYear - 2015 + 1 },
    (_, i) => currentYear - i
  );

  const [activeYear, setActiveYear] = useState(currentYear);
  const [view, setView] = useState<View>('list');

  const byYear = useMemo(() => {
    const map = new Map<number, ArchiveArticle[]>();
    for (const article of articles) {
      const date = getArticleDate(article);
      const year = date ? new Date(date).getFullYear() : null;
      if (!year) continue;
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(article);
    }
    return map;
  }, [articles]);

  const visible = byYear.get(activeYear) ?? [];

  return (
    <div>
      {/* Year tabs + view toggle */}
      <div className='mb-8 flex items-end justify-between gap-4 border-b border-slate-300 dark:border-slate-700'>
        <div className='flex flex-wrap gap-1 pb-0'>
          {YEARS.map((year) => {
            const count = byYear.get(year)?.length ?? 0;
            const isActive = year === activeYear;
            return (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`relative px-4 py-2.5 text-sm font-black uppercase tracking-widest transition-colors ${
                  isActive
                    ? 'border-b-2 border-untele text-untele'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {year}
                {count > 0 && (
                  <span
                    className={`ml-1.5 text-[10px] ${isActive ? 'text-untele/70' : 'text-slate-400'}`}
                  >
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* View toggle */}
        <div className='mb-px flex shrink-0 items-center gap-1 pb-2'>
          <button
            onClick={() => setView('list')}
            aria-label='List view'
            aria-pressed={view === 'list'}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-colors ${
              view === 'list'
                ? 'bg-untele text-white'
                : 'border border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <List className='h-3.5 w-3.5' />
            List
          </button>
          <button
            onClick={() => setView('cards')}
            aria-label='Cards view'
            aria-pressed={view === 'cards'}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-colors ${
              view === 'cards'
                ? 'bg-untele text-white'
                : 'border border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className='h-3.5 w-3.5' />
            Cards
          </button>
        </div>
      </div>

      {/* Empty state */}
      {visible.length === 0 ? (
        <p className='py-16 text-center text-sm text-slate-500 dark:text-slate-400'>
          No articles published in {activeYear}.
        </p>
      ) : view === 'list' ? (
        /* ── LIST VIEW ── */
        <ol className='divide-y divide-slate-200 dark:divide-slate-800'>
          {visible.map((article) => {
            const date = getArticleDate(article);
            return (
              <li key={article._id}>
                <Link
                  href={`/articles/${article.slug.current}`}
                  className='group flex items-start gap-4 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-950 sm:px-2'
                >
                  {/* Date column */}
                  <time
                    dateTime={date ?? ''}
                    className='w-28 shrink-0 pt-0.5 text-xs font-mono text-slate-400 dark:text-slate-500'
                  >
                    {date ? formatDate(date) : '—'}
                  </time>

                  {/* Category pill */}
                  {article.categories?.[0] && (
                    <span className='mt-0.5 hidden shrink-0 bg-untele px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white sm:inline-block'>
                      {article.categories[0].title}
                    </span>
                  )}

                  {/* Title + author */}
                  <div className='min-w-0 flex-1'>
                    <p className='font-bold leading-snug text-slate-800 transition-colors group-hover:text-untele dark:text-slate-200'>
                      {article.title}
                    </p>
                    {article.author?.name && (
                      <p className='mt-0.5 text-xs text-slate-500 dark:text-slate-400'>
                        {article.author.name}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        /* ── CARDS VIEW ── */
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {visible.flatMap((article, index) => {
            const date = getArticleDate(article);
            const imageUrl = urlForImage(article.mainImage)?.width(600).height(338).url();

            const card = (
              <Link
                key={article._id}
                href={`/articles/${article.slug.current}`}
                className='group flex flex-col border border-slate-300 bg-white transition-all hover:border-untele dark:border-slate-700 dark:bg-black'
              >
                {/* Thumbnail */}
                <div className='aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900'>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={article.mainImage?.alt ?? article.title}
                      width={600}
                      height={338}
                      sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw'
                      className='h-full w-full object-cover transition-transform group-hover:scale-105'
                      placeholder='blur'
                      blurDataURL={urlForImage(article.mainImage)!.width(20).blur(10).url()}
                    />
                  ) : (
                    <div className='flex h-full items-center justify-center'>
                      <span className='text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600'>
                        No image
                      </span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className='flex flex-1 flex-col p-4'>
                  {article.categories?.[0] && (
                    <span className='mb-2 inline-block self-start bg-untele px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white'>
                      {article.categories[0].title}
                    </span>
                  )}
                  <h3 className='mb-2 line-clamp-2 font-bold leading-snug text-slate-800 transition-colors group-hover:text-untele dark:text-slate-200'>
                    {article.title}
                  </h3>
                  {article.description && (
                    <p className='mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      {article.description}
                    </p>
                  )}
                  <div className='mt-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-500'>
                    {article.author?.name && (
                      <span className='font-bold uppercase'>{article.author.name}</span>
                    )}
                    <time dateTime={date ?? ''} className='font-mono'>
                      {date ? formatDate(date) : '—'}
                    </time>
                  </div>
                </div>
              </Link>
            );

            const items: React.ReactNode[] = [card];

            // Inject a rectangle ad after every 9th article (not after the last)
            if ((index + 1) % 9 === 0 && index < visible.length - 1) {
              items.push(
                <div
                  key={`ad-${index}`}
                  className='flex flex-col items-center justify-center border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950'
                >
                  <p className='mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                    Advertisement
                  </p>
                  <RectangleAd slot={AD_CONFIG.AD_SLOTS.ARCHIVE_IN_FEED} responsive />
                </div>
              );
            }

            return items;
          })}
        </div>
      )}

      <p className='mt-8 text-center text-xs text-slate-400 dark:text-slate-600'>
        {visible.length} article{visible.length !== 1 ? 's' : ''} in {activeYear}
      </p>
    </div>
  );
}
