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
  description: z.string().max(1000).optional(),
  leadParagraph: z.string().max(1000).optional(),
  body: z.array(z.record(z.string(), z.unknown())).optional(), // Portable Text blocks
  featured: z.boolean().optional(),
  breakingNews: z.boolean().optional(),
  needsReview: z.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
  categories: z
    .array(
      z.object({ _type: z.literal('reference'), _ref: z.string(), _key: z.string().optional() })
    )
    .optional(),
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
  sources: z
    .array(
      z.object({ _type: z.literal('reference'), _ref: z.string(), _key: z.string().optional() })
    )
    .optional(),
  relatedArticles: z
    .array(
      z.object({ _type: z.literal('reference'), _ref: z.string(), _key: z.string().optional() })
    )
    .optional(),
  methodology: z.string().max(2000).optional(),
  hasEmbeddedVideo: z.boolean().optional(),
  videoLink: z.string().url().optional().nullable(),
  eventDate: z.string().optional().nullable(),
  faqs: z
    .array(
      z.object({
        _key: z.string().optional(),
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

  // Authors can only edit their own articles.
  // Query both the draft ID and the published ID so this works regardless of
  // whether the document is a draft-only ("drafts.xxx") or published ("xxx").
  const publishedId = articleId.startsWith('drafts.')
    ? articleId.slice('drafts.'.length)
    : articleId;
  const article = await writeClient.fetch<{ authorId: string } | null>(
    `*[_type == "article" && (_id == $id || _id == $publishedId)][0]{ "authorId": author._ref }`,
    { id: articleId, publishedId }
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
  input: ArticleWriteInput,
  linkedPitchId?: string
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

  // Authors cannot set featured/breakingNews
  const featured = isEditorPlus ? (sanitized.featured ?? false) : false;
  const breakingNews = isEditorPlus ? (sanitized.breakingNews ?? false) : false;

  // Always create as a draft so articles go through editorial review before going live.
  // crypto.randomUUID() is available in Node 18+ (required by Next.js 15).
  const newDocId = `drafts.${crypto.randomUUID()}`;

  const doc = {
    _id: newDocId,
    _type: 'article',
    title: sanitized.title,
    slug: sanitized.slug,
    description: sanitized.description ?? '',
    leadParagraph: sanitized.leadParagraph ?? '',
    body: (sanitized.body ?? []) as PortableTextBlock[],
    featured,
    breakingNews,
    needsReview: sanitized.needsReview ?? false,
    author: { _type: 'reference', _ref: authorRef },
    categories: sanitized.categories ?? [],
    tags: sanitized.tags ?? [],
    keywords: sanitized.keywords ?? [],
    location: sanitized.location ?? '',
    allowComments: sanitized.allowComments ?? true,
    mainImage: sanitized.mainImage ?? undefined,
    ...(sanitized.publishedAt ? { publishedAt: sanitized.publishedAt } : {}),
    sources: sanitized.sources ?? [],
    relatedArticles: sanitized.relatedArticles ?? [],
    methodology: sanitized.methodology ?? '',
    hasEmbeddedVideo: sanitized.hasEmbeddedVideo ?? false,
    videoLink: sanitized.videoLink ?? '',
    eventDate: sanitized.eventDate ?? undefined,
    faqs: sanitized.faqs ?? [],
    correction: sanitized.correction ?? undefined,
    ...(linkedPitchId ? { linkedPitch: { _type: 'reference', _ref: linkedPitchId } } : {}),
  };

  try {
    const created = await writeClient.create(doc);

    // Link back from the pitch to this article (best-effort — non-fatal)
    if (linkedPitchId) {
      await writeClient
        .patch(linkedPitchId)
        .set({ linkedArticle: { _type: 'reference', _ref: created._id } })
        .commit()
        .catch(() => {});
    }

    // Return the actual stored _id ("drafts.xxx") so callers like handlePublish can
    // pass it directly to publishArticle. The form's redirect handler strips the
    // "drafts." prefix to keep the URL clean.
    return { success: true, data: { _id: created._id, slug: sanitized.slug.current } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create article',
    };
  }
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

  // Fields that must always be set (never null/undefined in a valid article)
  const setFields: Record<string, unknown> = {
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
    sources: sanitized.sources ?? [],
    relatedArticles: sanitized.relatedArticles ?? [],
    methodology: sanitized.methodology ?? '',
    hasEmbeddedVideo: sanitized.hasEmbeddedVideo ?? false,
    videoLink: sanitized.videoLink ?? '',
    faqs: sanitized.faqs ?? [],
    updatedAt: new Date().toISOString(),
  };

  if (isEditorPlus) {
    setFields.featured = sanitized.featured ?? false;
    setFields.breakingNews = sanitized.breakingNews ?? false;
    if (sanitized.authorRef) {
      setFields.author = { _type: 'reference', _ref: sanitized.authorRef };
    }
  }

  // Nullable optional fields — use Sanity's unset when cleared, set when present.
  // Passing undefined to .set() silently skips the field and leaves stale data in Sanity.
  const fieldsToUnset: string[] = [];
  if (sanitized.publishedAt) {
    setFields.publishedAt = sanitized.publishedAt;
  } else {
    fieldsToUnset.push('publishedAt');
  }
  if (sanitized.mainImage != null) {
    setFields.mainImage = sanitized.mainImage;
  } else {
    fieldsToUnset.push('mainImage');
  }
  if (sanitized.eventDate != null) {
    setFields.eventDate = sanitized.eventDate;
  } else {
    fieldsToUnset.push('eventDate');
  }
  if (sanitized.correction != null) {
    setFields.correction = sanitized.correction;
  } else {
    fieldsToUnset.push('correction');
  }

  try {
    let patchBuilder = writeClient.patch(articleId).set(setFields);
    if (fieldsToUnset.length > 0) patchBuilder = patchBuilder.unset(fieldsToUnset);
    await patchBuilder.commit();
    return { success: true, data: { _id: articleId } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update article',
    };
  }
}

// ---------------------------------------------------------------------------
// Delete article
// ---------------------------------------------------------------------------

export async function deleteArticle(articleId: string): Promise<ActionResult> {
  const { id: clerkUserId, role } = await requireAuthor();

  if (!hasRole(role, 'editor')) {
    return {
      success: false,
      error: 'Only editors can delete articles. Authors may submit a removal request.',
    };
  }

  const rl = await checkRateLimit(clerkUserId);
  if (!rl.allowed)
    return { success: false, error: `Rate limit exceeded. Retry in ${rl.retryAfter}s.` };

  const { canEdit } = await verifyArticleAccess(clerkUserId, articleId);
  if (!canEdit) {
    return { success: false, error: 'You do not have permission to delete this article.' };
  }

  await writeClient.delete(articleId);
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Request article removal (author action)
// ---------------------------------------------------------------------------

export async function requestArticleDeletion(
  articleId: string,
  reason: string
): Promise<ActionResult> {
  const { id: clerkUserId } = await requireAuthor();

  const trimmedReason = reason.trim();
  if (trimmedReason.length < 10) {
    return { success: false, error: 'Please provide a reason (at least 10 characters).' };
  }
  if (trimmedReason.length > 1000) {
    return { success: false, error: 'Reason must be 1000 characters or fewer.' };
  }

  const { canEdit, isEditorPlus } = await verifyArticleAccess(clerkUserId, articleId);
  if (!canEdit) {
    return {
      success: false,
      error: 'You do not have permission to request removal of this article.',
    };
  }
  if (isEditorPlus) {
    return { success: false, error: 'Editors can delete articles directly.' };
  }

  const article = await writeClient.fetch<{ publishedAt?: string; authorName?: string } | null>(
    `*[_type == "article" && _id == $id][0]{ publishedAt, "authorName": author->name }`,
    { id: articleId }
  );

  let patch = writeClient.patch(articleId).set({
    deletionRequest: {
      reason: sanitizeText(trimmedReason),
      requestedAt: new Date().toISOString(),
      requestedByName: article?.authorName ?? 'Unknown',
      originalPublishedAt: article?.publishedAt ?? null,
    },
    needsReview: true,
    updatedAt: new Date().toISOString(),
  });

  if (article?.publishedAt) {
    patch = patch.unset(['publishedAt']);
  }

  await patch.commit();
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Approve deletion request (editor only) — hard deletes the article
// ---------------------------------------------------------------------------

export async function approveArticleDeletion(articleId: string): Promise<ActionResult> {
  const { role } = await requireAuthor();
  if (!hasRole(role, 'editor')) {
    return { success: false, error: 'Only editors can approve deletion requests.' };
  }
  await writeClient.delete(articleId);
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Deny deletion request (editor only) — restores article to prior state
// ---------------------------------------------------------------------------

export async function denyArticleDeletion(articleId: string): Promise<ActionResult> {
  const { role } = await requireAuthor();
  if (!hasRole(role, 'editor')) {
    return { success: false, error: 'Only editors can deny deletion requests.' };
  }

  const article = await writeClient.fetch<{
    deletionRequest?: { originalPublishedAt?: string };
  } | null>(`*[_type == "article" && _id == $id][0]{ deletionRequest }`, { id: articleId });

  let patch = writeClient
    .patch(articleId)
    .unset(['deletionRequest'])
    .set({ needsReview: false, updatedAt: new Date().toISOString() });

  if (article?.deletionRequest?.originalPublishedAt) {
    patch = patch.set({ publishedAt: article.deletionRequest.originalPublishedAt });
  }

  await patch.commit();
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Retract article (editor only) — stays published, marked as retracted
// ---------------------------------------------------------------------------

export async function retractArticle(
  articleId: string,
  data: { issuedAt: string; summary?: string; detail: string }
): Promise<ActionResult> {
  const { role } = await requireAuthor();
  if (!hasRole(role, 'editor')) {
    return { success: false, error: 'Only editors can retract articles.' };
  }

  if (!data.issuedAt || !data.detail.trim()) {
    return { success: false, error: 'Issued date and retraction statement are required.' };
  }

  await writeClient
    .patch(articleId)
    .set({
      correction: {
        type: 'retraction',
        issuedAt: data.issuedAt,
        summary: data.summary?.trim() ?? '',
        detail: data.detail.trim(),
      },
      updatedAt: new Date().toISOString(),
    })
    .commit();

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
    .set({ needsReview: true, updatedAt: new Date().toISOString() })
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

  const now = scheduledAt ?? new Date().toISOString();

  if (articleId.startsWith('drafts.')) {
    // Promote draft → published: fetch draft, createOrReplace published doc, delete draft.
    // Simply patching publishedAt on the draft document does NOT publish it in Sanity —
    // a published document (ID without "drafts." prefix) must exist for it to appear publicly.
    const publishedId = articleId.slice('drafts.'.length);

    const draft = await writeClient.getDocument(articleId);
    if (!draft) {
      return { success: false, error: 'Draft not found — it may have been deleted.' };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id: _draftId, _rev: _draftRev, ...draftFields } = draft as Record<string, unknown>;

    await writeClient.createOrReplace({
      ...draftFields,
      _id: publishedId,
      _type: 'article',
      publishedAt: now,
      needsReview: false,
      updatedAt: now,
    });

    await writeClient.delete(articleId);
  } else {
    // Already a published document — just update publishedAt and clear review flag.
    await writeClient
      .patch(articleId)
      .set({
        publishedAt: now,
        needsReview: false,
        updatedAt: now,
      })
      .commit();
  }

  return { success: true, data: undefined };
}
