'use client';
// src/components/newsletter/SubscribedBanner.tsx
// Shows a success/unsubscribe confirmation banner when ?subscribed=1 or ?unsubscribed=1
// is present in the URL. Reads URL params client-side to avoid hydration issues.

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

interface Props {
  brandColor?: string;
}

export function SubscribedBanner({ brandColor = '#D70606' }: Props) {
  const searchParams = useSearchParams();
  const [banner, setBanner] = useState<'subscribed' | 'unsubscribed' | 'error' | null>(null);

  useEffect(() => {
    const subscribed = searchParams.get('subscribed');
    const unsubscribed = searchParams.get('unsubscribed');
    if (subscribed === '1') setBanner('subscribed');
    else if (subscribed === 'error') setBanner('error');
    else if (unsubscribed === '1') setBanner('unsubscribed');
  }, [searchParams]);

  if (!banner) return null;

  const messages = {
    subscribed: {
      heading: "You're confirmed!",
      body: 'Welcome to the list. You\'ll hear from us when there\'s something worth reading.',
    },
    unsubscribed: {
      heading: "You've been unsubscribed.",
      body: 'You won\'t receive any further emails from this list.',
    },
    error: {
      heading: 'Confirmation link invalid.',
      body: 'This link may have already been used or has expired. Try signing up again.',
    },
  };

  const msg = messages[banner];
  const isError = banner === 'error';

  return (
    <div
      className='relative border px-4 py-3 text-sm'
      style={{ borderColor: isError ? '#f59e0b' : brandColor, backgroundColor: isError ? '#fffbeb' : undefined }}
      role='alert'
    >
      <p className='font-black uppercase tracking-widest text-xs mb-1' style={{ color: isError ? '#b45309' : brandColor }}>
        {msg.heading}
      </p>
      <p className='text-slate-700 dark:text-slate-300'>{msg.body}</p>
      <button
        onClick={() => setBanner(null)}
        className='absolute right-3 top-3 text-slate-400 hover:text-slate-600'
        aria-label='Dismiss'
      >
        <X className='h-4 w-4' />
      </button>
    </div>
  );
}

export default SubscribedBanner;
