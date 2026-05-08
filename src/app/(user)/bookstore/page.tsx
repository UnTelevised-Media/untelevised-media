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
import type { SanityBook, SanityBookGenre } from '@/lib/bookstore/types';
import urlForImage from '@/util/urlForImage';
import GenreFilter from '@/components/bookstore/GenreFilter';
import BookCardActions from '@/components/bookstore/BookCardActions';
import BookstoreNewsletter from '@/components/bookstore/BookstoreNewsletter';
import WishlistButton from '@/components/bookstore/WishlistButton';

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
    description: 'Independent books by literary authors — author-first revenue. An UnTelevised Media imprint.',
    images: ['/hurriya-pub/Logo-alt.png'],
  },
};

function BookCard({ book }: { book: SanityBook }) {
  const slug = book.slug.current;
  const firstFormat = book.formats?.[0];
  const price = firstFormat?.price;
  const compareAtPrice = firstFormat?.compareAtPrice;
  const isOutOfStock = book.status === 'out-of-stock';
  const cover = book.coverImage?.asset
    ? urlForImage(book.coverImage).width(400).height(560).url()
    : (book.coverImageUrl ?? null);

  return (
    <div className='group flex flex-col border border-hp-sand-border bg-white transition-colors hover:border-untele dark:border-hp-dark-border dark:bg-hp-dark-card'>
      {/* Cover + info wrapper — relative so the wishlist button can be positioned over the cover */}
      <div className='relative flex-1'>
        <Link href={`/bookstore/book/${slug}`} className='block'>
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
            {isOutOfStock && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/60'>
                <span className='bg-untele px-2 py-1 text-xs font-black uppercase tracking-widest text-white'>
                  Out of Stock
                </span>
              </div>
            )}
          </div>
          <div className='p-3 pb-1'>
            <p className='mb-0.5 text-[10px] font-bold uppercase tracking-widest text-hp-muted dark:text-hp-muted'>
              {book.author?.name ?? 'Unknown Author'}
            </p>
            <h3 className='text-sm font-black leading-tight text-slate-900 group-hover:text-untele dark:text-hp-cream'>
              {book.title}
            </h3>
            {price != null && (
              <div className='mt-1'>
                {compareAtPrice != null && (
                  <p className='text-[10px] text-hp-muted line-through'>${compareAtPrice.toFixed(2)}</p>
                )}
                <p className='text-xs font-bold text-untele'>${price.toFixed(2)}</p>
              </div>
            )}
          </div>
        </Link>

        {/* Wishlist button: sibling of Link (not inside it) so clicks don't trigger navigation */}
        <div className='absolute right-1.5 top-1.5 z-10'>
          <WishlistButton
            slug={slug}
            title={book.title}
            coverImageUrl={cover ?? undefined}
            authorName={book.author?.name}
            price={book.formats?.[0]?.price}
          />
        </div>
      </div>

      {/* Action buttons — outside the Link to avoid nested interactive elements */}
      {!isOutOfStock && firstFormat && (
        <div className='px-3 pb-3'>
          <BookCardActions book={book} format={firstFormat} />
        </div>
      )}
    </div>
  );
}

function FeaturedHero({ book }: { book: SanityBook }) {
  const slug = book.slug.current;
  const firstFormat = book.formats?.[0];
  const price = firstFormat?.price;
  const compareAtPrice = firstFormat?.compareAtPrice;
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
          <div className='mb-4'>
            {compareAtPrice != null && (
              <p className='text-sm text-hp-muted line-through'>From ${compareAtPrice.toFixed(2)}</p>
            )}
            <p className='text-lg font-black text-untele'>From ${price.toFixed(2)}</p>
          </div>
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

      {/* Newsletter signup */}
      <section className='mt-12'>
        <BookstoreNewsletter source='bookstore-home' />
      </section>
    </main>
  );
}
