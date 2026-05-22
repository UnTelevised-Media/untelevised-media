// src/app/(portal)/portal/reviews/page.tsx
// Admin book review moderation — editor+ only.

import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { portalFetch } from '@/lib/portal/live';
import { queryPortalAllReviews } from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import ReviewsAdmin, { type PortalReview } from '@/components/portal/ReviewsAdmin';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Book Reviews — Author Portal',
  robots: { index: false, follow: false },
};

export default async function ReviewsPage() {
  const { role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');
  if (!isEditorPlus) redirect('/portal/articles');

  const reviews = (await portalFetch<PortalReview[]>(queryPortalAllReviews)) ?? [];

  const pending = reviews.filter((r) => (r.status ?? 'pending') === 'pending').length;
  const needsRevision = reviews.filter((r) => r.status === 'needs_revision').length;

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        <div className='mb-8'>
          <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
            Book Reviews
          </h1>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            {reviews.length} total &nbsp;·&nbsp;
            <span className='text-amber-600 dark:text-amber-400'>{pending} pending</span>
            {needsRevision > 0 && (
              <> &nbsp;·&nbsp; <span className='text-blue-600 dark:text-blue-400'>{needsRevision} needs revision</span></>
            )}
          </p>
        </div>
        <ReviewsAdmin reviews={reviews} />
      </main>
    </div>
  );
}
