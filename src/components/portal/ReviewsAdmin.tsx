'use client';
// src/components/portal/ReviewsAdmin.tsx
// Admin review moderation table — approve, decline, or send revision feedback.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { approveReview, declineReview, sendReviewFeedback } from '@/lib/portal/review-actions';

export interface PortalReview {
  _id: string;
  reviewerName: string;
  reviewerLocation?: string;
  rating: number;
  body: string;
  status: 'pending' | 'approved' | 'declined' | 'needs_revision' | null;
  clerkUserId?: string;
  adminFeedback?: string;
  submittedAt: string;
  bookTitle: string;
  bookSlug: string;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  declined: {
    label: 'Declined',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  needs_revision: {
    label: 'Needs Revision',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className='text-sm text-amber-400'>
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </span>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const s = STATUS_LABELS[status ?? 'pending'] ?? STATUS_LABELS.pending;
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${s.className}`}
    >
      {s.label}
    </span>
  );
}

function FeedbackModal({
  reviewId,
  reviewerName,
  onClose,
}: {
  reviewId: string;
  reviewerName: string;
  onClose: () => void;
}) {
  const [feedback, setFeedback] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSend() {
    startTransition(async () => {
      const result = await sendReviewFeedback(reviewId, feedback);
      if (result.ok) {
        toast.success('Feedback sent — review marked as needs revision.');
        router.refresh();
        onClose();
      } else {
        toast.error(result.error ?? 'Failed to send feedback');
      }
    });
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
      <div className='w-full max-w-md border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900'>
        <h2 className='mb-1 text-sm font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
          Send Feedback
        </h2>
        <p className='mb-4 text-xs text-slate-500 dark:text-slate-400'>
          This message will be shown to <strong>{reviewerName}</strong> on their My Reviews page.
        </p>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder='Explain what needs to be revised…'
          rows={5}
          className='mb-4 w-full resize-y border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100'
        />
        <div className='flex items-center gap-3'>
          <button
            onClick={handleSend}
            disabled={!feedback.trim() || isPending}
            className='bg-untele px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
          >
            {isPending ? 'Sending…' : 'Send Feedback'}
          </button>
          <button
            onClick={onClose}
            className='text-xs text-slate-500 hover:text-untele dark:text-slate-400'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ review }: { review: PortalReview }) {
  const [expanded, setExpanded] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveReview(review._id);
      if (result.ok) {
        toast.success('Review approved.');
        router.refresh();
      } else toast.error(result.error ?? 'Failed');
    });
  }

  function handleDecline() {
    startTransition(async () => {
      const result = await declineReview(review._id);
      if (result.ok) {
        toast.success('Review declined.');
        router.refresh();
      } else toast.error(result.error ?? 'Failed');
    });
  }

  const date = new Date(review.submittedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      {feedbackOpen && (
        <FeedbackModal
          reviewId={review._id}
          reviewerName={review.reviewerName}
          onClose={() => setFeedbackOpen(false)}
        />
      )}
      <tr className='border-b border-slate-200 bg-white align-top dark:border-slate-800 dark:bg-black'>
        {/* Book */}
        <td className='px-4 py-3'>
          <a
            href={`/bookstore/book/${review.bookSlug}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs font-bold text-untele hover:underline'
          >
            {review.bookTitle}
          </a>
        </td>
        {/* Reviewer */}
        <td className='px-4 py-3'>
          <p className='text-xs font-bold text-slate-900 dark:text-slate-100'>
            {review.reviewerName}
          </p>
          {review.reviewerLocation && (
            <p className='text-[10px] text-slate-500'>{review.reviewerLocation}</p>
          )}
          {review.clerkUserId && (
            <span className='mt-0.5 inline-block text-[9px] font-black uppercase tracking-widest text-[#009736]'>
              account
            </span>
          )}
        </td>
        {/* Rating */}
        <td className='px-4 py-3'>
          <Stars rating={review.rating} />
        </td>
        {/* Body */}
        <td className='max-w-xs px-4 py-3'>
          <p
            className={`text-xs text-slate-700 dark:text-slate-300 ${!expanded ? 'line-clamp-3' : ''}`}
          >
            {review.body}
          </p>
          {review.body.length > 120 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className='mt-1 text-[10px] text-untele hover:underline'
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </td>
        {/* Status */}
        <td className='px-4 py-3'>
          <StatusBadge status={review.status} />
          {review.adminFeedback && (
            <p className='mt-1 text-[10px] italic text-slate-500 dark:text-slate-400'>
              Feedback sent
            </p>
          )}
        </td>
        {/* Date */}
        <td className='whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400'>
          {date}
        </td>
        {/* Actions */}
        <td className='px-4 py-3'>
          <div className='flex flex-col gap-1.5'>
            {review.status !== 'approved' && (
              <button
                onClick={handleApprove}
                disabled={isPending}
                className='bg-[#009736] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
              >
                Approve
              </button>
            )}
            {review.status !== 'declined' && (
              <button
                onClick={handleDecline}
                disabled={isPending}
                className='bg-slate-700 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
              >
                Decline
              </button>
            )}
            {review.clerkUserId && review.status !== 'approved' && (
              <button
                onClick={() => setFeedbackOpen(true)}
                disabled={isPending}
                className='border border-untele px-3 py-1 text-[9px] font-black uppercase tracking-widest text-untele hover:bg-untele hover:text-white disabled:opacity-50'
              >
                Feedback
              </button>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

const STATUS_ORDER = ['pending', 'needs_revision', 'approved', 'declined'];

export default function ReviewsAdmin({ reviews }: { reviews: PortalReview[] }) {
  const [filter, setFilter] = useState<string>('all');

  const filtered =
    filter === 'all'
      ? [...reviews].sort(
          (a, b) =>
            STATUS_ORDER.indexOf(a.status ?? 'pending') -
            STATUS_ORDER.indexOf(b.status ?? 'pending')
        )
      : reviews.filter((r) => (r.status ?? 'pending') === filter);

  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => (r.status ?? 'pending') === 'pending').length,
    needs_revision: reviews.filter((r) => r.status === 'needs_revision').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    declined: reviews.filter((r) => r.status === 'declined').length,
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className='mb-6 flex flex-wrap gap-2'>
        {(
          [
            ['all', 'All'],
            ['pending', 'Pending'],
            ['needs_revision', 'Needs Revision'],
            ['approved', 'Approved'],
            ['declined', 'Declined'],
          ] as [string, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
              filter === value
                ? 'bg-untele text-white'
                : 'border border-slate-200 text-slate-600 hover:border-untele hover:text-untele dark:border-slate-700 dark:text-slate-400'
            }`}
          >
            {label} ({counts[value as keyof typeof counts] ?? 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className='border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-black'>
          <p className='text-sm font-bold uppercase tracking-widest text-slate-400'>No reviews</p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-sm'>
            <thead>
              <tr className='border-b-2 border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900'>
                {['Book', 'Reviewer', 'Rating', 'Review', 'Status', 'Submitted', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className='px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500'
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <ReviewRow key={review._id} review={review} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
