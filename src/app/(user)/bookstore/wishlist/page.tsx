'use client';
// src/app/(user)/bookstore/wishlist/page.tsx
// Book wishlist page — reads from useWishlist hook (local + Sanity).

import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/hooks/useWishlist';
import WishlistButton from '@/components/bookstore/WishlistButton';

export default function WishlistPage() {
  const { wishlist, loading, ready } = useWishlist();

  return (
    <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
      {/* Header */}
      <div className='mb-6 flex items-center gap-3'>
        <div className='bg-untele px-3 py-1'>
          <span className='text-sm font-black uppercase tracking-widest text-white'>Wishlist</span>
        </div>
        <div className='h-px flex-1 bg-hp-sand-border dark:bg-hp-dark-border' />
        <Link
          href='/bookstore'
          className='text-[10px] font-black uppercase tracking-widest text-hp-muted hover:text-untele'
        >
          ← Back to Store
        </Link>
      </div>

      {!ready || loading ? (
        <div className='border border-hp-sand-border bg-white px-4 py-16 text-center dark:border-hp-dark-border dark:bg-hp-dark-card'>
          <p className='text-xs font-bold uppercase tracking-widest text-hp-muted'>Loading…</p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className='border border-hp-sand-border bg-white px-4 py-16 text-center dark:border-hp-dark-border dark:bg-hp-dark-card'>
          <p className='mb-4 text-base font-black uppercase tracking-widest text-slate-900 dark:text-hp-cream'>
            Your wishlist is empty
          </p>
          <p className='mb-6 text-sm text-hp-muted'>Star books while browsing to save them here.</p>
          <Link
            href='/bookstore'
            className='inline-block bg-untele px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:opacity-90'
          >
            Browse Books →
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {wishlist.map((entry) => (
            <div
              key={entry.slug}
              className='flex gap-4 border border-hp-sand-border bg-white p-4 dark:border-hp-dark-border dark:bg-hp-dark-card'
            >
              {/* Cover thumbnail */}
              <Link href={`/bookstore/book/${entry.slug}`} className='shrink-0'>
                {entry.coverImageUrl ? (
                  <div className='relative h-24 w-16 overflow-hidden bg-hp-sand dark:bg-hp-dark-border'>
                    <Image
                      src={entry.coverImageUrl}
                      alt={entry.title}
                      fill
                      className='object-cover'
                      sizes='64px'
                    />
                  </div>
                ) : (
                  <div className='flex h-24 w-16 items-center justify-center bg-hp-sand dark:bg-hp-dark-border'>
                    <span className='text-center text-[9px] font-bold uppercase tracking-widest text-hp-muted'>
                      {entry.title}
                    </span>
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className='flex flex-1 flex-col justify-between'>
                <div>
                  <p className='mb-0.5 text-[10px] font-bold uppercase tracking-widest text-hp-muted'>
                    {entry.authorName ?? 'Unknown Author'}
                  </p>
                  <Link
                    href={`/bookstore/book/${entry.slug}`}
                    className='text-sm font-black leading-tight text-slate-900 hover:text-untele dark:text-hp-cream'
                  >
                    {entry.title}
                  </Link>
                  {entry.price != null && (
                    <p className='mt-1 text-xs font-bold text-untele'>${entry.price.toFixed(2)}</p>
                  )}
                </div>
                <div className='mt-3 flex items-center gap-2'>
                  <Link
                    href={`/bookstore/book/${entry.slug}`}
                    className='bg-untele px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90'
                  >
                    View Book
                  </Link>
                  <WishlistButton
                    slug={entry.slug}
                    title={entry.title}
                    coverImageUrl={entry.coverImageUrl}
                    authorName={entry.authorName}
                    price={entry.price}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
