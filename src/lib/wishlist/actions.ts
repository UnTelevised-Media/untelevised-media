'use server';
// src/lib/wishlist/actions.ts
// Server Actions for Sanity-backed wishlist CRUD (authenticated users only).
// Mirrors src/lib/bookmarks/actions.ts.

import { auth } from '@clerk/nextjs/server';
import { writeClient } from '@/lib/sanity/lib/write-client';
import { client } from '@/lib/sanity/lib/client';
import type { WishlistEntry } from './storage';

function wishlistDocId(userId: string, slug: string): string {
  const safeUserId = userId.replace(/[^a-zA-Z0-9]/g, '_');
  const safeSlug = slug.replace(/[^a-zA-Z0-9]/g, '_');
  return `userWishlist_${safeUserId}_${safeSlug}`;
}

export async function getServerWishlist(): Promise<WishlistEntry[]> {
  const { userId } = await auth();
  if (!userId) return [];

  return client.fetch<WishlistEntry[]>(
    `*[_type == "userWishlist" && clerkUserId == $userId] | order(addedAt desc) {
      slug, title, coverImageUrl, authorName, price, addedAt
    }`,
    { userId },
    { cache: 'no-store' }
  );
}

export async function addServerWishlistEntry(
  entry: Omit<WishlistEntry, 'addedAt'>
): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  const docId = wishlistDocId(userId, entry.slug);
  await writeClient.createOrReplace({
    _type: 'userWishlist',
    _id: docId,
    clerkUserId: userId,
    slug: entry.slug,
    title: entry.title,
    coverImageUrl: entry.coverImageUrl,
    authorName: entry.authorName,
    price: entry.price,
    addedAt: new Date().toISOString(),
  });
}

export async function removeServerWishlistEntry(slug: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  const docId = wishlistDocId(userId, slug);
  await writeClient.delete(docId);
}

export async function clearServerWishlist(): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  await writeClient.delete({
    query: `*[_type == "userWishlist" && clerkUserId == $userId]`,
    params: { userId },
  });
}

export async function syncLocalWishlistToServer(entries: WishlistEntry[]): Promise<void> {
  const { userId } = await auth();
  if (!userId || entries.length === 0) return;

  const transaction = writeClient.transaction();

  for (const entry of entries) {
    const docId = wishlistDocId(userId, entry.slug);
    transaction.createIfNotExists({
      _type: 'userWishlist',
      _id: docId,
      clerkUserId: userId,
      slug: entry.slug,
      title: entry.title,
      coverImageUrl: entry.coverImageUrl,
      authorName: entry.authorName,
      price: entry.price,
      addedAt: entry.addedAt,
    });
  }

  await transaction.commit();
}
