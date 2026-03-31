// src/lib/portal/article-ownership.ts
// Shared ownership verification utility used by multiple portal server actions.
import { hasRole, getRoleFromMeta } from '@/lib/auth/roles-utils';
import { writeClient } from '@/lib/sanity/lib/write-client';
import { getSanityAuthorIdForCurrentUser } from './author-actions';
import { clerkClient } from '@clerk/nextjs/server';

export async function verifyArticleAccessForClerkUser(
  clerkUserId: string,
  _resourceId: string
): Promise<{ canEdit: boolean; isEditorPlus: boolean }> {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  const meta = (user.publicMetadata ?? {}) as Record<string, unknown>;
  const role = getRoleFromMeta(meta);
  const isEditorPlus = hasRole(role, 'editor');
  if (isEditorPlus) return { canEdit: true, isEditorPlus: true };

  const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);
  if (!sanityAuthorId) return { canEdit: false, isEditorPlus: false };

  // For source deletion: allow if author has any article referencing this source
  const linked = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "article" && author._ref == $authorId && references($sourceId)][0]{ _id }`,
    { authorId: sanityAuthorId, sourceId: _resourceId }
  );

  return { canEdit: !!linked, isEditorPlus: false };
}
