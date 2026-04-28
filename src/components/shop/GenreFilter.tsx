'use client';
// Genre filter tabs — client component for URL-based filtering.
// Uses searchParams to filter (handled server-side via URL; this is just the UI).

import { useRouter, useSearchParams } from 'next/navigation';
import type { SanityBookGenre } from '@/lib/shop/types';

export default function GenreFilter({ genres }: { genres: SanityBookGenre[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('genre');

  const select = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('genre', slug);
    } else {
      params.delete('genre');
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className='mb-4 flex flex-wrap gap-2'>
      <button
        onClick={() => select(null)}
        className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-colors ${
          !active
            ? 'bg-untele text-white'
            : 'border border-slate-300 bg-white text-slate-600 hover:border-untele hover:text-untele dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
        }`}
      >
        All
      </button>
      {genres.map((genre) => (
        <button
          key={genre._id}
          onClick={() => select(genre.slug.current)}
          className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-colors ${
            active === genre.slug.current
              ? 'bg-untele text-white'
              : 'border border-slate-300 bg-white text-slate-600 hover:border-untele hover:text-untele dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
          }`}
        >
          {genre.title}
        </button>
      ))}
    </div>
  );
}
