// src/lib/portal/article-actions.ts
// Server Actions for article CRUD operations in the Author Portal.
// All mutations use writeClient (server-only). Every action re-verifies
// the Clerk session and role — client state is never trusted.
'use server';

import { requireAuthor } from '@/lib/auth/roles';
import { hasRole, getRoleFromMeta } from '@/lib/auth/roles-utils';
import { writeClient } from '@/lib/sanity/lib/write-client';
import { getSanityAuthorIdForCurrentUser } from './author-actions';
import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { sanitizeText } from './sanitize';
import { checkRateLimit } from './rate-limit';

// Portable Text block — matches Sanity's block content structure
type PortableTextBlock = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const slugSchema = z.object({
  _type: z.literal('slug'),
  current: z.string().min(1).max(200),
});

const articleWriteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  slug: slugSchema,
  description: z.string().max(500).optional(),
  leadParagraph: z.string().max(1000).optional(),
  body: z.array(z.record(z.string(), z.unknown())).optional(), // Portable Text blocks
  status: z.enum(['draft', 'published']).default('draft'),
  featured: z.boolean().optional(),
  breakingNews: z.boolean().optional(),
  needsReview: z.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
  categories: z.array(z.object({ _type: z.literal('reference'), _ref: z.string() })).optional(),
  tags: z.array(z.string()).max(10).optional(),
  keywords: z.array(z.string()).optional(),
  location: z.string().max(200).optional(),
  allowComments: z.boolean().optional(),
  mainImage: z
    .object({
      _type: z.literal('image'),
      asset: z.object({ _type: z.literal('reference'), _ref: z.string() }),
      alt: z.string().max(300).optional(),
    })
    .optional()
    .nullable(),
  authorRef: z.string().optional(), // sanity author _id — editors can change, authors cannot
  sources: z.array(z.object({ _type: z.literal('reference'), _ref: z.string() })).optional(),
  relatedArticles: z
    .array(z.object({ _type: z.literal('reference'), _ref: z.string() }))
    .optional(),
  methodology: z.string().max(2000).optional(),
  hasEmbeddedVideo: z.boolean().optional(),
  videoLink: z.string().url().optional().nullable(),
  eventDate: z.string().optional().nullable(),
  faqs: z
    .array(
      z.object({
        question: z.string().max(300),
        answer: z.string().max(2000),
      })
    )
    .optional(),
  correction: z
    .object({
      type: z.enum(['correction', 'clarification', 'update', 'retraction']),
      issuedAt: z.string().min(1, 'Issued date is required'),
      summary: z.string().max(120).optional(),
      detail: z.string().min(1, 'Full correction text is required'),
    })
    .optional()
    .nullable(),
});

export type ArticleWriteInput = z.infer<typeof articleWriteSchema>;

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Verify the caller owns the article or has editor+ role. */
async function verifyArticleAccess(
  clerkUserId: string,
  articleId: string
): Promise<{ canEdit: boolean; isEditorPlus: boolean; sanityAuthorId: string | null }> {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  const meta = (user.publicMetadata ?? {}) as Record<string, unknown>;
  const role = getRoleFromMeta(meta);
  const isEditorPlus = hasRole(role, 'editor');

  const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);

  if (isEditorPlus) return { canEdit: true, isEditorPlus: true, sanityAuthorId };

  // Authors can only edit their own articles
  const article = await writeClient.fetch<{ authorId: string } | null>(
    `*[_type == "article" && _id == $id][0]{ "authorId": author._ref }`,
    { id: articleId }
  );

  const canEdit = !!article && article.authorId === sanityAuthorId;
  return { canEdit, isEditorPlus: false, sanityAuthorId };
}

/** Sanitize all user-submitted text fields before writing to Sanity. */
function sanitizeArticleInput(input: ArticleWriteInput): ArticleWriteInput {
  return {
    ...input,
    title: sanitizeText(input.title),
    description: input.description ? sanitizeText(input.description) : input.description,
    leadParagraph: input.leadParagraph ? sanitizeText(input.leadParagraph) : input.leadParagraph,
    location: input.location ? sanitizeText(input.location) : input.location,
    methodology: input.methodology ? sanitizeText(input.methodology) : input.methodology,
    tags: input.tags?.map(sanitizeText),
    keywords: input.keywords?.map(sanitizeText),
  };
}

// ---------------------------------------------------------------------------
// Create article
// ---------------------------------------------------------------------------

export async function createArticle(
  input: ArticleWriteInput
): Promise<ActionResult<{ _id: string; slug: string }>> {
  const { id: clerkUserId } = await requireAuthor();

  const rl = await checkRateLimit(clerkUserId);
  if (!rl.allowed)
    return { success: false, error: `Rate limit exceeded. Retry in ${rl.retryAfter}s.` };

  const parsed = articleWriteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  const meta = (user.publicMetadata ?? {}) as Record<string, unknown>;
  const role = getRoleFromMeta(meta);
  const isEditorPlus = hasRole(role, 'editor');

  const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);
  if (!sanityAuthorId) {
    return {
      success: false,
      error: 'No author profile linked to your account. Contact an admin.',
    };
  }

  const sanitized = sanitizeArticleInput(parsed.data);

  // Authors are always assigned to themselves; editors can set any author
  const authorRef = isEditorPlus && sanitized.authorRef ? sanitized.authorRef : sanityAuthorId;

  // Authors cannot publish directly
  const status = isEditorPlus ? sanitized.status : 'draft';
  // Authors cannot set featured/breakingNews
  const featured = isEditorPlus ? (sanitized.featured ?? false) : false;
  const breakingNews = isEditorPlus ? (sanitized.breakingNews ?? false) : false;

  const doc = {
    _type: 'article',
    title: sanitized.title,
    slug: sanitized.slug,
    description: sanitized.description ?? '',
    leadParagraph: sanitized.leadParagraph ?? '',
    body: (sanitized.body ?? []) as PortableTextBlock[],
    status,
    featured,
    breakingNews,
    needsReview: sanitized.needsReview ?? false,
    publishedAt:
      status === 'published' ? (sanitized.publishedAt ?? new Date().toISOString()) : undefined,
    author: { _type: 'reference', _ref: authorRef },
    categories: sanitized.categories ?? [],
    tags: sanitized.tags ?? [],
    keywords: sanitized.keywords ?? [],
    location: sanitized.location ?? '',
    allowComments: sanitized.allowComments ?? true,
    mainImage: sanitized.mainImage ?? undefined,
    sources: sanitized.sources ?? [],
    relatedArticles: sanitized.relatedArticles ?? [],
    methodology: sanitized.methodology ?? '',
    hasEmbeddedVideo: sanitized.hasEmbeddedVideo ?? false,
    videoLink: sanitized.videoLink ?? '',
    eventDate: sanitized.eventDate ?? undefined,
    faqs: sanitized.faqs ?? [],
    correction: sanitized.correction ?? undefined,
  };

  const created = await writeClient.create(doc);
  return { success: true, data: { _id: created._id, slug: sanitized.slug.current } };
}

// ---------------------------------------------------------------------------
// Update article
// ---------------------------------------------------------------------------

export async function updateArticle(
  articleId: string,
  input: ArticleWriteInput
): Promise<ActionResult<{ _id: string }>> {
  const { id: clerkUserId } = await requireAuthor();

  const rl = await checkRateLimit(clerkUserId);
  if (!rl.allowed)
    return { success: false, error: `Rate limit exceeded. Retry in ${rl.retryAfter}s.` };

  const parsed = articleWriteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  const { canEdit, isEditorPlus } = await verifyArticleAccess(clerkUserId, articleId);
  if (!canEdit) {
    return { success: false, error: 'You do not have permission to edit this article.' };
  }

  const sanitized = sanitizeArticleInput(parsed.data);

  const patch: Record<string, unknown> = {
    title: sanitized.title,
    slug: sanitized.slug,
    description: sanitized.description ?? '',
    leadParagraph: sanitized.leadParagraph ?? '',
    body: (sanitized.body ?? []) as PortableTextBlock[],
    needsReview: sanitized.needsReview ?? false,
    categories: sanitized.categories ?? [],
    tags: sanitized.tags ?? [],
    keywords: sanitized.keywords ?? [],
    location: sanitized.location ?? '',
    allowComments: sanitized.allowComments ?? true,
    mainImage: sanitized.mainImage ?? undefined,
    sources: sanitized.sources ?? [],
    relatedArticles: sanitized.relatedArticles ?? [],
    methodology: sanitized.methodology ?? '',
    hasEmbeddedVideo: sanitized.hasEmbeddedVideo ?? false,
    videoLink: sanitized.videoLink ?? '',
    eventDate: sanitized.eventDate ?? undefined,
    faqs: sanitized.faqs ?? [],
    correction: sanitized.correction ?? undefined,
    updatedAt: new Date().toISOString(),
  };

  if (isEditorPlus) {
    patch.status = sanitized.status;
    patch.featured = sanitized.featured ?? false;
    patch.breakingNews = sanitized.breakingNews ?? false;
    if (sanitized.status === 'published') {
      patch.publishedAt = sanitized.publishedAt ?? new Date().toISOString();
    }
    if (sanitized.authorRef) {
      patch.author = { _type: 'reference', _ref: sanitized.authorRef };
    }
  }

  await writeClient.patch(articleId).set(patch).commit();
  return { success: true, data: { _id: articleId } };
}

// ---------------------------------------------------------------------------
// Delete article
// ---------------------------------------------------------------------------

export async function deleteArticle(articleId: string): Promise<ActionResult> {
  const { id: clerkUserId } = await requireAuthor();

  const rl = await checkRateLimit(clerkUserId);
  if (!rl.allowed)
    return { success: false, error: `Rate limit exceeded. Retry in ${rl.retryAfter}s.` };

  const { canEdit, isEditorPlus } = await verifyArticleAccess(clerkUserId, articleId);

  // Authors can only delete their own drafts
  if (!isEditorPlus) {
    const article = await writeClient.fetch<{ status: string } | null>(
      `*[_type == "article" && _id == $id][0]{ status }`,
      { id: articleId }
    );
    if (!article || article.status !== 'draft') {
      return { success: false, error: 'Authors can only delete their own draft articles.' };
    }
  }

  if (!canEdit) {
    return { success: false, error: 'You do not have permission to delete this article.' };
  }

  await writeClient.delete(articleId);
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Submit for review (author action)
// ---------------------------------------------------------------------------

export async function submitArticleForReview(articleId: string): Promise<ActionResult> {
  const { id: clerkUserId } = await requireAuthor();
  const { canEdit } = await verifyArticleAccess(clerkUserId, articleId);

  if (!canEdit) {
    return { success: false, error: 'You do not have permission to submit this article.' };
  }

  await writeClient
    .patch(articleId)
    .set({ needsReview: true, status: 'draft', updatedAt: new Date().toISOString() })
    .commit();

  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Search articles by title (for related-article linking)
// ---------------------------------------------------------------------------

export async function searchArticles(
  query: string
): Promise<ActionResult<Array<{ _id: string; title: string; slug: { current: string } }>>> {
  await requireAuthor();

  if (!query.trim()) return { success: true, data: [] };

  const results = await writeClient.fetch<
    Array<{ _id: string; title: string; slug: { current: string } }>
  >(`*[_type == "article" && title match $q][0...12]{ _id, title, slug }`, {
    q: `${query.trim()}*`,
  });

  return { success: true, data: results ?? [] };
}

// ---------------------------------------------------------------------------
// Publish article (editor+ only)
// ---------------------------------------------------------------------------

export async function publishArticle(
  articleId: string,
  scheduledAt?: string
): Promise<ActionResult> {
  const { id: clerkUserId, role } = await requireAuthor();

  if (!hasRole(role, 'editor')) {
    return { success: false, error: 'Only editors and admins can publish articles.' };
  }

  await writeClient
    .patch(articleId)
    .set({
      status: 'published',
      publishedAt: scheduledAt ?? new Date().toISOString(),
      needsReview: false,
      updatedAt: new Date().toISOString(),
    })
    .commit();

  return { success: true, data: undefined };
}
