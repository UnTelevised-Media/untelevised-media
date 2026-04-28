// src/lib/portal/brief-actions.ts
// Server actions for story pitch interactions within a news brief.
'use server';

import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { writeClient } from '@/lib/sanity/lib/write-client';
import { portalClient } from '@/lib/portal/fetch';
import { queryPortalBriefById, queryPortalMyPitchesForBrief } from '@/lib/portal/queries';
import { getSanityAuthorIdForCurrentUser } from './author-actions';

type Result = { success: true } | { success: false; error: string };
type ClaimResult = { success: true; pitchId: string } | { success: false; error: string };

function makeKey() {
  return Math.random().toString(36).slice(2, 10);
}

// ---------------------------------------------------------------------------
// Fetch a full brief by ID for client-side navigation
// ---------------------------------------------------------------------------

export async function fetchBriefById(briefId: string) {
  const { id: clerkUserId } = await requireAuthor();
  const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);

  const [brief, myPitches] = await Promise.all([
    portalClient.fetch(queryPortalBriefById, { briefId }),
    sanityAuthorId
      ? portalClient.fetch<Array<{ _id: string; storyKey: string }>>(
          queryPortalMyPitchesForBrief,
          { authorId: sanityAuthorId, briefId }
        )
      : Promise.resolve([]),
  ]);

  const myPitchMap: Record<string, string> = {};
  for (const p of myPitches ?? []) {
    myPitchMap[p.storyKey] = p._id;
  }

  return { brief, myPitchMap };
}

// ---------------------------------------------------------------------------
// Fetch a story's fields from a brief (for copying to claimedPitch)
// ---------------------------------------------------------------------------

async function fetchStoryFromBrief(briefId: string, storyKey: string) {
  return writeClient.fetch<{
    title: string;
    story: {
      headline?: string;
      angle?: string;
      beat?: string;
      urgency?: string;
      sourceSuggestions?: string;
      links?: Array<{ _key: string; label?: string; url?: string }>;
      claimedBy?: { _ref: string };
    } | null;
  }>(
    `*[_type == "brief" && _id == $briefId][0]{
      title,
      "story": stories[_key == $storyKey][0]{
        headline, angle, beat, urgency, sourceSuggestions,
        links[]{ _key, label, url },
        claimedBy{ _ref }
      }
    }`,
    { briefId, storyKey }
  );
}

// ---------------------------------------------------------------------------
// Claim a story pitch — creates a claimedPitch document + updates brief
// ---------------------------------------------------------------------------

export async function claimStory(briefId: string, storyKey: string): Promise<ClaimResult> {
  const { id: clerkUserId } = await requireAuthor();
  const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);
  if (!sanityAuthorId) {
    return { success: false, error: 'No author profile linked to your account.' };
  }

  const brief = await fetchStoryFromBrief(briefId, storyKey);
  if (!brief?.story) {
    return { success: false, error: 'Story pitch not found in brief.' };
  }

  const now = new Date().toISOString();

  try {
    // Create claimedPitch snapshot
    const pitch = await writeClient.create({
      _type: 'claimedPitch',
      briefId,
      briefTitle: brief.title,
      storyKey,
      headline: brief.story.headline,
      angle: brief.story.angle,
      beat: brief.story.beat,
      urgency: brief.story.urgency,
      sourceSuggestions: brief.story.sourceSuggestions,
      links: brief.story.links ?? [],
      author: { _type: 'reference', _ref: sanityAuthorId },
      claimedAt: now,
      status: 'claimed',
    });

    // Update brief story status
    await writeClient
      .patch(briefId)
      .set({
        [`stories[_key == "${storyKey}"].status`]: 'claimed',
        [`stories[_key == "${storyKey}"].claimedBy`]: { _type: 'reference', _ref: sanityAuthorId },
        [`stories[_key == "${storyKey}"].claimedAt`]: now,
      })
      .commit();

    return { success: true, pitchId: pitch._id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to claim story.',
    };
  }
}

// ---------------------------------------------------------------------------
// Assign a story to an author (editor+ only) — creates claimedPitch
// ---------------------------------------------------------------------------

export async function assignStory(
  briefId: string,
  storyKey: string,
  targetAuthorId: string
): Promise<ClaimResult> {
  const { id: clerkUserId, role } = await requireAuthor();
  if (!hasRole(role, 'editor')) {
    return { success: false, error: 'Editor role required to assign stories.' };
  }

  const editorSanityId = await getSanityAuthorIdForCurrentUser(clerkUserId);
  const brief = await fetchStoryFromBrief(briefId, storyKey);
  if (!brief?.story) {
    return { success: false, error: 'Story pitch not found in brief.' };
  }

  const now = new Date().toISOString();

  try {
    const pitch = await writeClient.create({
      _type: 'claimedPitch',
      briefId,
      briefTitle: brief.title,
      storyKey,
      headline: brief.story.headline,
      angle: brief.story.angle,
      beat: brief.story.beat,
      urgency: brief.story.urgency,
      sourceSuggestions: brief.story.sourceSuggestions,
      links: brief.story.links ?? [],
      author: { _type: 'reference', _ref: targetAuthorId },
      assignedBy: editorSanityId ? { _type: 'reference', _ref: editorSanityId } : undefined,
      claimedAt: now,
      status: 'claimed',
    });

    await writeClient
      .patch(briefId)
      .set({
        [`stories[_key == "${storyKey}"].status`]: 'claimed',
        [`stories[_key == "${storyKey}"].claimedBy`]: { _type: 'reference', _ref: targetAuthorId },
        [`stories[_key == "${storyKey}"].claimedAt`]: now,
      })
      .commit();

    return { success: true, pitchId: pitch._id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to assign story.',
    };
  }
}

// ---------------------------------------------------------------------------
// Unclaim — release story back to pool, mark claimedPitch as abandoned
// ---------------------------------------------------------------------------

export async function unclaimStory(briefId: string, storyKey: string): Promise<Result> {
  const { id: clerkUserId, role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');

  if (!isEditorPlus) {
    const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);
    const doc = await writeClient.fetch<{
      stories: Array<{ _key: string; claimedBy?: { _ref: string } }>;
    }>(`*[_type == "brief" && _id == $id][0]{ stories[]{ _key, claimedBy{ _ref } } }`, {
      id: briefId,
    });
    const story = doc?.stories?.find((s) => s._key === storyKey);
    if (story?.claimedBy?._ref !== sanityAuthorId) {
      return { success: false, error: 'You can only release your own stories.' };
    }
  }

  try {
    await writeClient
      .patch(briefId)
      .set({ [`stories[_key == "${storyKey}"].status`]: 'unclaimed' })
      .unset([
        `stories[_key == "${storyKey}"].claimedBy`,
        `stories[_key == "${storyKey}"].claimedAt`,
      ])
      .commit();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to release story.',
    };
  }
}

// ---------------------------------------------------------------------------
// Mark in progress
// ---------------------------------------------------------------------------

export async function markStoryInProgress(briefId: string, storyKey: string): Promise<Result> {
  try {
    await requireAuthor();
    await writeClient
      .patch(briefId)
      .set({ [`stories[_key == "${storyKey}"].status`]: 'in_progress' })
      .commit();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update story.',
    };
  }
}

// ---------------------------------------------------------------------------
// Pass — per-user, hides story from this author's view, story stays claimable
// ---------------------------------------------------------------------------

export async function passOnStory(briefId: string, storyKey: string): Promise<Result> {
  const { id: clerkUserId } = await requireAuthor();
  const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);
  if (!sanityAuthorId) {
    return { success: false, error: 'No author profile linked to your account.' };
  }

  try {
    await writeClient
      .patch(briefId)
      .setIfMissing({ storyPasses: [] })
      .append('storyPasses', [
        {
          _key: makeKey(),
          storyKey,
          author: { _type: 'reference', _ref: sanityAuthorId },
          passedAt: new Date().toISOString(),
        },
      ])
      .commit();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to pass on story.',
    };
  }
}

// ---------------------------------------------------------------------------
// 2nd Thought — undo a pass, story reappears in this author's view
// ---------------------------------------------------------------------------

export async function unpassStory(briefId: string, storyKey: string): Promise<Result> {
  const { id: clerkUserId } = await requireAuthor();
  const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);
  if (!sanityAuthorId) {
    return { success: false, error: 'No author profile linked to your account.' };
  }

  try {
    await writeClient
      .patch(briefId)
      .unset([`storyPasses[storyKey == "${storyKey}" && author._ref == "${sanityAuthorId}"]`])
      .commit();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to restore story.',
    };
  }
}
