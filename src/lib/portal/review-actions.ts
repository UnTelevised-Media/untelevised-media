'use server';
// src/lib/portal/review-actions.ts
// Server Actions for admin moderation of book reviews.

import { auth } from '@clerk/nextjs/server';
import { writeClient } from '@/lib/sanity/lib/write-client';
import { hasRole } from '@/lib/auth/roles-utils';
import { requireAuthor } from '@/lib/auth/roles';

async function requireEditor() {
  const { role } = await requireAuthor();
  if (!hasRole(role, 'editor')) throw new Error('Unauthorized');
}

export async function approveReview(reviewId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireEditor();
    await writeClient
      .patch(reviewId)
      .set({ status: 'approved', approved: true, adminFeedback: '' })
      .commit();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to approve review' };
  }
}

export async function declineReview(reviewId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireEditor();
    await writeClient.patch(reviewId).set({ status: 'declined', approved: false }).commit();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to decline review' };
  }
}

export async function sendReviewFeedback(
  reviewId: string,
  feedback: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireEditor();
    if (!feedback.trim()) return { ok: false, error: 'Feedback message is required' };
    await writeClient
      .patch(reviewId)
      .set({ status: 'needs_revision', approved: false, adminFeedback: feedback.trim() })
      .commit();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to send feedback' };
  }
}
