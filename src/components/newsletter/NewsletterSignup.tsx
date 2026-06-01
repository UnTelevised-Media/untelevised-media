'use client';
// src/components/newsletter/NewsletterSignup.tsx
// Reusable signup form for both the news and bookstore newsletter lists.
// Accepts `list` prop to determine which API endpoint and branding to use.

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  firstName: z.string().max(100).optional(),
  gdprConsent: z.boolean().refine((v) => v === true, {
    message: 'You must agree to receive emails',
  }),
});

type FormValues = z.infer<typeof schema>;

type NewsletterList = 'news' | 'bookstore';

const LIST_CONFIG: Record<
  NewsletterList,
  {
    endpoint: string;
    color: string;
    label: string;
    heading: string;
    subheading: string;
    consentText: string;
  }
> = {
  news: {
    endpoint: '/api/newsletter-subscribe',
    color: '#D70606',
    label: 'UnTelevised Media',
    heading: 'Get the news. Own it.',
    subheading:
      'Independent journalism, direct to your inbox. No algorithms. No corporate filter. Unsubscribe any time.',
    consentText:
      'I agree to receive news and updates from UnTelevised Media. You can unsubscribe at any time.',
  },
  bookstore: {
    endpoint: '/api/bookstore/newsletter',
    color: '#009736',
    label: 'Hurriya Publications',
    heading: 'New Books, Straight to You',
    subheading: 'Get notified when new books are added. No spam. Unsubscribe any time.',
    consentText:
      'I agree to receive updates from Hurriya Publications. You can unsubscribe at any time.',
  },
};

type NewsletterSource =
  | 'homepage'
  | 'article'
  | 'category'
  | 'footer'
  | 'support'
  | 'bookstore-home'
  | 'bookstore-about'
  | 'book-detail';

interface NewsletterSignupProps {
  list: NewsletterList;
  variant?: 'full' | 'compact';
  source?: NewsletterSource;
  className?: string;
  fieldsLayout?: 'row' | 'column';
}

export function NewsletterSignup({
  list,
  variant = 'full',
  source,
  className = '',
  fieldsLayout = 'row',
}: NewsletterSignupProps) {
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const cfg = LIST_CONFIG[list];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setSubmitState('loading');
    setErrorMessage('');
    try {
      const res = await fetch(cfg.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, source }),
      });
      const data = (await res.json()) as { success?: boolean; ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to subscribe');
      setSubmitState('success');
      reset();
    } catch (err) {
      setSubmitState('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    }
  }

  if (submitState === 'success') {
    return (
      <div
        className={`border p-4 text-sm ${className}`}
        style={{ borderColor: cfg.color }}
      >
        <p
          className='mb-1 text-xs font-black uppercase tracking-widest'
          style={{ color: cfg.color }}
        >
          Check your inbox
        </p>
        <p className='text-slate-700 dark:text-slate-300'>
          We sent you a confirmation email. Click the link to activate your subscription.
        </p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col gap-2 ${className}`}>
        <div className='flex gap-0'>
          <input
            {...register('email')}
            type='email'
            placeholder='your@email.com'
            className='flex-1 border border-neutral-300 bg-white px-3 py-2 text-sm outline-none dark:border-neutral-600 dark:bg-neutral-900 dark:text-white'
            style={{ borderColor: undefined, outlineColor: cfg.color }}
            onFocus={(e) => (e.target.style.borderColor = cfg.color)}
            onBlur={(e) => (e.target.style.borderColor = '')}
          />
          <button
            type='submit'
            disabled={submitState === 'loading'}
            className='px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-opacity disabled:opacity-60 hover:opacity-90'
            style={{ backgroundColor: cfg.color }}
          >
            {submitState === 'loading' ? (
              <Loader2 className='h-3 w-3 animate-spin' />
            ) : (
              'Subscribe'
            )}
          </button>
        </div>
        <label className='flex cursor-pointer items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400'>
          <input
            {...register('gdprConsent')}
            type='checkbox'
            className='mt-0.5'
            style={{ accentColor: cfg.color }}
          />
          {cfg.consentText}
        </label>
        {errors.email && (
          <p className='text-xs' style={{ color: cfg.color }}>
            {errors.email.message}
          </p>
        )}
        {errors.gdprConsent && (
          <p className='text-xs' style={{ color: cfg.color }}>
            {errors.gdprConsent.message}
          </p>
        )}
        {submitState === 'error' && (
          <p className='text-xs' style={{ color: cfg.color }}>
            {errorMessage}
          </p>
        )}
      </form>
    );
  }

  return (
    <section className={`my-10 border border-neutral-200 p-6 dark:border-neutral-700 ${className}`}>
      <div
        className='mb-4 inline-block px-3 py-2'
        style={{ backgroundColor: cfg.color }}
      >
        <p className='text-xs font-black uppercase tracking-widest text-white'>{cfg.label}</p>
      </div>
      <h2 className='mb-2 text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white'>
        {cfg.heading}
      </h2>
      <p className='mb-6 text-sm text-neutral-600 dark:text-neutral-400'>{cfg.subheading}</p>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div className={`flex flex-col gap-3${fieldsLayout === 'row' ? ' sm:flex-row' : ''}`}>
          <input
            {...register('firstName')}
            type='text'
            placeholder='First name (optional)'
            className='flex-1 border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none dark:border-neutral-600 dark:bg-neutral-900 dark:text-white'
          />
          <input
            {...register('email')}
            type='email'
            placeholder='your@email.com'
            className='flex-1 border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none dark:border-neutral-600 dark:bg-neutral-900 dark:text-white'
          />
        </div>
        {errors.email && (
          <p className='text-xs' style={{ color: cfg.color }}>
            {errors.email.message}
          </p>
        )}
        <label className='flex cursor-pointer items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400'>
          <input
            {...register('gdprConsent')}
            type='checkbox'
            className='mt-0.5'
            style={{ accentColor: cfg.color }}
          />
          {cfg.consentText}
        </label>
        {errors.gdprConsent && (
          <p className='text-xs' style={{ color: cfg.color }}>
            {errors.gdprConsent.message}
          </p>
        )}
        {submitState === 'error' && (
          <p className='text-xs' style={{ color: cfg.color }}>
            {errorMessage}
          </p>
        )}
        <button
          type='submit'
          disabled={submitState === 'loading'}
          className='inline-flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-opacity disabled:opacity-60 hover:opacity-90'
          style={{ backgroundColor: cfg.color }}
        >
          {submitState === 'loading' && <Loader2 className='h-3 w-3 animate-spin' />}
          Subscribe Free
        </button>
      </form>
    </section>
  );
}

export default NewsletterSignup;
