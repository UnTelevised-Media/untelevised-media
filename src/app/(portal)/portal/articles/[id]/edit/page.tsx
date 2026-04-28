// src/app/(portal)/portal/articles/[id]/edit/page.tsx
// Edit existing article — verifies ownership server-side before rendering.
import { notFound } from 'next/navigation';
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { getSanityAuthorIdForCurrentUser } from '@/lib/portal/author-actions';
import { portalFetch } from '@/lib/portal/live';
import {
  queryPortalArticleById,
  queryPortalCategories,
  queryPortalAuthors,
} from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import ArticleEditorForm from '@/components/portal/ArticleEditorForm';
import type { ArticleWriteInput } from '@/lib/portal/article-actions';
import type { PitchForModal } from '@/components/portal/PitchQuickViewModal';

export const metadata = {
  title: 'Edit Article — Author Portal',
  robots: { index: false, follow: false },
};

type Category = { _id: string; title: string; slug?: { current: string } };
type Author = { _id: string; name: string };
type PortalArticleFull = ArticleWriteInput & {
  _id: string;
  _originalId?: string;
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
  linkedPitch?: PitchForModal | null;
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

  const [article, categories, authorList] = await Promise.all([
    portalFetch<PortalArticleFull | null>(queryPortalArticleById, { id }),
    portalFetch<Category[]>(queryPortalCategories),
    isEditorPlus ? portalFetch<Author[]>(queryPortalAuthors) : Promise.resolve([]),
  ]);

  if (!article) notFound();

  // Ensure the article's current author always appears in the dropdown, even if
  // they were excluded by the isActive filter (e.g. field not set on older records).
  const authors: Author[] =
    article.author && !authorList.some((a) => a._id === article.author!._id)
      ? [{ _id: article.author._id, name: article.author.name }, ...authorList]
      : authorList;

  // Authors can only access their own articles
  if (!isEditorPlus && article.authorId !== sanityAuthorId) notFound();

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />
      <main className='mx-auto max-w-5xl px-4 py-8 sm:px-6'>
        <h1 className='mb-6 text-xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
          Edit Article
        </h1>
        <ArticleEditorForm
          articleId={article._originalId ?? id}
          initialData={article}
          categories={categories}
          authors={authors}
          isEditorPlus={isEditorPlus}
          currentSanityAuthorId={sanityAuthorId ?? undefined}
          linkedPitch={article.linkedPitch}
        />
      </main>
    </div>
  );
}
