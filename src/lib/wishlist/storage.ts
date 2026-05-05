// src/lib/wishlist/storage.ts
// Pure localStorage wishlist utilities — mirrors src/lib/bookmarks/storage.ts.

export interface WishlistEntry {
  slug: string;
  title: string;
  coverImageUrl?: string;
  authorName?: string;
  price?: number;
  addedAt: string; // ISO 8601
}

const STORAGE_KEY = 'untele_wishlist';

function read(): WishlistEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WishlistEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: WishlistEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage unavailable — fail silently
  }
}

export function getWishlist(): WishlistEntry[] {
  return read();
}

export function isWishlisted(slug: string): boolean {
  return read().some((e) => e.slug === slug);
}

export function addToWishlist(entry: Omit<WishlistEntry, 'addedAt'>): WishlistEntry[] {
  const entries = read().filter((e) => e.slug !== entry.slug);
  const next: WishlistEntry[] = [{ ...entry, addedAt: new Date().toISOString() }, ...entries];
  write(next);
  return next;
}

export function removeFromWishlist(slug: string): WishlistEntry[] {
  const next = read().filter((e) => e.slug !== slug);
  write(next);
  return next;
}

export function clearWishlist(): void {
  write([]);
}
