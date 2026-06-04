'use client';

import { useState } from 'react';
import { useCart, buildCartItem } from '@/lib/bookstore/cart';
import type { SanityBook, SanityBookFormat, CheckoutPayload } from '@/lib/bookstore/types';

interface Props {
  book: SanityBook;
  format: SanityBookFormat;
}

export default function BookCardActions({ book, format }: Props) {
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tip state
  const tipProductId = book.author?.tipStripeProductId;
  const defaultTip = book.author?.tipAmount ?? 5;
  const [tipAmount, setTipAmount] = useState(defaultTip);

  const addItem = useCart((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(
      buildCartItem({
        sanityBookId: book._id,
        slug: book.slug.current,
        title: book.title,
        coverImageRef: book.coverImage?.asset?._ref,
        formatKey: format._key,
        formatType: format.formatType,
        price: format.price,
        stripePriceId: format.stripePriceId ?? '',
      })
    );
    if (tipProductId && tipAmount > 0) {
      addItem({
        sanityBookId: book._id,
        slug: book.slug.current,
        title: `Tip for ${book.author?.name ?? 'Author'}`,
        formatType: 'tip',
        formatKey: `tip-${book.author?._id ?? book._id}`,
        price: tipAmount,
        stripePriceId: tipProductId,
        tipIncluded: true,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!format.stripePriceId) return;

    setBuying(true);
    setError(null);

    const payload: CheckoutPayload = {
      items: [
        {
          stripePriceId: format.stripePriceId,
          quantity: 1,
          sanityBookId: book._id,
          formatType: format.formatType,
          formatKey: format._key,
          title: book.title,
          isDigital: format.formatType === 'digital',
        },
        ...(tipProductId && tipAmount > 0
          ? [
              {
                stripePriceId: tipProductId,
                quantity: 1,
                sanityBookId: book._id,
                formatType: 'tip' as const,
                formatKey: `tip-${book.author?._id ?? book._id}`,
                title: `Tip for ${book.author?.name ?? 'Author'}`,
                isDigital: false,
                unitAmountCents: Math.round(tipAmount * 100),
              },
            ]
          : []),
      ],
    };

    try {
      const res = await fetch('/api/bookstore/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Checkout failed');
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Network error');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className='mt-2 flex flex-col gap-1.5'>
      <div className='flex gap-1.5'>
        <button
          onClick={handleAddToCart}
          className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
            added
              ? 'bg-green-600 text-white'
              : 'border border-hp-sand-border bg-white text-slate-700 hover:border-untele hover:text-untele dark:border-hp-dark-border dark:bg-hp-dark-card dark:text-hp-cream dark:hover:border-untele dark:hover:text-untele'
          }`}
        >
          {added ? 'Added ✓' : '+ Cart'}
        </button>
        {format.stripePriceId && (
          <button
            onClick={handleBuyNow}
            disabled={buying}
            className='flex-1 bg-untele py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
          >
            {buying ? '...' : 'Buy Now'}
          </button>
        )}
      </div>

      {tipProductId && (
        <div className='border border-amber-200 bg-amber-50 px-2 py-1.5 dark:border-amber-800/40 dark:bg-amber-950/20'>
          <div className='flex items-center gap-1.5'>
            <span className='text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300'>
              ♥ Tip
            </span>
            <span className='ml-auto flex items-center gap-0.5'>
              <span className='text-[9px] text-amber-600 dark:text-amber-400'>$</span>
              <input
                type='number'
                min={0}
                step={0.5}
                value={tipAmount}
                onChange={(e) => setTipAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className='w-12 border border-amber-300 bg-white px-1 py-0.5 text-[9px] font-bold text-amber-800 dark:border-amber-700 dark:bg-transparent dark:text-amber-200'
              />
            </span>
          </div>
        </div>
      )}

      {error && <p className='text-[9px] text-red-500'>{error}</p>}
    </div>
  );
}
