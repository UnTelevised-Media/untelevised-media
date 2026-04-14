// src/app/(portal)/portal/articles/new/page.tsx
// New article editor — server component that fetches reference data
// (categories, authors) and passes to the client editor form.
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { getSanityAuthorIdForCurrentUser } from '@/lib/portal/author-actions';
import { portalClient } from '@/lib/portal/fetch';
import { queryPortalCategories, queryPortalAuthors } from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import ArticleEditorForm from '@/components/portal/ArticleEditorForm';

export const metadata = {
  title: 'New Article — Author Portal',
  robots: { index: false, follow: false },
};

type Category = { _id: string; title: string; slug?: { current: string } };
type Author = { _id: string; name: string; image?: { asset?: { url: string } } };

export default async function NewArticlePage() {
  const { id: clerkUserId, role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');

  const [categories, authors, sanityAuthorId] = await Promise.all([
    portalClient.fetch<Category[]>(queryPortalCategories),
    isEditorPlus ? portalClient.fetch<Author[]>(queryPortalAuthors) : Promise.resolve([]),
    getSanityAuthorIdForCurrentUser(clerkUserId),
  ]);

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />
      <main className='mx-auto max-w-5xl px-4 py-8 sm:px-6'>
        <h1 className='mb-6 text-xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
          New Article
        </h1>
        <ArticleEditorForm
          categories={categories}
          authors={authors}
          isEditorPlus={isEditorPlus}
          currentSanityAuthorId={sanityAuthorId ?? undefined}
        />
      </main>
    </div>
  );
}
