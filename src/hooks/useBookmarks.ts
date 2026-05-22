'use client';
// src/hooks/useBookmarks.ts
// Unified bookmark hook.
// - Unauthenticated: reads/writes localStorage only.
// - Authenticated: reads/writes Sanity via Server Actions.
// - On first sign-in: migrates any localStorage entries to Sanity, then clears local storage.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  getBookmarks as getLocalBookmarks,
  addBookmark as addLocalBookmark,
  removeBookmark as removeLocalBookmark,
  clearBookmarks as clearLocalBookmarks,
  isBookmarked as isLocalBookmarked,
  type BookmarkEntry,
} from '@/lib/bookmarks/storage';
import {
  getServerBookmarks,
  addServerBookmark,
  removeServerBookmark,
  clearServerBookmarks,
  checkServerBookmarked,
  syncLocalBookmarksToServer,
} from '@/lib/bookmarks/actions';

export interface UseBookmarksReturn {
  /** All bookmarks for the current session (local or server). */
  bookmarks: BookmarkEntry[];
  /** True while the initial bookmark list is loading from the server. */
  loading: boolean;
  /** True once state is ready (post-hydration for local, post-fetch for server). */
  ready: boolean;
  /** Check if a specific slug is bookmarked. */
  isBookmarked: (slug: string) => boolean;
  /** Toggle bookmark on/off. Optimistic update included. */
  toggle: (entry: Omit<BookmarkEntry, 'bookmarkedAt'>) => Promise<void>;
  /** Remove a single bookmark by slug. */
  remove: (slug: string) => Promise<void>;
  /** Clear all bookmarks. */
  clearAll: () => Promise<void>;
}

export function useBookmarks(): UseBookmarksReturn {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  // Track whether we've already run the sign-in migration in this session
  const hasSynced = useRef(false);

  // Load bookmarks whenever auth state settles
  useEffect(() => {
    if (!clerkLoaded) return;

    async function load() {
      setLoading(true);

      if (isSignedIn) {
        // Migrate localStorage → Sanity on first sign-in (once per session)
        if (!hasSynced.current) {
          hasSynced.current = true;
          const localEntries = getLocalBookmarks();
          if (localEntries.length > 0) {
            await syncLocalBookmarksToServer(localEntries);
            clearLocalBookmarks();
          }
        }
        const serverEntries = await getServerBookmarks();
        setBookmarks(serverEntries);
      } else {
        setBookmarks(getLocalBookmarks());
      }

      setLoading(false);
      setReady(true);
    }

    load();
  }, [isSignedIn, clerkLoaded]);

  const isBookmarked = useCallback(
    (slug: string) => bookmarks.some((b) => b.slug === slug),
    [bookmarks]
  );

  const toggle = useCallback(
    async (entry: Omit<BookmarkEntry, 'bookmarkedAt'>) => {
      const alreadySaved = bookmarks.some((b) => b.slug === entry.slug);

      if (alreadySaved) {
        // Optimistic remove
        setBookmarks((prev) => prev.filter((b) => b.slug !== entry.slug));
        if (isSignedIn) {
          await removeServerBookmark(entry.slug);
        } else {
          removeLocalBookmark(entry.slug);
        }
      } else {
        const newEntry: BookmarkEntry = {
          ...entry,
          bookmarkedAt: new Date().toISOString(),
        };
        // Optimistic add
        setBookmarks((prev) => [newEntry, ...prev]);
        if (isSignedIn) {
          await addServerBookmark(entry);
        } else {
          addLocalBookmark(entry);
        }
      }
    },
    [bookmarks, isSignedIn]
  );

  const remove = useCallback(
    async (slug: string) => {
      setBookmarks((prev) => prev.filter((b) => b.slug !== slug));
      if (isSignedIn) {
        await removeServerBookmark(slug);
      } else {
        removeLocalBookmark(slug);
      }
    },
    [isSignedIn]
  );

  const clearAll = useCallback(async () => {
    setBookmarks([]);
    if (isSignedIn) {
      await clearServerBookmarks();
    } else {
      clearLocalBookmarks();
    }
  }, [isSignedIn]);

  return { bookmarks, loading, ready, isBookmarked, toggle, remove, clearAll };
}
