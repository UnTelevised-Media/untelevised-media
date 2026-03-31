// src/app/(portal)/portal/articles/[id]/edit/page.tsx
// Edit existing article — verifies ownership server-side before rendering.
import { notFound } from 'next/navigation';
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { getSanityAuthorIdForCurrentUser } from '@/lib/portal/author-actions';
import { portalClient } from '@/lib/portal/fetch';
import {
  queryPortalArticleById,
  queryPortalCategories,
  queryPortalAuthors,
} from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import ArticleEditorForm from '@/components/portal/ArticleEditorForm';
import type { ArticleWriteInput } from '@/lib/portal/article-actions';

export const metadata = {
  title: 'Edit Article — Author Portal',
  robots: { index: false, follow: false },
};

type Category = { _id: string; title: string; slug?: { current: string } };
type Author = { _id: string; name: string };
type PortalArticleFull = ArticleWriteInput & {
  _id: string;
  authorId: string;
  author?: { _id: string; name: string };
  categories?: Array<{ _id: string; title: string }>;
  sources?: Array<{ _id: string; label: string }>;
  relatedArticles?: Array<{ _id: string; title: string; slug?: { current: string } }>;
  mainImage?: {
    _type: 'image';
    asset?: { _id?: string; url?: string };
    alt?: string;
  } | null;
};

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { id: clerkUserId, role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');

  const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);

  const [article, categories, authors] = await Promise.all([
    portalClient.fetch<PortalArticleFull | null>(queryPortalArticleById, { id }),
    portalClient.fetch<Category[]>(queryPortalCategories),
    isEditorPlus ? portalClient.fetch<Author[]>(queryPortalAuthors) : Promise.resolve([]),
  ]);

  if (!article) notFound();

  // Authors can only access their own articles
  if (!isEditorPlus && article.authorId !== sanityAuthorId) notFound();

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav />
      <main className='mx-auto max-w-5xl px-4 py-8 sm:px-6'>
        <h1 className='mb-6 text-xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
          Edit Article
        </h1>
        <ArticleEditorForm
          articleId={id}
          initialData={article}
          categories={categories}
          authors={authors}
          isEditorPlus={isEditorPlus}
          currentSanityAuthorId={sanityAuthorId ?? undefined}
        />
      </main>
    </div>
  );
}
