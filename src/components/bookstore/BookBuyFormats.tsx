'use client';
// src/components/bookstore/BookBuyFormats.tsx
// Client component — owns gift toggle state and NYOP amounts, renders per-format buy actions.

import { useState, useEffect, useRef } from 'react';
import type { SanityBook, SanityBookFormat, GiftOptions } from '@/lib/bookstore/types';
import { getStripeIdForFormat } from '@/lib/bookstore/stripeUtils';
import { useConsentAwareTracking } from '@/components/analytics/ConsentAwareAnalytics';
import AddToCartButton from './AddToCartButton';
import BuyNowButton from './BuyNowButton';
import GiftToggle from './GiftToggle';

function formatLabel(format: SanityBookFormat): string {
  if (format.formatType === 'physical') return 'Physical Book';
  if (format.formatType === 'digital') return 'Digital Edition';
  if (format.formatType === 'bundle') return 'Physical + Digital Bundle';
  return format.formatType;
}

interface Props {
  book: SanityBook;
}

export default function BookBuyFormats({ book }: Props) {
  const [giftOptions, setGiftOptions] = useState<GiftOptions | null>(null);
  const [nyopAmounts, setNyopAmounts] = useState<Record<string, string>>({});
  const { trackEvent } = useConsentAwareTracking();
  const viewFired = useRef(false);

  useEffect(() => {
    const initial: Record<string, string> = {};
    (book.formats ?? []).forEach((f) => {
      if (f.nameYourPrice) {
        const defaultAmt = f.suggestedPrice ?? f.minimumPrice ?? '';
        initial[f._key] = defaultAmt !== '' ? String(defaultAmt) : '';
      }
    });
    setNyopAmounts(initial);
  }, [book.formats]);

  useEffect(() => {
    if (viewFired.current || !book.formats?.length) return;
    viewFired.current = true;
    const lowestPrice = Math.min(...book.formats.map((f) => f.price ?? 0));
    trackEvent('view_item', {
      currency: 'USD',
      value: lowestPrice,
      items: book.formats.map((f) => ({
        item_id: book._id,
        item_name: book.title,
        item_variant: f.formatType,
        item_category: 'Book',
        price: f.price,
      })),
    });
  }, [trackEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
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

          const isNyop = !!format.nameYourPrice;
          const nyopRaw = nyopAmounts[format._key] ?? '';
          const nyopAmount = nyopRaw !== '' ? parseFloat(nyopRaw) : NaN;
          const minimum = format.minimumPrice ?? 0;
          const nyopValid =
            !isNyop ||
            (!isNaN(nyopAmount) && nyopAmount >= minimum && nyopAmount >= 0.5);
          const nyopError =
            isNyop && nyopRaw !== '' && !isNaN(nyopAmount) && nyopAmount < minimum
              ? minimum === 0
                ? 'Minimum charge is $0.50'
                : `Minimum is $${minimum.toFixed(2)}`
              : isNyop && nyopRaw !== '' && !isNaN(nyopAmount) && nyopAmount < 0.5
                ? 'Minimum charge is $0.50'
                : null;

          return (
            <div
              key={format._key}
              className='flex flex-col gap-2 border border-hp-sand-border bg-white p-4 dark:border-hp-dark-border dark:bg-hp-dark-card'
            >
              <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
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
                  {!isNyop && (
                    <div className='text-right'>
                      {format.compareAtPrice != null && (
                        <p className='text-xs text-slate-400 line-through'>
                          ${format.compareAtPrice.toFixed(2)}
                        </p>
                      )}
                      <p className='text-lg font-black text-untele'>${format.price.toFixed(2)}</p>
                    </div>
                  )}
                  {isNyop && (
                    <div className='text-right'>
                      <p className='text-[10px] font-bold uppercase tracking-widest text-untele'>
                        Pay What You Want
                      </p>
                      {minimum > 0 && (
                        <p className='text-[10px] text-slate-400'>
                          from ${minimum.toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}

                  {!outOfStock && !isNyop && (
                    <div className='flex flex-wrap gap-2'>
                      {!giftOptions && <AddToCartButton book={book} format={format} />}
                      {getStripeIdForFormat(format) && (
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

              {!outOfStock && isNyop && (
                <div className='border-t border-hp-sand-border pt-3 dark:border-hp-dark-border'>
                  <div className='flex flex-wrap items-center gap-3'>
                    <div>
                      <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500'>
                        Your Price (USD)
                        {minimum > 0 && (
                          <span className='ml-1 font-normal normal-case tracking-normal text-slate-400'>
                            — min ${minimum.toFixed(2)}
                          </span>
                        )}
                      </p>
                      <div className='flex items-center gap-1'>
                        <span className='text-sm font-bold text-slate-400'>$</span>
                        <input
                          type='number'
                          step='0.01'
                          min={Math.max(minimum, 0.5)}
                          value={nyopRaw}
                          onChange={(e) =>
                            setNyopAmounts((prev) => ({ ...prev, [format._key]: e.target.value }))
                          }
                          placeholder={
                            format.suggestedPrice != null
                              ? format.suggestedPrice.toFixed(2)
                              : minimum > 0
                                ? minimum.toFixed(2)
                                : '0.00'
                          }
                          className='w-20 border border-slate-200 bg-white px-2 py-1 text-sm font-bold text-slate-800 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-transparent dark:text-slate-200'
                        />
                      </div>
                      {nyopError && (
                        <p className='mt-0.5 text-[10px] font-bold text-red-500'>{nyopError}</p>
                      )}
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {!giftOptions && (
                        <AddToCartButton
                          book={book}
                          format={format}
                          customPrice={!isNaN(nyopAmount) ? nyopAmount : undefined}
                          disabled={!nyopValid || nyopRaw === ''}
                        />
                      )}
                      {getStripeIdForFormat(format) && (
                        <BuyNowButton
                          book={book}
                          format={format}
                          giftOptions={giftOptions ?? undefined}
                          customPrice={!isNaN(nyopAmount) ? nyopAmount : undefined}
                          disabled={!nyopValid || nyopRaw === ''}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
