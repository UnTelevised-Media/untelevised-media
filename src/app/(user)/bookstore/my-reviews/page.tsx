// src/app/(user)/bookstore/my-reviews/page.tsx
// Signed-in user's review history — shows all their submitted reviews with status + feedback.

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { writeClient } from '@/lib/sanity/lib/write-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Reviews — Hurriya Publications',
  robots: { index: false, follow: false },
};

interface MyReview {
  _id: string;
  rating: number;
  body: string;
  status: 'pending' | 'approved' | 'declined' | 'needs_revision' | null;
  adminFeedback?: string;
  submittedAt: string;
  bookTitle: string;
  bookSlug: string;
}

const STATUS_CONFIG = {
  approved: {
    label: 'Published',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  pending: {
    label: 'Under Review',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
  needs_revision: {
    label: 'Needs Revision',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  declined: {
    label: 'Not Published',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className='text-amber-400'>
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </span>
  );
}

export default async function MyReviewsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/bookstore');

  const reviews = await writeClient.fetch<MyReview[]>(
    `*[_type == "bookReview" && clerkUserId == $userId] | order(submittedAt desc) {
      _id, rating, body, status, adminFeedback, submittedAt,
      "bookTitle": book->title,
      "bookSlug": book->slug.current
    }`,
    { userId }
  );

  return (
    <main className='mx-auto max-w-3xl px-4 py-8 sm:px-6'>
      <div className='mb-8'>
        <Link
          href='/bookstore'
          className='mb-4 inline-block text-[10px] font-black uppercase tracking-widest text-hp-muted hover:text-untele'
        >
          ← Back to Bookstore
        </Link>
        <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-hp-cream'>
          My Reviews
        </h1>
        <p className='mt-1 text-sm text-slate-500 dark:text-hp-muted'>
          {reviews.length} review{reviews.length !== 1 ? 's' : ''} submitted
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className='border border-hp-sand-border bg-white p-12 text-center dark:border-hp-dark-border dark:bg-hp-dark-card'>
          <p className='mb-4 text-sm font-bold uppercase tracking-widest text-slate-400'>
            No reviews yet
          </p>
          <Link
            href='/bookstore'
            className='bg-untele px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90'
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className='flex flex-col gap-4'>
          {reviews.map((review) => {
            const status = review.status ?? 'pending';
            const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
            const date = new Date(review.submittedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div
                key={review._id}
                className='border border-hp-sand-border bg-white p-5 dark:border-hp-dark-border dark:bg-hp-dark-card'
              >
                <div className='mb-3 flex flex-wrap items-start justify-between gap-3'>
                  <div>
                    <Link
                      href={`/bookstore/book/${review.bookSlug}`}
                      className='text-sm font-black uppercase tracking-tight text-slate-900 hover:text-untele dark:text-hp-cream'
                    >
                      {review.bookTitle}
                    </Link>
                    <div className='mt-0.5 flex items-center gap-2'>
                      <Stars rating={review.rating} />
                      <span className='text-[10px] text-slate-400'>{date}</span>
                    </div>
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${config.className}`}
                  >
                    {config.label}
                  </span>
                </div>

                <p className='text-sm text-slate-700 dark:text-hp-muted'>{review.body}</p>

                {status === 'needs_revision' && review.adminFeedback && (
                  <div className='mt-3 border-l-4 border-blue-400 bg-blue-50 py-3 pl-4 pr-3 dark:bg-blue-900/20'>
                    <p className='mb-1 text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400'>
                      Feedback from our team
                    </p>
                    <p className='text-xs text-blue-900 dark:text-blue-200'>
                      {review.adminFeedback}
                    </p>
                    <Link
                      href={`/bookstore/book/${review.bookSlug}`}
                      className='mt-2 inline-block text-[10px] font-black uppercase tracking-widest text-blue-700 hover:underline dark:text-blue-400'
                    >
                      Submit a revised review →
                    </Link>
                  </div>
                )}

                {status === 'declined' && (
                  <p className='mt-3 text-[11px] text-slate-400'>
                    This review was not approved for publication.
                    {review.adminFeedback && (
                      <>
                        {' '}
                        <span className='text-slate-500'>{review.adminFeedback}</span>
                      </>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
