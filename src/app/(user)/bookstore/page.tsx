// src/app/(user)/bookstore/page.tsx
// Bookstore homepage — featured book hero, all-books grid, genre filter.

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryFeaturedBooks, queryAllBooks, queryAllBookGenres } from '@/lib/sanity/lib/queries';
import type { SanityBook, SanityBookGenre } from '@/lib/bookstore/types';
import urlForImage from '@/util/urlForImage';
import GenreFilter from '@/components/bookstore/GenreFilter';

export const metadata: Metadata = {
  title: 'Bookstore — UnTelevised Media',
  description:
    'Independent books by literary authors. Physical and digital editions. Unfiltered. Uncensored. Uncompromising.',
  openGraph: {
    title: 'Bookstore — UnTelevised Media',
    description: 'Independent books by literary authors — UnTelevised Media',
    type: 'website',
  },
};

function BookCard({ book }: { book: SanityBook }) {
  const slug = book.slug.current;
  const price = book.formats?.[0]?.price;
  const cover = book.coverImage?.asset
    ? urlForImage(book.coverImage).width(400).height(560).url()
    : (book.coverImageUrl ?? null);

  return (
    <Link
      href={`/bookstore/book/${slug}`}
      className='group block border border-hp-sand-border bg-white transition-colors hover:border-untele dark:border-hp-dark-border dark:bg-hp-dark-card'
    >
      <div className='relative aspect-[5/7] overflow-hidden bg-hp-sand dark:bg-hp-dark-border'>
        {cover ? (
          <Image
            src={cover}
            alt={book.coverImage?.alt ?? book.title}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
          />
        ) : (
          <div className='flex h-full items-center justify-center p-4'>
            <span className='text-center text-xs font-bold uppercase tracking-widest text-hp-muted'>
              {book.title}
            </span>
          </div>
        )}
        {book.status === 'out-of-stock' && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/60'>
            <span className='bg-untele px-2 py-1 text-xs font-black uppercase tracking-widest text-white'>
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className='p-3'>
        <p className='mb-0.5 text-[10px] font-bold uppercase tracking-widest text-hp-muted dark:text-hp-muted'>
          {book.author?.name ?? 'Unknown Author'}
        </p>
        <h3 className='text-sm font-black leading-tight text-slate-900 group-hover:text-untele dark:text-hp-cream'>
          {book.title}
        </h3>
        {price != null && (
          <p className='mt-1 text-xs font-bold text-untele'>${price.toFixed(2)}</p>
        )}
      </div>
    </Link>
  );
}

function FeaturedHero({ book }: { book: SanityBook }) {
  const slug = book.slug.current;
  const price = book.formats?.[0]?.price;
  const cover = book.coverImage?.asset
    ? urlForImage(book.coverImage).width(800).height(1120).url()
    : (book.coverImageUrl ?? null);

  return (
    <div className='relative flex flex-col items-start gap-6 border border-untele bg-white p-6 dark:bg-hp-dark-card sm:flex-row sm:p-8 lg:p-12'>
      {/* Cover */}
      <div className='relative w-full shrink-0 sm:w-56 lg:w-72'>
        <div className='relative aspect-[5/7] overflow-hidden bg-hp-sand shadow-xl dark:bg-hp-dark-border'>
          {cover ? (
            <Image
              src={cover}
              alt={book.coverImage?.alt ?? book.title}
              fill
              priority
              className='object-cover'
              sizes='(max-width: 640px) 90vw, 288px'
            />
          ) : (
            <div className='flex h-full items-center justify-center p-4'>
              <span className='text-center text-sm font-black uppercase tracking-widest text-hp-muted'>
                {book.title}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className='flex flex-col justify-center'>
        <div className='mb-3 inline-block bg-untele px-2 py-0.5'>
          <span className='text-[10px] font-black uppercase tracking-widest text-white'>
            Featured
          </span>
        </div>
        <p className='mb-1 text-xs font-bold uppercase tracking-widest text-hp-muted'>
          {book.author?.name ?? 'Unknown Author'}
        </p>
        <h2 className='mb-3 text-2xl font-black uppercase leading-none tracking-tight text-slate-900 dark:text-hp-cream lg:text-4xl'>
          {book.title}
        </h2>
        {price != null && (
          <p className='mb-4 text-lg font-black text-untele'>From ${price.toFixed(2)}</p>
        )}
        <div className='flex flex-wrap gap-3'>
          <Link
            href={`/bookstore/book/${slug}`}
            className='bg-untele px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:opacity-90'
          >
            View Book
          </Link>
          {book.samplePdfUrl && (
            <a
              href={book.samplePdfUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='border border-hp-sand-border bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-untele hover:text-untele dark:border-hp-dark-border dark:bg-hp-dark-card dark:text-hp-cream'
            >
              Free Sample
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function ShopPage() {
  const [featuredResult, allBooksResult, genresResult] = await Promise.all([
    sanityFetch<SanityBook[]>({ query: queryFeaturedBooks, tags: ['book'] }),
    sanityFetch<SanityBook[]>({ query: queryAllBooks, tags: ['book'] }),
    sanityFetch<SanityBookGenre[]>({ query: queryAllBookGenres, tags: ['bookGenre'] }),
  ]);

  const featured = featuredResult ?? [];
  const allBooks = allBooksResult ?? [];
  const genres = genresResult ?? [];

  const heroBook = featured[0] ?? allBooks[0];

  return (
    <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
      {/* Page header */}
      <div className='mb-6 flex items-center gap-3'>
        <div className='bg-untele px-3 py-1'>
          <span className='text-sm font-black uppercase tracking-widest text-white'>Bookstore</span>
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
    </main>
  );
}
