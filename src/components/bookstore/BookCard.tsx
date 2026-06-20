import Link from 'next/link';
import Image from 'next/image';
import type { SanityBook } from '@/models/types/bookstore';
import urlForImage from '@/util/url/urlForImage';
import WishlistButton from './WishlistButton';
import BookCardActions from './BookCardActions';

interface BookCardProps {
  book: SanityBook;
}

export default function BookCard({ book }: BookCardProps) {
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
            {price !== null && (
              <div className='mt-1'>
                {compareAtPrice !== null && compareAtPrice !== undefined && (
                  <p className='text-[10px] text-hp-muted line-through'>
                    ${compareAtPrice.toFixed(2)}
                  </p>
                )}
                <p className='text-xs font-bold text-untele'>${price.toFixed(2)}</p>
              </div>
            )}
          </div>
        </Link>

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

      {!isOutOfStock && firstFormat && (
        <div className='px-3 pb-3'>
          <BookCardActions book={book} format={firstFormat} />
        </div>
      )}
    </div>
  );
}
