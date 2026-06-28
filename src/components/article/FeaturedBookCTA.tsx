import Image from 'next/image';
import Link from 'next/link';
import urlForImage from '@/util/url/urlForImage';

interface FeaturedBookCTAProps {
  book: {
    _id?: string;
    title?: string;
    slug?: { current?: string } | string;
    author?: { name?: string };
    price?: number;
    compareAtPrice?: number;
    coverImage?: { asset?: { _ref: string }; alt?: string };
    coverImageUrl?: string;
  };
}

export default function FeaturedBookCTA({ book }: FeaturedBookCTAProps) {
  if (!book?.title || !book?.slug) {
    return null;
  }

  const slugStr = typeof book.slug === 'string' ? book.slug : book.slug.current;
  if (!slugStr) {
    return null;
  }

  const cover = book.coverImage?.asset
    ? urlForImage(book.coverImage).width(300).height(450).url()
    : (book.coverImageUrl ?? null);

  return (
    <div className='flex flex-col border border-slate-300 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-slate-700 dark:from-slate-950 dark:to-black'>
      {/* Book Cover */}
      <div className='relative aspect-[3/4] w-full overflow-hidden border border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800'>
        {cover ? (
          <Image
            src={cover}
            alt={book.coverImage?.alt ?? book.title ?? 'Book cover'}
            fill
            className='object-cover'
            sizes='(max-width: 1024px) 100vw, 22vw'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-slate-300 dark:bg-slate-700'>
            <span className='text-center text-xs font-semibold text-slate-600 dark:text-slate-400'>
              {book.title}
            </span>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className='flex flex-1 flex-col'>
        <h3 className='mb-1 line-clamp-2 text-sm font-black uppercase leading-tight tracking-wide text-slate-900 dark:text-white'>
          {book.title}
        </h3>
        {book.author?.name && (
          <p className='mb-3 text-xs text-slate-600 dark:text-slate-400'>{book.author.name}</p>
        )}

        {/* Price */}
        {book.price && (
          <div className='mb-4 flex items-baseline gap-2'>
            <span className='text-sm font-black text-untele'>${book.price.toFixed(2)}</span>
            {book.compareAtPrice && book.compareAtPrice > book.price && (
              <span className='text-xs line-through text-slate-500'>
                ${book.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className='mt-auto flex flex-col gap-2'>
          <Link
            href={`/bookstore/book/${slugStr}`}
            className='flex items-center justify-center border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-900 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800'
          >
            View Book
          </Link>
          <Link
            href={`/bookstore/book/${slugStr}?action=buy`}
            className='flex items-center justify-center bg-untele px-3 py-2 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-red-700'
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
}
