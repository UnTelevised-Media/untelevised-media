// src/app/(news)/unsubscribe/page.tsx
// Shown after a user clicks the unsubscribe link in a news newsletter email.
// The API route (GET /api/newsletter-unsubscribe) does the actual work and redirects here.
import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SubscribedBanner } from '@/components/newsletter/SubscribedBanner';

export const metadata: Metadata = {
  title: 'Unsubscribed — UnTelevised Media',
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <div className='min-h-screen bg-white dark:bg-black'>
      <div className='mx-auto max-w-2xl px-4 py-24'>
        <Suspense>
          <SubscribedBanner brandColor='#D70606' />
        </Suspense>

        <div className='mt-12 text-center'>
          <div className='mb-6 inline-block bg-untele px-4 py-2'>
            <span className='text-sm font-black uppercase tracking-widest text-white'>
              UnTelevised Media
            </span>
          </div>
          <h1 className='mb-4 text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
            You&rsquo;re Unsubscribed
          </h1>
          <p className='mb-8 text-slate-600 dark:text-slate-400'>
            You&rsquo;ve been removed from the UnTelevised Media newsletter. No further emails will
            be sent to you from this list.
          </p>
          <p className='mb-8 text-sm text-slate-500 dark:text-slate-500'>
            Changed your mind?{' '}
            <Link href='/' className='text-untele underline hover:no-underline'>
              Subscribe again from the homepage.
            </Link>
          </p>
          <Link
            href='/'
            className='inline-block bg-untele px-8 py-3 text-xs font-black uppercase tracking-widest text-white hover:opacity-90'
          >
            Back to UnTelevised Media
          </Link>
        </div>
      </div>
    </div>
  );
}
