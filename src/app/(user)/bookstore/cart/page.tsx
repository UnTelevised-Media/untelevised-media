'use client';
// src/app/(user)/bookstore/cart/page.tsx
// Full cart page — item list, quantity controls, subtotal, checkout button.

import { useState } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { useUser } from '@clerk/nextjs';
import { useCart } from '@/lib/bookstore/cart';
import { useConsentAwareTracking } from '@/components/analytics/ConsentAwareAnalytics';
import type { CheckoutPayload } from '@/lib/bookstore/types';
import PreCheckoutDialog from '@/components/bookstore/PreCheckoutDialog';

function CartQuantityControl({
  quantity,
  onDecrement,
  onIncrement,
  onRemove,
}: {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onRemove: () => void;
}) {
  return (
    <div className='flex items-center gap-2'>
      <button
        onClick={onDecrement}
        className='flex h-6 w-6 items-center justify-center border border-slate-300 text-xs hover:border-untele hover:text-untele dark:border-slate-600'
      >
        −
      </button>
      <span className='w-6 text-center text-sm font-bold'>{quantity}</span>
      <button
        onClick={onIncrement}
        className='flex h-6 w-6 items-center justify-center border border-slate-300 text-xs hover:border-untele hover:text-untele dark:border-slate-600'
      >
        +
      </button>
      <button
        onClick={onRemove}
        className='ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-untele'
      >
        Remove
      </button>
    </div>
  );
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, updatePrice, updateTipIncluded } = useCart();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { trackEvent } = useConsentAwareTracking();

  const total = items.reduce((sum, i) => {
    if (i.formatType === 'tip') return i.tipIncluded !== false ? sum + i.price : sum;
    return sum + i.price * i.quantity;
  }, 0);

  const handleCheckoutClick = () => {
    if (items.length === 0) return;
    if (!isLoaded) return;
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    void handleCheckout(user.primaryEmailAddress?.emailAddress);
  };

  const handleCheckout = async (customerEmail?: string) => {
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    trackEvent('begin_checkout', {
      currency: 'USD',
      value: total,
      items: items.map((i) => ({
        item_id: i.sanityBookId,
        item_name: i.title,
        item_variant: i.formatType,
        price: i.price,
        quantity: i.quantity,
      })),
    });

    const payload: CheckoutPayload = {
      items: items
        .filter((i) => i.formatType !== 'tip' || (i.tipIncluded !== false && i.price > 0))
        .map((item) => ({
          stripePriceId: item.stripePriceId,
          quantity: item.quantity,
          sanityBookId: item.sanityBookId,
          formatType: item.formatType,
          formatKey: item.formatKey,
          title: item.title,
          isDigital: item.formatType === 'digital',
          ...(item.formatType === 'tip' && { unitAmountCents: Math.round(item.price * 100) }),
          ...(item.nameYourPrice && {
            unitAmountCents: Math.round(item.price * 100),
            isNyop: true,
          }),
        })),
      ...(customerEmail && { customerEmail }),
    };

    if (payload.items.length === 0) {
      setError('No items to checkout');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/bookstore/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        const msg = data.error ?? 'Failed to start checkout';
        Sentry.captureMessage(msg, {
          level: 'error',
          extra: { itemCount: payload.items.length, total },
        });
        setError(msg);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      Sentry.captureException(err, { extra: { itemCount: payload.items.length } });
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='mx-auto max-w-4xl px-4 py-8 sm:px-6'>
      {/* Page header */}
      <div className='mb-6 flex items-center gap-3'>
        <div className='bg-untele px-3 py-1'>
          <span className='text-sm font-black uppercase tracking-widest text-white'>Cart</span>
        </div>
        <div className='h-px flex-1 bg-slate-200 dark:bg-slate-800' />
        <Link
          href='/bookstore'
          className='text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-untele'
        >
          ← Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className='border border-slate-200 bg-white px-4 py-16 text-center dark:border-slate-700 dark:bg-slate-900'>
          <p className='mb-4 text-xs font-bold uppercase tracking-widest text-slate-400'>
            Your cart is empty
          </p>
          <Link
            href='/bookstore'
            className='inline-block bg-untele px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:opacity-90'
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className='flex flex-col gap-4 lg:flex-row lg:gap-8'>
          {/* Item list */}
          <div className='flex-1'>
            <div className='divide-y divide-slate-100 border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900'>
              {items.map((item) => {
                if (item.formatType === 'tip') {
                  const checked = item.tipIncluded !== false;
                  return (
                    <div
                      key={`${item.sanityBookId}-${item.formatKey}`}
                      className='flex gap-4 border-l-2 border-amber-400 p-4 dark:border-amber-600'
                    >
                      <div className='flex-1'>
                        <label className='flex cursor-pointer items-center gap-2'>
                          <input
                            type='checkbox'
                            checked={checked}
                            onChange={(e) =>
                              updateTipIncluded(
                                item.sanityBookId,
                                item.formatKey,
                                e.target.checked
                              )
                            }
                            className='h-3.5 w-3.5 accent-amber-500'
                          />
                          <span className='text-sm font-black text-amber-700 dark:text-amber-300'>
                            {item.title}
                          </span>
                        </label>
                        <p className='mt-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-500'>
                          ♥ Author Tip
                        </p>
                        <button
                          onClick={() => removeItem(item.sanityBookId, item.formatKey)}
                          className='mt-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-untele'
                        >
                          Remove
                        </button>
                      </div>
                      <div className='flex flex-col items-end gap-1'>
                        <div className='flex items-center gap-1'>
                          <span className='text-sm font-bold text-amber-600 dark:text-amber-400'>
                            $
                          </span>
                          <input
                            type='number'
                            min={0}
                            step={0.5}
                            value={item.price}
                            onChange={(e) =>
                              updatePrice(
                                item.sanityBookId,
                                item.formatKey,
                                Math.max(0, parseFloat(e.target.value) || 0)
                              )
                            }
                            disabled={!checked}
                            className='w-20 border border-amber-300 bg-white px-2 py-1 text-sm font-bold text-amber-800 disabled:opacity-40 dark:border-amber-700 dark:bg-transparent dark:text-amber-200'
                          />
                        </div>
                        {!checked && (
                          <p className='text-[9px] text-slate-400 dark:text-slate-500'>
                            Not included
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={`${item.sanityBookId}-${item.formatKey}`} className='flex gap-4 p-4'>
                    <div className='flex-1'>
                      <p className='text-sm font-black text-slate-900 dark:text-white'>
                        {item.title}
                      </p>
                      <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                        {item.formatType === 'physical' && 'Physical'}
                        {item.formatType === 'digital' && 'Digital'}
                        {item.formatType === 'bundle' && 'Bundle'}
                      </p>
                      <div className='mt-2'>
                        <CartQuantityControl
                          quantity={item.quantity}
                          onDecrement={() =>
                            updateQuantity(item.sanityBookId, item.formatKey, item.quantity - 1)
                          }
                          onIncrement={() =>
                            updateQuantity(item.sanityBookId, item.formatKey, item.quantity + 1)
                          }
                          onRemove={() => removeItem(item.sanityBookId, item.formatKey)}
                        />
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-black text-untele'>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className='text-[10px] text-slate-400'>${item.price.toFixed(2)} each</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order summary */}
          <div className='w-full lg:w-72'>
            <div className='border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900'>
              <div className='mb-3 flex items-center gap-3'>
                <div className='bg-untele px-2 py-0.5'>
                  <span className='text-[10px] font-black uppercase tracking-widest text-white'>
                    Summary
                  </span>
                </div>
              </div>

              <div className='mb-4 flex justify-between border-b border-slate-100 pb-3 dark:border-slate-800'>
                <span className='text-sm text-slate-600 dark:text-slate-400'>Subtotal</span>
                <span className='text-sm font-black text-slate-900 dark:text-white'>
                  ${total.toFixed(2)}
                </span>
              </div>
              <p className='mb-4 text-[10px] text-slate-400'>
                Shipping and taxes calculated at checkout.
              </p>

              {error && (
                <p className='mb-3 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700'>
                  {error}
                </p>
              )}

              <button
                onClick={handleCheckoutClick}
                disabled={loading || !isLoaded}
                className='w-full bg-untele py-3 text-xs font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
              >
                {loading ? 'Redirecting...' : 'Checkout'}
              </button>
              {user && (
                <p className='mt-2 text-center text-[10px] text-hp-muted'>
                  Checking out as{' '}
                  <span className='font-bold text-slate-600 dark:text-hp-cream'>
                    {user.primaryEmailAddress?.emailAddress}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showAuthDialog && (
        <PreCheckoutDialog
          onClose={() => setShowAuthDialog(false)}
          onGuest={() => {
            setShowAuthDialog(false);
            void handleCheckout();
          }}
        />
      )}
    </main>
  );
}
