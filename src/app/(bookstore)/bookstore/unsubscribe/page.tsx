// src/app/(user)/bookstore/unsubscribe/page.tsx
// Shown after a user clicks the unsubscribe link in a bookstore newsletter email.
import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SubscribedBanner } from '@/components/newsletter/SubscribedBanner';

export const metadata: Metadata = {
  title: 'Unsubscribed — Hurriya Publications',
  robots: { index: false, follow: false },
};

export default function BookstoreUnsubscribePage() {
  return (
    <div className='min-h-screen bg-white dark:bg-black'>
      <div className='mx-auto max-w-2xl px-4 py-24'>
        <Suspense>
          <SubscribedBanner brandColor='#009736' />
        </Suspense>

        <div className='mt-12 text-center'>
          <div className='mb-6 inline-block px-4 py-2' style={{ backgroundColor: '#009736' }}>
            <span className='text-sm font-black uppercase tracking-widest text-white'>
              Hurriya Publications
            </span>
          </div>
          <h1 className='mb-4 text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
            You&rsquo;re Unsubscribed
          </h1>
          <p className='mb-8 text-slate-600 dark:text-slate-400'>
            You&rsquo;ve been removed from the Hurriya Publications newsletter. No further emails
            will be sent to you from this list.
          </p>
          <p className='mb-8 text-sm text-slate-500 dark:text-slate-500'>
            Changed your mind?{' '}
            <Link
              href='/bookstore'
              className='underline hover:no-underline'
              style={{ color: '#009736' }}
            >
              Subscribe again from the bookstore.
            </Link>
          </p>
          <Link
            href='/bookstore'
            className='inline-block px-8 py-3 text-xs font-black uppercase tracking-widest text-white hover:opacity-90'
            style={{ backgroundColor: '#009736' }}
          >
            Back to the Bookstore
          </Link>
        </div>
      </div>
    </div>
  );
}
