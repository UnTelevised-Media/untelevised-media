'use client';
// src/components/bookstore/BookBuySection.tsx
// Client component that owns gift toggle state and passes it to BuyNowButton.
// Extracted so GiftToggle and BuyNowButton share a single client boundary.

import { useState } from 'react';
import type { SanityBook, SanityBookFormat, GiftOptions } from '@/lib/bookstore/types';
import AddToCartButton from './AddToCartButton';
import BuyNowButton from './BuyNowButton';
import GiftToggle from './GiftToggle';

interface Props {
  book: SanityBook;
  isOutOfStock: boolean;
}

function formatLabel(format: SanityBookFormat): string {
  if (format.formatType === 'physical') return 'Physical Book';
  if (format.formatType === 'digital') return 'Digital Edition';
  if (format.formatType === 'bundle') return 'Physical + Digital Bundle';
  return format.formatType;
}

export default function BookBuySection({ book, isOutOfStock }: Props) {
  const [giftOptions, setGiftOptions] = useState<GiftOptions | null>(null);

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
        <>
          {/* Gift toggle — shown above format list, hidden when cart is the only option */}
          {book.formats?.some((f) => f.stripePriceId) && (
            <GiftToggle onChange={setGiftOptions} />
          )}

          <div className='flex flex-col gap-3'>
            {book.formats?.map((format) => {
              const outOfStock =
                format.inventory?.trackInventory &&
                format.inventory.quantity === 0 &&
                !format.inventory.allowBackorder;
              const lowStock =
                format.inventory?.trackInventory &&
                format.inventory.quantity > 0 &&
                format.inventory.quantity <= (format.inventory.lowStockThreshold ?? 5);

              return (
                <div
                  key={format._key}
                  className='flex flex-col gap-2 border border-hp-sand-border bg-white p-4 dark:border-hp-dark-border dark:bg-hp-dark-card sm:flex-row sm:items-center sm:justify-between'
                >
                  <div>
                    <p className='text-sm font-black uppercase tracking-wide text-slate-900 dark:text-hp-cream'>
                      {formatLabel(format)}
                    </p>
                    {format.formatType === 'digital' && format.digitalAsset && (
                      <p className='text-[10px] text-slate-400'>
                        {format.digitalAsset.fileFormat}
                        {format.digitalAsset.fileSize ? ` · ${format.digitalAsset.fileSize}` : ''}
                      </p>
                    )}
                    {format.formatType !== 'digital' && format.dimensions && (
                      <p className='text-[10px] text-slate-400'>{format.dimensions}</p>
                    )}
                    {lowStock && (
                      <p className='text-[10px] font-bold text-amber-500'>
                        Only {format.inventory?.quantity} left
                      </p>
                    )}
                    {outOfStock && (
                      <p className='text-[10px] font-bold text-slate-400'>Out of stock</p>
                    )}
                  </div>

                  <div className='flex flex-wrap items-center gap-3'>
                    <div className='text-right'>
                      {format.compareAtPrice != null && (
                        <p className='text-xs text-slate-400 line-through'>
                          ${format.compareAtPrice.toFixed(2)}
                        </p>
                      )}
                      <p className='text-lg font-black text-untele'>${format.price.toFixed(2)}</p>
                    </div>

                    {!outOfStock && (
                      <div className='flex flex-wrap gap-2'>
                        {/* Add to Cart — hidden when gift mode is active */}
                        {!giftOptions && <AddToCartButton book={book} format={format} />}
                        {format.stripePriceId && (
                          <BuyNowButton
                            book={book}
                            format={format}
                            giftOptions={giftOptions ?? undefined}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
