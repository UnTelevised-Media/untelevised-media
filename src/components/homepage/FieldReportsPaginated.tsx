'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import urlForImage from '@/util/url/urlForImage';
import formatDate from '@/util/date/formatDate';
import getArticleDate from '@/util/date/getArticleDate';
import type { FieldReportArticle } from '@/models/types/feeds';
import { getFieldReports } from '@/server/actions/feeds';

interface Props {
  initialArticles: FieldReportArticle[];
  hasMore: boolean;
}

export default function FieldReportsPaginated({
  initialArticles,
  hasMore: initialHasMore,
}: Props) {
  const [articles, setArticles] = useState(initialArticles);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const { data: newArticles, hasMore: moreAvailable } = await getFieldReports(page + 1);
      setArticles((prev) => [...prev, ...newArticles]);
      setHasMore(moreAvailable);
      setPage((prev) => prev + 1);

      // Scroll to the new articles smoothly
      setTimeout(() => {
        if (gridRef.current) {
          const lastChild = gridRef.current.lastElementChild;
          if (lastChild) {
            lastChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
    } catch (error) {
      console.error('Failed to load more field reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div
        ref={gridRef}
        className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'
      >
        {articles.map((article) => (
          <Link
            key={article._id}
            href={`/articles/${article.slug?.current}`}
            className='group flex h-full flex-col border border-slate-300 bg-white transition-all hover:border-untele dark:border-slate-700 dark:bg-black'
          >
            <div className='aspect-video overflow-hidden'>
              <Image
                src={urlForImage(article.mainImage)?.url() ?? ''}
                alt={article.title ?? 'Article'}
                width={800}
                height={450}
                sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                className='object-cover transition-transform group-hover:scale-105'
                {...(urlForImage(article.mainImage)
                  ? {
                      placeholder: 'blur' as const,
                      blurDataURL: urlForImage(article.mainImage)!
                        .width(20)
                        .blur(10)
                        .url(),
                    }
                  : {})}
              />
            </div>
            <div className='flex flex-1 flex-col p-4'>
              {article.categories?.[0] && (
                <span className='mb-2 inline-block bg-untele px-2 py-1 text-xs font-black uppercase tracking-widest text-white'>
                  {article.categories[0].title}
                </span>
              )}
              <h3 className='mb-2 line-clamp-2 font-bold text-slate-800 group-hover:text-untele dark:text-slate-200'>
                {article.title ?? 'Untitled'}
              </h3>
              <p className='mb-3 line-clamp-2 flex-1 text-xs text-slate-600 dark:text-slate-400'>
                {article.description}
              </p>
              {article.location && (
                <p className='mb-3 text-xs font-medium text-slate-500 dark:text-slate-400'>
                  📍 {article.location}
                </p>
              )}
              <div className='mt-auto flex items-center justify-between text-xs text-slate-600 dark:text-slate-500'>
                <span className='font-bold uppercase'>{article.author?.name}</span>
                <span>{formatDate(getArticleDate(article))}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className='mt-12 flex justify-center'>
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className='flex items-center gap-2 bg-untele px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600 disabled:opacity-50'
          >
            {isLoading ? 'Loading...' : 'Load More'}
            <ChevronRight className='h-4 w-4' />
          </button>
        </div>
      )}
    </div>
  );
}
