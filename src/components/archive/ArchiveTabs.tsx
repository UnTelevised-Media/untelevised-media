'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import formatDate from '@/util/formatDate';
import getArticleDate from '@/util/getArticleDate';

export interface ArchiveArticle {
  _id: string;
  _createdAt: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  eventDate?: string | null;
  description?: string;
  author?: { name: string } | null;
  categories?: { title: string; slug: { current: string } }[];
}

interface Props {
  articles: ArchiveArticle[];
  currentYear: number;
}

export default function ArchiveTabs({ articles, currentYear }: Props) {
  const YEARS = Array.from(
    { length: currentYear - 2015 + 1 },
    (_, i) => currentYear - i
  );

  const [activeYear, setActiveYear] = useState(currentYear);

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
      {/* Year tabs */}
      <div className='mb-8 flex flex-wrap gap-1 border-b border-slate-300 pb-0 dark:border-slate-700'>
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

      {/* Article list */}
      {visible.length === 0 ? (
        <p className='py-16 text-center text-sm text-slate-500 dark:text-slate-400'>
          No articles published in {activeYear}.
        </p>
      ) : (
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
      )}

      <p className='mt-8 text-center text-xs text-slate-400 dark:text-slate-600'>
        {visible.length} article{visible.length !== 1 ? 's' : ''} in {activeYear}
      </p>
    </div>
  );
}
