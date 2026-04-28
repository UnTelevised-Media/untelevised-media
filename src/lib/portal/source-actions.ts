// src/lib/portal/source-actions.ts
// Server actions for Source document management in the Author Portal.
'use server';

import { requireAuthor } from '@/lib/auth/roles';
import { writeClient } from '@/lib/sanity/lib/write-client';
import { verifyArticleAccessForClerkUser } from './article-ownership';
import { sanitizeText } from './sanitize';
import { checkRateLimit } from './rate-limit';
import { portalClient } from './fetch';
import { queryPortalAllSources } from './queries';
import { z } from 'zod';

const sourceWriteSchema = z.object({
  label: z.string().min(1, 'Source title is required').max(300),
  type: z
    .enum(['document', 'interview', 'statement', 'data', 'media', 'onscene', 'article', 'other'])
    .optional(),
  url: z.string().url('Invalid URL').optional().nullable(),
  description: z.string().max(2000).optional(),
  isAnonymous: z.boolean().optional(),
});

export type SourceWriteInput = z.infer<typeof sourceWriteSchema>;

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

export async function createSource(
  input: SourceWriteInput
): Promise<ActionResult<{ _id: string; label: string }>> {
  const { id: clerkUserId } = await requireAuthor();

  const rl = await checkRateLimit(clerkUserId);
  if (!rl.allowed)
    return { success: false, error: `Rate limit exceeded. Retry in ${rl.retryAfter}s.` };

  const parsed = sourceWriteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  const data = {
    _type: 'source',
    label: sanitizeText(parsed.data.label),
    type: parsed.data.type,
    url: parsed.data.url ?? undefined,
    description: parsed.data.description ? sanitizeText(parsed.data.description) : undefined,
    isAnonymous: parsed.data.isAnonymous ?? false,
  };

  const created = await writeClient.create(data);
  return { success: true, data: { _id: created._id, label: parsed.data.label } };
}

export async function updateSource(
  sourceId: string,
  input: SourceWriteInput
): Promise<ActionResult> {
  const { id: clerkUserId } = await requireAuthor();

  const rl = await checkRateLimit(clerkUserId);
  if (!rl.allowed)
    return { success: false, error: `Rate limit exceeded. Retry in ${rl.retryAfter}s.` };

  const parsed = sourceWriteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  await writeClient
    .patch(sourceId)
    .set({
      label: sanitizeText(parsed.data.label),
      type: parsed.data.type,
      url: parsed.data.url ?? undefined,
      description: parsed.data.description ? sanitizeText(parsed.data.description) : undefined,
      isAnonymous: parsed.data.isAnonymous ?? false,
    })
    .commit();

  return { success: true, data: undefined };
}

export async function deleteSource(sourceId: string): Promise<ActionResult> {
  const { id: clerkUserId } = await requireAuthor();

  // Only editors+ or the author who created the source can delete it
  // (we check if any article linking this source belongs to the author)
  await verifyArticleAccessForClerkUser(clerkUserId, sourceId);

  await writeClient.delete(sourceId);
  return { success: true, data: undefined };
}

/** Fetch the sources list from Sanity — called by client components via server action. */
export async function fetchAllSources(): Promise<
  ActionResult<{ _id: string; label: string; type?: string; url?: string }[]>
> {
  await requireAuthor();
  const data =
    await portalClient.fetch<{ _id: string; label: string; type?: string; url?: string }[]>(
      queryPortalAllSources
    );
  return { success: true, data: data ?? [] };
}
