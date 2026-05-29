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

  // Sorted _createdAt desc → first-seen per storyKey is the newest pitch
  const myPitchMap: Record<string, string> = {};
  for (const p of myPitches ?? []) {
    if (!myPitchMap[p.storyKey]) myPitchMap[p.storyKey] = p._id;
  }

  return { brief, myPitchMap };
}

// ---------------------------------------------------------------------------
// Fetch a story's fields from a brief (for copying to claimedPitch)
// ---------------------------------------------------------------------------

async function fetchStoryFromBrief(briefId: string, storyKey: string) {
  // Use portalClient (previewDrafts) so the story keys and content match exactly
  // what the portal UI is showing — avoids published/draft key mismatch.
  return portalClient.fetch<{
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
// Determine the correct document ID to patch for a brief.
// The portal uses previewDrafts, so story edits live in the draft. We must
// patch the draft when one exists so changes are visible immediately; fall back
// to the published doc if no draft is present.
// ---------------------------------------------------------------------------

async function getBriefPatchTarget(briefId: string): Promise<string> {
  const publishedId = briefId.replace(/^drafts\./, '');
  const draftId = `drafts.${publishedId}`;
  const draftDoc = await writeClient.getDocument(draftId);
  return draftDoc ? draftId : publishedId;
}

// ---------------------------------------------------------------------------
// Claim a story pitch — creates a claimedPitch document + updates brief
// ---------------------------------------------------------------------------

export async function claimStory(briefId: string, storyKey: string): Promise<ClaimResult> {
  if (!storyKey) {
    return {
      success: false,
      error: 'This story is missing its key — an editor must re-save the brief to fix it.',
    };
  }

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
    // Create claimedPitch snapshot — ensure every link has a _key so the
    // claimedPitch is editable in Studio (brief agent may omit _key values).
    const safeLinks = (brief.story.links ?? []).map((l) => ({
      ...l,
      _key: l._key || makeKey(),
    }));

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
      links: safeLinks,
      author: { _type: 'reference', _ref: sanityAuthorId },
      claimedAt: now,
      status: 'claimed',
    });

    // Update brief story status on the correct doc (draft if one exists)
    const patchTarget = await getBriefPatchTarget(briefId);
    await writeClient
      .patch(patchTarget)
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
  if (!storyKey) {
    return {
      success: false,
      error: 'This story is missing its key — re-save the brief to fix it.',
    };
  }

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
    const safeLinks = (brief.story.links ?? []).map((l) => ({
      ...l,
      _key: l._key || makeKey(),
    }));

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
      links: safeLinks,
      author: { _type: 'reference', _ref: targetAuthorId },
      assignedBy: editorSanityId ? { _type: 'reference', _ref: editorSanityId } : undefined,
      claimedAt: now,
      status: 'claimed',
    });

    const patchTarget = await getBriefPatchTarget(briefId);
    await writeClient
      .patch(patchTarget)
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
    // Use portalClient so we check ownership against the same doc the portal shows
    const doc = await portalClient.fetch<{
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
    const patchTarget = await getBriefPatchTarget(briefId);
    await writeClient
      .patch(patchTarget)
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
    const patchTarget = await getBriefPatchTarget(briefId);
    await writeClient
      .patch(patchTarget)
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
    const patchTarget = await getBriefPatchTarget(briefId);
    await writeClient
      .patch(patchTarget)
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
// Auto-repair null _key values on brief stories and their links.
// The beat-patrol agent sometimes omits _key fields, which prevents claiming.
// Safe to call multiple times — skips stories that already have valid keys.
// ---------------------------------------------------------------------------

export async function autoRepairBrief(briefId: string): Promise<Result> {
  try {
    await requireAuthor();

    const patchTarget = await getBriefPatchTarget(briefId);
    const doc = await writeClient.getDocument<{
      stories?: Array<{ _key?: string | null; links?: Array<{ _key?: string | null }> }>;
    }>(patchTarget);

    if (!doc?.stories?.length) return { success: true };

    const needsRepair = doc.stories.some((s) => !s._key || (s.links ?? []).some((l) => !l._key));
    if (!needsRepair) return { success: true };

    const repairedStories = doc.stories.map((s) => ({
      ...s,
      _key: s._key || makeKey(),
      links: (s.links ?? []).map((l) => ({ ...l, _key: l._key || makeKey() })),
    }));

    await writeClient.patch(patchTarget).set({ stories: repairedStories }).commit();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to repair brief.',
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
    const patchTarget = await getBriefPatchTarget(briefId);
    await writeClient
      .patch(patchTarget)
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
