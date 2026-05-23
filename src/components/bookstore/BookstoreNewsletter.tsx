'use client';
// src/components/bookstore/BookstoreNewsletter.tsx
// Email capture for the Hurriya Publications mailing list.
// Separate from the main UnTelevised news newsletter.

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useConsentAwareTracking } from '@/components/analytics/ConsentAwareAnalytics';

interface Props {
  source?: string;
}

type State = 'idle' | 'loading' | 'success' | 'error';

export default function BookstoreNewsletter({ source = 'bookstore-home' }: Props) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { trackEvent } = useConsentAwareTracking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/bookstore/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = (await res.json()) as { ok?: boolean; alreadySubscribed?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        const msg = data.error ?? 'Something went wrong — please try again.';
        Sentry.captureMessage(msg, { level: 'error', extra: { source } });
        setErrorMsg(msg);
        setState('error');
        return;
      }
      trackEvent('newsletter_signup', { source, already_subscribed: data.alreadySubscribed });
      setState('success');
    } catch (err) {
      Sentry.captureException(err, { extra: { source } });
      setErrorMsg('Network error — please try again.');
      setState('error');
    }
  };

  return (
    <div className='border border-[#009736] bg-white p-6 dark:bg-hp-dark-card'>
      <p className='mb-1 text-[10px] font-black uppercase tracking-widest text-[#009736]'>
        Hurriya Publications
      </p>
      <h2 className='mb-1 text-lg font-black uppercase tracking-tight text-slate-900 dark:text-hp-cream'>
        New Books, Straight to You
      </h2>
      <p className='mb-4 text-xs text-slate-500 dark:text-hp-muted'>
        Get notified when new books are added. No spam. Unsubscribe any time.
      </p>

      {state === 'success' ? (
        <p className='text-sm font-black uppercase tracking-widest text-[#009736]'>
          You&apos;re on the list.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className='flex flex-col gap-3 sm:flex-row'>
          <input
            type='email'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='your@email.com'
            disabled={state === 'loading'}
            className='flex-1 border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#009736] focus:outline-none disabled:opacity-50 dark:border-hp-dark-border dark:bg-hp-dark-card dark:text-hp-cream'
          />
          <button
            type='submit'
            disabled={state === 'loading'}
            className='bg-[#009736] px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
          >
            {state === 'loading' ? 'Subscribing...' : 'Notify Me'}
          </button>
        </form>
      )}

      {state === 'error' && (
        <p className='mt-2 text-[11px] text-red-500'>{errorMsg}</p>
      )}
    </div>
  );
}
