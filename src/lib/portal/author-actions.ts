// src/lib/portal/author-actions.ts
// Server actions for admin-only author profile management.
// All writes use the server-only writeClient and require admin role.
'use server';

import { requireAdmin } from '@/lib/auth/roles';
import { writeClient } from '@/lib/sanity/lib/write-client';
import { z } from 'zod';

const linkSchema = z.object({
  sanityAuthorId: z.string().min(1),
  clerkUserId: z.string().min(1),
});

/**
 * Link a Clerk user ID to a Sanity author document.
 * Admin-only: clerkId is never writable via public API or by the author themselves.
 */
export async function linkClerkIdToAuthor(
  sanityAuthorId: string,
  clerkUserId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Unauthorized — admin role required' };
  }

  const parsed = linkSchema.safeParse({ sanityAuthorId, clerkUserId });
  if (!parsed.success) {
    return { success: false, error: 'Invalid arguments' };
  }

  await writeClient
    .patch(parsed.data.sanityAuthorId)
    .set({ clerkId: parsed.data.clerkUserId })
    .commit();

  return { success: true };
}

/**
 * Resolve the Sanity author document ID for the currently signed-in Clerk user.
 * Returns null if no author profile is linked to this Clerk ID.
 * clerkId is excluded from the result object — the projection only returns the Sanity _id.
 */
export async function getSanityAuthorIdForCurrentUser(
  clerkUserId: string
): Promise<string | null> {
  const result = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "author" && clerkId == $clerkId][0]{ _id }`,
    { clerkId: clerkUserId }
  );
  return result?._id ?? null;
}
