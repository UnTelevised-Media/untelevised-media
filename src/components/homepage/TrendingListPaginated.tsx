'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import formatDate from '@/util/formatDate';

export interface TrendingListArticle {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  author: { name: string; slug: { current: string } } | null;
  categories?: { title: string; slug: { current: string } }[];
}

const PAGE_SIZE = 6;

export default function TrendingListPaginated({ articles }: { articles: TrendingListArticle[] }) {
  const [page, setPage] = useState(0);

  // Cap at 30 items so total depth = 31 (card is #1, list covers #2–#31)
  const capped = articles.slice(0, 30);
  const totalPages = Math.ceil(capped.length / PAGE_SIZE);
  const visible = capped.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Article rank numbers — list starts at #2 since card holds #1
  const rankOffset = page * PAGE_SIZE + 2;
  const startRank = rankOffset;
  const endRank = rankOffset + visible.length - 1;

  return (
    <section aria-label='More most-read articles'>
      {/* Pagination controls — pinned at top */}
      <div className='flex items-center justify-between border border-b-0 border-border px-3 py-2'>
        <div className='flex items-center gap-1.5 bg-untele px-2 py-0.5'>
          <TrendingUp className='h-3 w-3 text-white' aria-hidden='true' />
          <span className='text-[10px] font-black uppercase tracking-widest text-white'>Trending</span>
        </div>
        <div className='flex items-center gap-1'>
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            aria-label='Previous page'
            className='p-1 text-muted-foreground transition-colors hover:text-untele disabled:cursor-not-allowed disabled:opacity-30'
          >
            <ChevronLeft className='h-4 w-4' />
          </button>
          <span className='min-w-[2rem] text-center text-xs text-muted-foreground'>
            {page + 1}/{totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            aria-label='Next page'
            className='p-1 text-muted-foreground transition-colors hover:text-untele disabled:cursor-not-allowed disabled:opacity-30'
          >
            <ChevronRight className='h-4 w-4' />
          </button>
        </div>
      </div>

      <ol className='divide-y divide-border border border-border'>
        {visible.map((article, index) => (
          <li key={article._id} className='group'>
            <Link
              href={`/articles/${article.slug.current}`}
              className='flex items-start gap-3 p-3 transition-colors hover:bg-muted/50'
            >
              <span className='w-7 shrink-0 text-2xl font-black leading-none tabular-nums text-muted-foreground/30'>
                {rankOffset + index}
              </span>
              <div className='min-w-0 flex-1 space-y-1'>
                {article.categories?.[0] && (
                  <span className='inline-block bg-untele px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white'>
                    {article.categories[0].title}
                  </span>
                )}
                <p className='line-clamp-2 text-sm font-black uppercase leading-tight tracking-wide transition-colors group-hover:text-untele'>
                  {article.title}
                </p>
                <div className='flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground'>
                  {article.author?.name && <span>{article.author.name}</span>}
                  {article.publishedAt && (
                    <>
                      {article.author?.name && <span aria-hidden='true'>·</span>}
                      <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                    </>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
