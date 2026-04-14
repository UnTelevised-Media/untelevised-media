// src/app/(portal)/portal/articles/new/page.tsx
// New article editor — optionally pre-seeded from a claimed pitch via ?pitchId=
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { getSanityAuthorIdForCurrentUser } from '@/lib/portal/author-actions';
import { portalClient } from '@/lib/portal/fetch';
import {
  queryPortalCategories,
  queryPortalAuthors,
  queryPortalClaimedPitchById,
} from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import ArticleEditorForm from '@/components/portal/ArticleEditorForm';
import type { PitchForModal } from '@/components/portal/PitchQuickViewModal';

export const metadata = {
  title: 'New Article — Author Portal',
  robots: { index: false, follow: false },
};

type Category = { _id: string; title: string; slug?: { current: string } };
type Author = { _id: string; name: string; image?: { asset?: { url: string } } };

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ pitchId?: string }>;
}) {
  const { pitchId } = await searchParams;
  const { id: clerkUserId, role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');

  const [categories, authors, sanityAuthorId, pitchRaw] = await Promise.all([
    portalClient.fetch<Category[]>(queryPortalCategories),
    isEditorPlus ? portalClient.fetch<Author[]>(queryPortalAuthors) : Promise.resolve([]),
    getSanityAuthorIdForCurrentUser(clerkUserId),
    pitchId
      ? portalClient.fetch<PitchForModal | null>(queryPortalClaimedPitchById, { id: pitchId })
      : Promise.resolve(null),
  ]);

  // Pre-fill title from pitch headline if available
  const initialData = pitchRaw?.headline ? { title: pitchRaw.headline } : undefined;

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />
      <main className='mx-auto max-w-5xl px-4 py-8 sm:px-6'>
        <h1 className='mb-6 text-xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
          New Article
          {pitchRaw?.beat && (
            <span className='ml-3 text-xs font-bold normal-case tracking-normal text-slate-400'>
              from pitch · {pitchRaw.beat}
            </span>
          )}
        </h1>
        <ArticleEditorForm
          initialData={initialData}
          categories={categories}
          authors={authors}
          isEditorPlus={isEditorPlus}
          currentSanityAuthorId={sanityAuthorId ?? undefined}
          linkedPitch={pitchRaw}
          linkedPitchId={pitchId}
        />
      </main>
    </div>
  );
}
