'use client';
// src/hooks/useWishlist.ts
// Unified wishlist hook — mirrors useBookmarks.ts.
// - Unauthenticated: reads/writes localStorage only.
// - Authenticated: reads/writes Sanity via Server Actions.
// - On first sign-in: migrates localStorage entries to Sanity then clears local.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  getWishlist as getLocalWishlist,
  addToWishlist as addLocalWishlist,
  removeFromWishlist as removeLocalWishlist,
  clearWishlist as clearLocalWishlist,
  type WishlistEntry,
} from '@/lib/wishlist/storage';
import {
  getServerWishlist,
  addServerWishlistEntry,
  removeServerWishlistEntry,
  clearServerWishlist,
  syncLocalWishlistToServer,
} from '@/lib/wishlist/actions';

export interface UseWishlistReturn {
  wishlist: WishlistEntry[];
  loading: boolean;
  ready: boolean;
  isWishlisted: (slug: string) => boolean;
  toggle: (entry: Omit<WishlistEntry, 'addedAt'>) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export function useWishlist(): UseWishlistReturn {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const [wishlist, setWishlist] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!clerkLoaded) return;

    async function load() {
      setLoading(true);

      if (isSignedIn) {
        if (!hasSynced.current) {
          hasSynced.current = true;
          const localEntries = getLocalWishlist();
          if (localEntries.length > 0) {
            await syncLocalWishlistToServer(localEntries);
            clearLocalWishlist();
          }
        }
        const serverEntries = await getServerWishlist();
        setWishlist(serverEntries);
      } else {
        setWishlist(getLocalWishlist());
      }

      setLoading(false);
      setReady(true);
    }

    load();
  }, [isSignedIn, clerkLoaded]);

  const isWishlisted = useCallback(
    (slug: string) => wishlist.some((e) => e.slug === slug),
    [wishlist]
  );

  const toggle = useCallback(
    async (entry: Omit<WishlistEntry, 'addedAt'>) => {
      const alreadySaved = wishlist.some((e) => e.slug === entry.slug);

      if (alreadySaved) {
        // Optimistic remove
        setWishlist((prev) => prev.filter((e) => e.slug !== entry.slug));
        try {
          if (isSignedIn) {
            await removeServerWishlistEntry(entry.slug);
          } else {
            removeLocalWishlist(entry.slug);
          }
        } catch (err) {
          // Revert optimistic remove on failure
          console.error('[useWishlist] remove failed:', err);
          setWishlist((prev) => [...prev, { ...entry, addedAt: new Date().toISOString() }]);
        }
      } else {
        const newEntry: WishlistEntry = { ...entry, addedAt: new Date().toISOString() };
        // Optimistic add
        setWishlist((prev) => [newEntry, ...prev]);
        try {
          if (isSignedIn) {
            await addServerWishlistEntry(entry);
          } else {
            addLocalWishlist(entry);
          }
        } catch (err) {
          // Revert optimistic add on failure
          console.error('[useWishlist] add failed:', err);
          setWishlist((prev) => prev.filter((e) => e.slug !== entry.slug));
        }
      }
    },
    [wishlist, isSignedIn]
  );

  const remove = useCallback(
    async (slug: string) => {
      setWishlist((prev) => prev.filter((e) => e.slug !== slug));
      if (isSignedIn) {
        await removeServerWishlistEntry(slug);
      } else {
        removeLocalWishlist(slug);
      }
    },
    [isSignedIn]
  );

  const clearAll = useCallback(async () => {
    setWishlist([]);
    if (isSignedIn) {
      await clearServerWishlist();
    } else {
      clearLocalWishlist();
    }
  }, [isSignedIn]);

  return { wishlist, loading, ready, isWishlisted, toggle, remove, clearAll };
}
