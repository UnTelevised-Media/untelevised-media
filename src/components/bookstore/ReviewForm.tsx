'use client';
// src/components/bookstore/ReviewForm.tsx
// Client component — allows readers to submit a review for admin moderation.

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useConsentAwareTracking } from '@/components/analytics/ConsentAwareAnalytics';

interface Props {
  bookSlug: string;
}

type State = 'idle' | 'submitting' | 'success' | 'error';

export default function ReviewForm({ bookSlug }: Props) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [body, setBody] = useState('');
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { trackEvent } = useConsentAwareTracking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rating === 0 || body.trim().length < 20) {
      setErrorMsg('Please fill in your name, select a rating, and write at least 20 characters.');
      setState('error');
      return;
    }

    setState('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/bookstore/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookSlug,
          reviewerName: name.trim(),
          reviewerLocation: location.trim() || undefined,
          rating,
          body: body.trim(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        const msg = data.error ?? 'Something went wrong — please try again.';
        Sentry.captureMessage(msg, { level: 'error', extra: { bookSlug, rating } });
        setErrorMsg(msg);
        setState('error');
        return;
      }
      trackEvent('review_submitted', { book_slug: bookSlug, rating });
      setState('success');
    } catch (err) {
      Sentry.captureException(err, { extra: { bookSlug } });
      setErrorMsg('Network error — please try again.');
      setState('error');
    }
  };

  return (
    <div className='mb-6 border border-hp-sand-border bg-white p-4 dark:border-hp-dark-border dark:bg-hp-dark-card'>
      <div className='mb-4 flex items-center gap-3'>
        <div className='bg-untele px-2 py-0.5'>
          <span className='text-[10px] font-black uppercase tracking-widest text-white'>
            Write a Review
          </span>
        </div>
      </div>

      {state === 'success' ? (
        <div className='rounded border border-green-500/30 bg-green-500/10 px-4 py-3'>
          <p className='text-sm font-bold text-green-600 dark:text-green-400'>
            Your review has been submitted and will appear after approval.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          {/* Star picker */}
          <div>
            <label className='mb-1 block text-[10px] font-black uppercase tracking-widest text-hp-muted'>
              Rating <span className='text-untele'>*</span>
            </label>
            <div className='flex gap-1' role='group' aria-label='Star rating'>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type='button'
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  aria-label={`${n} star${n !== 1 ? 's' : ''}`}
                  className={`text-2xl transition-colors ${
                    n <= (hovered || rating) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor='review-name'
              className='mb-1 block text-[10px] font-black uppercase tracking-widest text-hp-muted'
            >
              Name <span className='text-untele'>*</span>
            </label>
            <input
              id='review-name'
              type='text'
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Your name'
              disabled={state === 'submitting'}
              className='w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-untele focus:outline-none disabled:opacity-50 dark:border-hp-dark-border dark:bg-hp-dark-card dark:text-hp-cream'
            />
          </div>

          {/* Location (optional) */}
          <div>
            <label
              htmlFor='review-location'
              className='mb-1 block text-[10px] font-black uppercase tracking-widest text-hp-muted'
            >
              Location <span className='text-hp-muted font-normal normal-case'>(optional)</span>
            </label>
            <input
              id='review-location'
              type='text'
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder='e.g. London, UK'
              disabled={state === 'submitting'}
              className='w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-untele focus:outline-none disabled:opacity-50 dark:border-hp-dark-border dark:bg-hp-dark-card dark:text-hp-cream'
            />
          </div>

          {/* Review body */}
          <div>
            <label
              htmlFor='review-body'
              className='mb-1 block text-[10px] font-black uppercase tracking-widest text-hp-muted'
            >
              Review <span className='text-untele'>*</span>
            </label>
            <textarea
              id='review-body'
              required
              minLength={20}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='Share your thoughts on this book (min. 20 characters)…'
              rows={5}
              disabled={state === 'submitting'}
              className='w-full resize-y border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-untele focus:outline-none disabled:opacity-50 dark:border-hp-dark-border dark:bg-hp-dark-card dark:text-hp-cream'
            />
            <p className='mt-0.5 text-[10px] text-hp-muted'>{body.length} / 20 chars min</p>
          </div>

          {state === 'error' && (
            <p className='text-[11px] text-red-500'>{errorMsg}</p>
          )}

          {(() => {
            const canSubmit = state !== 'submitting' && name.trim().length > 0 && rating > 0 && body.trim().length >= 20;
            return (
              <button
                type='submit'
                disabled={!canSubmit}
                className={`self-start px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-colors ${
                  canSubmit
                    ? 'cursor-pointer bg-untele hover:opacity-90'
                    : 'cursor-not-allowed bg-slate-300 dark:bg-slate-600'
                }`}
              >
                {state === 'submitting' ? 'Submitting…' : 'Submit Review'}
              </button>
            );
          })()}
        </form>
      )}
    </div>
  );
}
