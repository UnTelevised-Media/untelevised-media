'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useConsentAwareTracking } from '@/components/analytics/ConsentAwareAnalytics';
import type { SanityBook, SanityBookFormat, CheckoutPayload, GiftOptions } from '@/lib/bookstore/types';
import { getStripeIdForFormat } from '@/lib/bookstore/stripeUtils';

interface Props {
  book: SanityBook;
  format: SanityBookFormat;
  label?: string;
  className?: string;
  giftOptions?: GiftOptions | null;
  customPrice?: number; // required when format.nameYourPrice is true
  disabled?: boolean;
}

export default function BuyNowButton({
  book,
  format,
  label = 'Buy Now',
  className,
  giftOptions,
  customPrice,
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackEvent } = useConsentAwareTracking();

  const handleBuyNow = async () => {
    const isNyop = !!format.nameYourPrice;
    const stripeId = getStripeIdForFormat(format);
    if (!stripeId) {
      setError('Not yet available for direct purchase');
      return;
    }
    if (isNyop && (!customPrice || customPrice < 0.5)) {
      setError('Please enter a valid amount');
      return;
    }
    setLoading(true);
    setError(null);

    const payload: CheckoutPayload = {
      items: [
        {
          stripePriceId: stripeId,
          quantity: 1,
          sanityBookId: book._id,
          formatType: format.formatType,
          formatKey: format._key,
          title: book.title,
          isDigital: format.formatType === 'digital',
          ...(isNyop && customPrice ? { unitAmountCents: Math.round(customPrice * 100), isNyop: true } : {}),
        },
      ],
      ...(giftOptions ? { giftOptions } : {}),
    };

    trackEvent('begin_checkout', {
      currency: 'USD',
      value: customPrice ?? format.price,
      items: [{
        item_id: book._id,
        item_name: book.title,
        item_variant: format.formatType,
        item_category: 'Book',
        price: customPrice ?? format.price,
        quantity: 1,
      }],
    });

    try {
      const res = await fetch('/api/bookstore/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        const msg = data.error ?? 'Checkout failed';
        Sentry.captureMessage(msg, { level: 'error', extra: { bookId: book._id, formatType: format.formatType } });
        setError(msg);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      Sentry.captureException(err, { extra: { bookId: book._id, formatType: format.formatType } });
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleBuyNow}
        disabled={loading || disabled}
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
