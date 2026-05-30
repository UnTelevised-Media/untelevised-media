import type { Metadata } from 'next';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryArchiveArticles } from '@/lib/sanity/lib/queries';
import ArchiveTabs from '@/components/archive/ArchiveTabs';
import type { ArchiveArticle } from '@/components/archive/ArchiveTabs';

export const metadata: Metadata = {
  title: 'News Archive | UnTelevised Media',
  description: 'Browse every article published by UnTelevised Media, organised by year.',
};

export default async function ArchivePage() {
  const articles = await sanityFetch<ArchiveArticle[]>({
    query: queryArchiveArticles,
    tags: ['article'],
  });

  const currentYear = new Date().getFullYear();

  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      <div className='mx-auto max-w-[1400px] px-4 py-12'>
        {/* Page header */}
        <div className='mb-10 flex items-center gap-4'>
          <div className='bg-untele px-4 py-2'>
            <h1 className='text-lg font-black uppercase tracking-widest text-white'>
              News Archive
            </h1>
          </div>
          <div className='h-px flex-1 bg-slate-300 dark:bg-slate-700' />
          <span className='text-xs font-bold uppercase tracking-widest text-slate-400'>
            {articles.length} articles · 2015 – {currentYear}
          </span>
        </div>

        <ArchiveTabs articles={articles} currentYear={currentYear} />
      </div>
    </div>
  );
}
