'use server';
// src/lib/bookmarks/actions.ts
// Server Actions for Sanity-backed bookmark CRUD (authenticated users only).
// All functions validate Clerk session before touching Sanity.

import { auth } from '@clerk/nextjs/server';
import { writeClient } from '@/lib/sanity/lib/write-client';
import { client } from '@/lib/sanity/lib/client';
import type { BookmarkEntry } from './storage';

// Unique Sanity document _id per user+slug combination
function bookmarkDocId(userId: string, slug: string): string {
  // Sanity _id must be URL-safe; replace any non-alphanumeric chars
  const safeUserId = userId.replace(/[^a-zA-Z0-9]/g, '_');
  const safeSlug = slug.replace(/[^a-zA-Z0-9]/g, '_');
  return `userBookmark_${safeUserId}_${safeSlug}`;
}

/** Fetch all bookmarks for the currently authenticated user, newest first. */
export async function getServerBookmarks(): Promise<BookmarkEntry[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const docs = await client.fetch<
    Array<{
      slug: string;
      title: string;
      description?: string;
      imageUrl?: string;
      authorName?: string;
      publishedAt?: string;
      readingTime?: string;
      bookmarkedAt: string;
    }>
  >(
    `*[_type == "userBookmark" && clerkUserId == $userId] | order(bookmarkedAt desc) {
      slug, title, description, imageUrl, authorName, publishedAt, readingTime, bookmarkedAt
    }`,
    { userId },
    { cache: 'no-store' }
  );

  return docs;
}

/** Check if a slug is bookmarked for the current user. */
export async function checkServerBookmarked(slug: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const count = await client.fetch<number>(
    `count(*[_type == "userBookmark" && clerkUserId == $userId && slug == $slug])`,
    { userId, slug },
    { cache: 'no-store' }
  );
  return count > 0;
}

/** Add a bookmark for the current user (upsert by _id). */
export async function addServerBookmark(
  entry: Omit<BookmarkEntry, 'bookmarkedAt'>
): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  const docId = bookmarkDocId(userId, entry.slug);
  await writeClient.createOrReplace({
    _type: 'userBookmark',
    _id: docId,
    clerkUserId: userId,
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    imageUrl: entry.imageUrl,
    authorName: entry.authorName,
    publishedAt: entry.publishedAt,
    readingTime: entry.readingTime,
    bookmarkedAt: new Date().toISOString(),
  });
}

/** Remove a bookmark for the current user. */
export async function removeServerBookmark(slug: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  const docId = bookmarkDocId(userId, slug);
  await writeClient.delete(docId);
}

/** Remove all bookmarks for the current user. */
export async function clearServerBookmarks(): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  await writeClient.delete({
    query: `*[_type == "userBookmark" && clerkUserId == $userId]`,
    params: { userId },
  });
}

/**
 * Sync localStorage bookmarks into Sanity on sign-in.
 * Upserts each entry (preserving its original bookmarkedAt timestamp).
 * Call this once after a user signs in.
 */
export async function syncLocalBookmarksToServer(entries: BookmarkEntry[]): Promise<void> {
  const { userId } = await auth();
  if (!userId || entries.length === 0) return;

  const transaction = writeClient.transaction();

  for (const entry of entries) {
    const docId = bookmarkDocId(userId, entry.slug);
    transaction.createIfNotExists({
      _type: 'userBookmark',
      _id: docId,
      clerkUserId: userId,
      slug: entry.slug,
      title: entry.title,
      description: entry.description,
      imageUrl: entry.imageUrl,
      authorName: entry.authorName,
      publishedAt: entry.publishedAt,
      readingTime: entry.readingTime,
      bookmarkedAt: entry.bookmarkedAt,
    });
  }

  await transaction.commit();
}
