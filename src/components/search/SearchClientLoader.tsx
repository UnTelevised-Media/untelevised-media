'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import type SearchClientType from './SearchClient';

function SearchSkeleton() {
  return (
    <div>
      <div className='mb-6 flex items-center gap-3 bg-untele px-4 py-3'>
        <Search className='h-4 w-4 text-white' aria-hidden='true' />
        <p className='text-xs font-black uppercase tracking-widest text-white'>Search</p>
      </div>
      <div className='mb-6 h-10 animate-pulse bg-slate-200 dark:bg-slate-800' />
      <div className='flex flex-col gap-8 sm:flex-row sm:items-start'>
        <div className='hidden w-52 shrink-0 sm:block'>
          <div className='h-48 animate-pulse bg-slate-200 dark:bg-slate-800' />
        </div>
        <div className='flex-1 space-y-4'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='flex gap-4 border border-border p-4'>
              <div className='hidden h-20 w-28 shrink-0 animate-pulse bg-slate-200 dark:bg-slate-800 sm:block' />
              <div className='flex-1 space-y-2'>
                <div className='h-4 animate-pulse bg-slate-200 dark:bg-slate-800' />
                <div className='h-3 w-3/4 animate-pulse bg-slate-200 dark:bg-slate-800' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchClientLoader({ initialQuery }: { initialQuery: string }) {
  const [SearchClient, setSearchClient] = useState<typeof SearchClientType | null>(null);

  useEffect(() => {
    import('./SearchClient').then((mod) => {
      setSearchClient(() => mod.default);
    });
  }, []);

  if (!SearchClient) return <SearchSkeleton />;
  return <SearchClient initialQuery={initialQuery} />;
}
