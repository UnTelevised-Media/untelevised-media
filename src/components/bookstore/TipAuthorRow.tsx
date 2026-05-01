'use client';

import { useState } from 'react';
import { useCart } from '@/lib/bookstore/cart';
import type { CheckoutPayload } from '@/lib/bookstore/types';

interface Author {
  _id: string;
  name: string;
  slug?: { current: string };
  tipStripeProductId: string;
  tipAmount: number;
}

interface Props {
  author: Author;
  bookId: string;
}

export default function TipAuthorRow({ author, bookId }: Props) {
  const [included, setIncluded] = useState(true);
  const [amount, setAmount] = useState(author.tipAmount);
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addItem = useCart((s) => s.addItem);

  const disabled = !included || amount <= 0;

  const handleAddToCart = () => {
    if (disabled) return;
    addItem({
      sanityBookId: bookId,
      slug: author.slug?.current ?? author._id,
      title: `Tip for ${author.name}`,
      formatType: 'tip',
      formatKey: `tip-${author._id}`,
      price: amount,
      stripePriceId: author.tipStripeProductId,
      tipIncluded: true,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    if (disabled) return;
    setBuying(true);
    setError(null);

    const payload: CheckoutPayload = {
      items: [
        {
          stripePriceId: author.tipStripeProductId,
          quantity: 1,
          sanityBookId: bookId,
          formatType: 'tip',
          formatKey: `tip-${author._id}`,
          title: `Tip for ${author.name}`,
          isDigital: false,
          unitAmountCents: Math.round(amount * 100),
        },
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
      setError('Network error — please try again');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className='mt-3 flex flex-col gap-2 border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <label className='flex cursor-pointer items-center gap-2'>
            <input
              type='checkbox'
              checked={included}
              onChange={(e) => setIncluded(e.target.checked)}
              className='h-3.5 w-3.5 accent-amber-500'
            />
            <span className='text-sm font-black uppercase tracking-wide text-amber-800 dark:text-amber-200'>
              ♥ Tip the Author
            </span>
          </label>
          <p className='mt-0.5 text-[10px] text-amber-700 dark:text-amber-400'>
            Goes directly to {author.name}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex items-center gap-1'>
            <span className='text-sm font-bold text-amber-700 dark:text-amber-300'>$</span>
            <input
              type='number'
              min={0}
              step={0.5}
              value={amount}
              onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              disabled={!included}
              className='w-20 border border-amber-300 bg-white px-2 py-1 text-sm font-bold text-amber-800 disabled:opacity-40 dark:border-amber-700 dark:bg-transparent dark:text-amber-200'
            />
          </div>

          <div className='flex flex-wrap gap-2'>
            <button
              onClick={handleAddToCart}
              disabled={disabled}
              className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-40 ${
                added
                  ? 'bg-green-600 text-white'
                  : 'border border-amber-400 bg-white text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:bg-transparent dark:text-amber-300 dark:hover:bg-amber-900/40'
              }`}
            >
              {added ? 'Added ✓' : '+ Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={disabled || buying}
              className='bg-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-amber-600 disabled:opacity-40 dark:bg-amber-700 dark:hover:bg-amber-600'
            >
              {buying ? 'Redirecting...' : 'Tip Now'}
            </button>
          </div>
        </div>
      </div>
      {error && <p className='text-[10px] text-red-600 dark:text-red-400'>{error}</p>}
    </div>
  );
}
