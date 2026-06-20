import Link from 'next/link';
import Image from 'next/image';
import type { SanityBook } from '@/models/types/bookstore';
import urlForImage from '@/util/url/urlForImage';

interface FeaturedHeroProps {
  book: SanityBook;
}

export default function FeaturedHero({ book }: FeaturedHeroProps) {
  const slug = book.slug.current;
  const firstFormat = book.formats?.[0];
  const price = firstFormat?.price;
  const compareAtPrice = firstFormat?.compareAtPrice;
  const cover = book.coverImage?.asset
    ? urlForImage(book.coverImage).width(800).height(1120).url()
    : (book.coverImageUrl ?? null);

  return (
    <div className='relative flex flex-col items-start gap-6 border border-untele bg-white p-6 dark:bg-hp-dark-card sm:flex-row sm:p-8 lg:p-12'>
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
        {price !== null && (
          <div className='mb-4'>
            {compareAtPrice !== null && compareAtPrice !== undefined && (
              <p className='text-sm text-hp-muted line-through'>
                From ${compareAtPrice.toFixed(2)}
              </p>
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
