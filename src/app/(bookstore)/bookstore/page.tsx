// src/app/(user)/bookstore/page.tsx
// Bookstore homepage — featured book hero, all-books grid, genre filter.

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import sanityFetch from '@/lib/sanity/lib/fetch';
import {
  queryFeaturedBooks,
  queryAllBooks,
  queryAllBookGenres,
  queryBooksByGenreSlug,
} from '@/lib/sanity/lib/queries';
import type { SanityBook, SanityBookGenre } from '@/models/types/bookstore';
import GenreFilter from '@/components/bookstore/GenreFilter';
import BookstoreNewsletter from '@/components/bookstore/BookstoreNewsletter';
import BookCard from '@/components/bookstore/BookCard';
import FeaturedHero from '@/components/bookstore/FeaturedHero';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import { SubscribedBanner } from '@/components/newsletter/SubscribedBanner';

export const metadata: Metadata = {
  title: 'Bookstore — Hurriya Publications',
  description:
    'Independent books by literary authors. Author-first revenue. Physical and digital editions. An UnTelevised Media imprint.',
  openGraph: {
    title: 'Hurriya Publications Bookstore',
    description:
      'Independent books by literary authors — author-first revenue, transparent splits, direct tipping. An UnTelevised Media imprint.',
    type: 'website',
    images: [
      {
        url: '/hurriya-pub/Logo-alt.png',
        width: 1200,
        height: 630,
        alt: 'Hurriya Publications — An UnTelevised Media Imprint',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hurriya Publications Bookstore',
    description:
      'Independent books by literary authors — author-first revenue. An UnTelevised Media imprint.',
    images: ['/hurriya-pub/Logo-alt.png'],
  },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string }>;
}) {
  const { genre: activeGenre } = await searchParams;

  const [featuredResult, allBooksResult, genresResult] = await Promise.all([
    sanityFetch<SanityBook[]>({ query: queryFeaturedBooks, tags: ['book'] }),
    activeGenre
      ? sanityFetch<SanityBook[]>({
          query: queryBooksByGenreSlug,
          params: { genreSlug: activeGenre },
          tags: ['book'],
        })
      : sanityFetch<SanityBook[]>({ query: queryAllBooks, tags: ['book'] }),
    sanityFetch<SanityBookGenre[]>({ query: queryAllBookGenres, tags: ['bookGenre'] }),
  ]);

  const featured = featuredResult ?? [];
  const allBooks = allBooksResult ?? [];
  const genres = genresResult ?? [];

  const heroBook = featured[0] ?? allBooks[0];

  return (
    <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
      <Suspense>
        <SubscribedBanner brandColor='#009736' />
      </Suspense>
      <PageViewTracker
        event='view_bookstore_home'
        params={{ featured_book_count: featured.length, total_book_count: allBooks.length }}
      />
      {/* Page header */}
      <div className='mb-6 flex items-center gap-3'>
        <div className='bg-untele px-3 py-1'>
          <span className='text-sm font-black uppercase tracking-widest text-white'>
            Bookstore
          </span>
        </div>
        <div className='h-px flex-1 bg-hp-sand-border dark:bg-hp-dark-border' />
      </div>

      {/* Featured hero */}
      {heroBook && (
        <section className='mb-10'>
          <FeaturedHero book={heroBook} />
        </section>
      )}

      {/* Genre filter + book grid */}
      <section>
        <div className='mb-4 flex items-center gap-3'>
          <div className='bg-untele px-2 py-0.5'>
            <span className='text-[10px] font-black uppercase tracking-widest text-white'>
              All Books
            </span>
          </div>
          <div className='h-px flex-1 bg-hp-sand-border dark:bg-hp-dark-border' />
        </div>

        {genres.length > 0 && (
          <Suspense>
            <GenreFilter genres={genres} />
          </Suspense>
        )}

        {allBooks.length === 0 ? (
          <div className='border border-hp-sand-border bg-white px-4 py-12 text-center dark:border-hp-dark-border dark:bg-hp-dark-card'>
            <p className='text-xs font-bold uppercase tracking-widest text-hp-muted'>
              No books available yet
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
            {allBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter signup */}
      <section className='mt-12'>
        <BookstoreNewsletter source='bookstore-home' />
      </section>
    </main>
  );
}
