// src/lib/portal/author-actions.ts
// Server actions for admin-only author profile management.
// All writes use the server-only writeClient and require admin role.
'use server';

import { requireAdmin, requireAuthor } from '@/lib/auth/roles';
import { writeClient } from '@/lib/sanity/lib/write-client';
import { sanitizeText } from './sanitize';
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

// ---------------------------------------------------------------------------
// Update own author profile
// ---------------------------------------------------------------------------

export interface AuthorProfileInput {
  name: string;
  title?: string;
  bioText?: string;
  location?: string;
  email?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
  website?: string;
  credentials?: string[];
  expertise?: string[];
  sameAs?: string[];
  imageRef?: string; // new Sanity image asset _id, if avatar was changed
  imageAlt?: string;
}

function makeKey() {
  return Math.random().toString(36).slice(2, 10);
}

export async function updateMyProfile(
  data: AuthorProfileInput
): Promise<{ success: true } | { success: false; error: string }> {
  const { id: clerkUserId } = await requireAuthor();
  const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);

  if (!sanityAuthorId) {
    return {
      success: false,
      error: 'No author profile is linked to your account. Contact an admin.',
    };
  }

  if (!data.name?.trim()) {
    return { success: false, error: 'Name is required.' };
  }

  const patch: Record<string, unknown> = {
    name: sanitizeText(data.name),
    title: data.title ? sanitizeText(data.title) : '',
    location: data.location ? sanitizeText(data.location) : '',
    email: data.email ? sanitizeText(data.email) : '',
    twitter: data.twitter ? sanitizeText(data.twitter) : '',
    instagram: data.instagram ? sanitizeText(data.instagram) : '',
    facebook: data.facebook ? sanitizeText(data.facebook) : '',
    tiktok: data.tiktok ? sanitizeText(data.tiktok) : '',
    youtube: data.youtube ? sanitizeText(data.youtube) : '',
    linkedin: data.linkedin ? sanitizeText(data.linkedin) : '',
    website: data.website ? sanitizeText(data.website) : '',
    credentials: data.credentials?.map(sanitizeText).filter(Boolean) ?? [],
    expertise: data.expertise?.map(sanitizeText).filter(Boolean) ?? [],
    sameAs: data.sameAs?.filter(Boolean) ?? [],
  };

  // Convert plain text bio to portable text blocks
  const bioText = data.bioText?.trim();
  if (bioText) {
    patch.bio = bioText
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((para) => ({
        _type: 'block',
        _key: makeKey(),
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: makeKey(), text: para, marks: [] }],
      }));
  }

  // Only update avatar when a new asset was uploaded
  if (data.imageRef) {
    patch.image = {
      _type: 'image',
      asset: { _type: 'reference', _ref: data.imageRef },
      alt: sanitizeText(data.imageAlt ?? data.name),
    };
  }

  try {
    await writeClient.patch(sanityAuthorId).set(patch).commit();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save profile.',
    };
  }
}
