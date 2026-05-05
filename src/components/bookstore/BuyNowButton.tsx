'use client';

import { useState } from 'react';
import type { SanityBook, SanityBookFormat, CheckoutPayload, GiftOptions } from '@/lib/bookstore/types';

interface Props {
  book: SanityBook;
  format: SanityBookFormat;
  label?: string;
  className?: string;
  giftOptions?: GiftOptions | null;
}

export default function BuyNowButton({
  book,
  format,
  label = 'Buy Now',
  className,
  giftOptions,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuyNow = async () => {
    if (!format.stripePriceId) {
      setError('Not yet available for direct purchase');
      return;
    }
    setLoading(true);
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
      ],
      ...(giftOptions ? { giftOptions } : {}),
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
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleBuyNow}
        disabled={loading}
        className={
          className ??
          'border border-untele bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-untele hover:bg-untele hover:text-white disabled:opacity-50 dark:bg-transparent dark:text-untele dark:hover:bg-untele dark:hover:text-white'
        }
      >
        {loading ? 'Redirecting...' : label}
      </button>
      {error && <p className='mt-1 text-[10px] text-red-500'>{error}</p>}
    </div>
  );
}
