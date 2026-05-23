// src/components/bookstore/BookBuySection.tsx
// Server component — renders the Buy header and out-of-stock banner; delegates
// the interactive format selector to BookBuyFormats (client boundary).

import type { SanityBook } from '@/lib/bookstore/types';
import BookBuyFormats from './BookBuyFormats';

interface Props {
  book: SanityBook;
  isOutOfStock: boolean;
}

export default function BookBuySection({ book, isOutOfStock }: Props) {
  return (
    <div className='mb-6'>
      <div className='mb-3 flex items-center gap-3'>
        <div className='bg-untele px-2 py-0.5'>
          <span className='text-[10px] font-black uppercase tracking-widest text-white'>Buy</span>
        </div>
      </div>

      {isOutOfStock ? (
        <div className='border border-hp-sand-border bg-hp-sand px-4 py-3 dark:border-hp-dark-border dark:bg-hp-dark-card'>
          <p className='text-xs font-bold uppercase tracking-widest text-slate-500'>
            Currently Out of Stock
          </p>
        </div>
      ) : (
        <BookBuyFormats book={book} />
      )}
    </div>
  );
}
