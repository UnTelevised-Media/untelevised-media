// src/lib/bookmarks/storage.ts
// Pure localStorage bookmark utilities — no backend, no auth, no cookies.

export interface BookmarkEntry {
  slug: string;
  title: string;
  description?: string;
  imageUrl?: string;
  authorName?: string;
  publishedAt?: string;
  readingTime?: string;
  bookmarkedAt: string; // ISO 8601
}

const STORAGE_KEY = 'untele_bookmarks';

function read(): BookmarkEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BookmarkEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: BookmarkEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage unavailable (private mode quota exceeded, etc.) — fail silently
  }
}

export function getBookmarks(): BookmarkEntry[] {
  return read();
}

export function isBookmarked(slug: string): boolean {
  return read().some((b) => b.slug === slug);
}

export function addBookmark(entry: Omit<BookmarkEntry, 'bookmarkedAt'>): BookmarkEntry[] {
  const entries = read().filter((b) => b.slug !== entry.slug); // dedupe
  const next: BookmarkEntry[] = [{ ...entry, bookmarkedAt: new Date().toISOString() }, ...entries];
  write(next);
  return next;
}

export function removeBookmark(slug: string): BookmarkEntry[] {
  const next = read().filter((b) => b.slug !== slug);
  write(next);
  return next;
}

export function clearBookmarks(): void {
  write([]);
}
