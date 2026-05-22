// src/lib/portal/pitch-actions.ts
// Server actions for claimedPitch notes.
'use server';

import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { writeClient } from '@/lib/sanity/lib/write-client';
import { getSanityAuthorIdForCurrentUser } from './author-actions';

type Result = { success: true } | { success: false; error: string };

interface LinkItem {
  _key: string;
  label?: string;
  url?: string;
}

/** Convert a plain-text string to a minimal Portable Text blocks array. */
function textToBlocks(text: string) {
  return text.split('\n').map((line, i) => ({
    _type: 'block',
    _key: `note-${i}`,
    style: 'normal',
    markDefs: [] as unknown[],
    children: [{ _type: 'span', _key: `span-${i}`, text: line, marks: [] as unknown[] }],
  }));
}

/**
 * Update editable pitch fields: angle, sourceSuggestions, links, linkedArticle.
 * Author must own the pitch; editors can edit any pitch.
 */
export async function updatePitchDetails(
  pitchId: string,
  data: {
    headline?: string;
    angle: string;
    sourceSuggestions: string;
    links: LinkItem[];
    linkedArticleId: string | null;
  }
): Promise<Result> {
  const { id: clerkUserId, role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');

  if (!isEditorPlus) {
    const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);
    const pitch = await writeClient.fetch<{ authorRef: string } | null>(
      `*[_type == "claimedPitch" && _id == $id][0]{ "authorRef": author._ref }`,
      { id: pitchId }
    );
    if (!pitch || pitch.authorRef !== sanityAuthorId) {
      return { success: false, error: 'You can only edit your own pitches.' };
    }
  }

  try {
    const setFields: Record<string, unknown> = {
      angle: data.angle,
      sourceSuggestions: data.sourceSuggestions,
      links: data.links,
    };
    if (data.headline !== undefined) setFields.headline = data.headline;

    let patch = writeClient.patch(pitchId).set(setFields);

    if (data.linkedArticleId) {
      patch = patch.set({
        linkedArticle: { _type: 'reference', _ref: data.linkedArticleId },
      });
    } else {
      patch = patch.unset(['linkedArticle']);
    }

    await patch.commit();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update pitch.',
    };
  }
}

/**
 * Save working notes on a claimedPitch.
 * Author must own the pitch; editors can edit any pitch.
 */
export async function savePitchNotes(pitchId: string, notesText: string): Promise<Result> {
  const { id: clerkUserId, role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');

  if (!isEditorPlus) {
    const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);
    const pitch = await writeClient.fetch<{ authorRef: string } | null>(
      `*[_type == "claimedPitch" && _id == $id][0]{ "authorRef": author._ref }`,
      { id: pitchId }
    );
    if (!pitch || pitch.authorRef !== sanityAuthorId) {
      return { success: false, error: 'You can only edit your own pitch notes.' };
    }
  }

  try {
    const blocks = notesText.trim() ? textToBlocks(notesText) : [];
    await writeClient.patch(pitchId).set({ notes: blocks }).commit();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save notes.' };
  }
}
