// src/app/(portal)/portal/articles/page.tsx
// Author dashboard — article list with search, filter, sort, quick actions.
// Server component: fetches articles scoped by role (author = own, editor/admin = all).
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { getSanityAuthorIdForCurrentUser } from '@/lib/portal/author-actions';
import { portalFetch } from '@/lib/portal/live';
import {
  queryPortalArticlesByAuthor,
  queryPortalAllArticles,
} from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import ArticleDashboard from '@/components/portal/ArticleDashboard';
import Link from 'next/link';
import type { PortalArticle } from '@/components/portal/ArticleDashboard';

export const metadata = {
  title: 'My Articles — Author Portal',
  robots: { index: false, follow: false },
};

export default async function PortalArticlesPage() {
  const { id: clerkUserId, role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');

  let articles: PortalArticle[] = [];
  // Always fetch the current user's Sanity author ID — editors need it for the "Mine" filter
  const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);

  if (isEditorPlus) {
    articles = await portalFetch<PortalArticle[]>(queryPortalAllArticles);
  } else {
    if (sanityAuthorId) {
      articles = await portalFetch<PortalArticle[]>(queryPortalArticlesByAuthor, { sanityAuthorId });
    }
  }

  // Under previewDrafts perspective, _id is always the non-prefixed form.
  // _originalId is the actual Sanity document ID and preserves the "drafts." prefix.
  const isDraftDoc = (a: PortalArticle) => (a._originalId ?? a._id).startsWith('drafts.');
  const publishedCount = articles.filter((a) => !isDraftDoc(a)).length;
  const reviewCount = articles.filter((a) => isDraftDoc(a) && (a.needsReview || !!a.deletionRequest)).length;
  // Unpublished = draft _originalId + publishedAt set (was previously live, now taken down in Studio)
  const unpublishedCount = articles.filter((a) => isDraftDoc(a) && !a.needsReview && !a.deletionRequest && !!a.publishedAt).length;
  const draftCount = articles.filter((a) => isDraftDoc(a) && !a.needsReview && !a.deletionRequest).length;

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />

      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        {/* Header */}
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
              {isEditorPlus ? 'All Articles' : 'My Articles'}
            </h1>
            <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
              {publishedCount} published &nbsp;·&nbsp; {reviewCount} in review &nbsp;·&nbsp; {draftCount} draft
              {unpublishedCount > 0 && (
                <>&nbsp;·&nbsp; <span className='text-amber-600 dark:text-amber-400'>{unpublishedCount} unpublished</span></>
              )}
            </p>
          </div>
          <Link
            href='/portal/articles/new'
            className='inline-flex items-center justify-center bg-untele px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-opacity hover:opacity-90'
          >
            + New Article
          </Link>
        </div>

        {/* Dashboard client component handles search/filter/sort/actions */}
        <ArticleDashboard
          articles={articles}
          isEditorPlus={isEditorPlus}
          currentSanityAuthorId={sanityAuthorId ?? undefined}
        />
      </main>
    </div>
  );
}
