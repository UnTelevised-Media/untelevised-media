<!-- GitHub Issue: #19 -->

## Problem

Readers who discover UnTelevised Media articles through social shares, search results, or the live ticker have no way to save content for later reading within the platform. They are forced to rely on browser bookmarks, external read-later apps like Pocket or Instapaper, or simply lose track of the article entirely. This is a missed engagement opportunity: readers who save an article signal intent to return, and a native reading list page gives them a reason to come back directly to untelevised.live rather than through a third-party app.

For an independent journalism outlet competing for reader loyalty, small quality-of-life features like bookmarking communicate that the platform respects readers' time and treats them as regulars worth building for. This feature requires zero backend infrastructure — it is entirely client-side localStorage — meaning it can be shipped quickly without adding server costs, rate-limiting concerns, or authentication dependencies.

The absence of a save-for-later mechanism also means the site has no way to surface its depth of content library to returning readers. A reading list page that shows previously saved articles gives editors a passive way to drive re-engagement with older but still-relevant investigative pieces and long-form content.

## Background & Context

The implementation is intentionally client-side only (localStorage) with no backend required. This means bookmarks are device-specific and do not sync across browsers or devices — a known trade-off accepted for MVP. The `BookmarkButton` must be a `'use client'` component and must defer localStorage access to after mount (via `useEffect`) to avoid Next.js hydration errors, since the server has no access to localStorage.

Article metadata (title, description, image URL, author, publishedAt) is stored at the time of bookmarking so the reading list page can render instantly without a Sanity fetch. The trade-off is that stored data can go stale if an article's title or image is updated in Sanity after it was bookmarked — this is acceptable for MVP. The `savedAt` ISO timestamp allows the reading list to sort by most recently saved.

The `lucide-react` package is already installed. Use `Bookmark` (unfilled) and `BookmarkCheck` (filled) icons for the toggle states. The brand accent color `text-untele` should be applied to the filled/saved state.

## Architecture

```
Article Page (Server Component)
│
└── <BookmarkButton> (Client Component)
      │
      ├── useEffect → reads localStorage on mount → sets isSaved state
      ├── onClick → toggles localStorage entry → updates isSaved state
      └── Renders Bookmark / BookmarkCheck icon with tooltip

localStorage key: 'untele_bookmarks'
Value: JSON array of BookmarkedArticle objects
[
  {
    slug: "article-slug",
    title: "Article Title",
    description: "Short description...",
    imageUrl: "https://cdn.sanity.io/...",
    publishedAt: "2024-01-15T10:00:00Z",
    author: "Jane Reporter",
    savedAt: "2024-03-01T14:32:00Z"
  },
  ...
]

/reading-list (Client Page)
│
└── useEffect → reads 'untele_bookmarks' from localStorage
      │
      ├── Renders article cards from stored metadata (no Sanity fetch)
      ├── Remove button on each card → updates localStorage + state
      ├── "Clear All" button → wipes localStorage key + clears state
      └── Empty state → friendly message + CTA to homepage
```

## Proposed Solution

### Step 1 — Define the bookmark interface and localStorage utility

```typescript
// src/lib/bookmarks.ts

export interface BookmarkedArticle {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  publishedAt: string; // ISO date string
  author: string;
  savedAt: string;     // ISO date string — when the user saved it
}

const STORAGE_KEY = 'untele_bookmarks';

function safeGetBookmarks(): BookmarkedArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeSetBookmarks(bookmarks: BookmarkedArticle[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // localStorage may be unavailable (private browsing, storage quota)
  }
}

export function getBookmarks(): BookmarkedArticle[] {
  return safeGetBookmarks();
}

export function addBookmark(article: BookmarkedArticle): void {
  const current = safeGetBookmarks();
  const exists = current.some((b) => b.slug === article.slug);
  if (!exists) {
    safeSetBookmarks([{ ...article, savedAt: new Date().toISOString() }, ...current]);
  }
}

export function removeBookmark(slug: string): void {
  const current = safeGetBookmarks();
  safeSetBookmarks(current.filter((b) => b.slug !== slug));
}

export function isBookmarked(slug: string): boolean {
  return safeGetBookmarks().some((b) => b.slug === slug);
}

export function clearBookmarks(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
```

### Step 2 — Build the BookmarkButton client component

```typescript
// src/components/post/BookmarkButton.tsx
'use client';

import { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { addBookmark, removeBookmark, isBookmarked, BookmarkedArticle } from '@/lib/bookmarks';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  article: Omit<BookmarkedArticle, 'savedAt'>;
  className?: string;
  showLabel?: boolean;
}

export default function BookmarkButton({
  article,
  className,
  showLabel = false,
}: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(isBookmarked(article.slug));
  }, [article.slug]);

  if (!mounted) {
    // Render placeholder to avoid layout shift
    return (
      <button
        aria-label="Save for later"
        className={cn('p-2 opacity-0', className)}
        disabled
      >
        <Bookmark className="h-4 w-4" />
      </button>
    );
  }

  function handleToggle() {
    if (saved) {
      removeBookmark(article.slug);
      setSaved(false);
    } else {
      addBookmark({ ...article, savedAt: new Date().toISOString() });
      setSaved(true);
    }
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={saved ? 'Remove from reading list' : 'Save for later'}
      title={saved ? 'Saved to reading list' : 'Save for later'}
      className={cn(
        'group flex items-center gap-1.5 p-2 text-muted-foreground transition-colors hover:text-untele',
        saved && 'text-untele',
        className
      )}
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4 fill-untele stroke-untele" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="text-xs font-black uppercase tracking-widest">
          {saved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
```

### Step 3 — Build the Reading List page

```typescript
// src/app/(user)/reading-list/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Trash2, X } from 'lucide-react';
import {
  getBookmarks,
  removeBookmark,
  clearBookmarks,
  BookmarkedArticle,
} from '@/lib/bookmarks';
import { formatDate } from '@/lib/utils';

export default function ReadingListPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBookmarks(getBookmarks());
  }, []);

  function handleRemove(slug: string) {
    removeBookmark(slug);
    setBookmarks((prev) => prev.filter((b) => b.slug !== slug));
  }

  function handleClearAll() {
    clearBookmarks();
    setBookmarks([]);
  }

  if (!mounted) return null;

  return (
    <main className="container mx-auto max-w-4xl px-4 py-12 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-untele p-2">
            <Bookmark className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest">
              Reading List
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              {bookmarks.length} saved {bookmarks.length === 1 ? 'article' : 'articles'}
            </p>
          </div>
        </div>
        {bookmarks.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center space-y-4">
          <Bookmark className="h-10 w-10 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <p className="font-black uppercase tracking-widest">
              No saved articles yet
            </p>
            <p className="text-sm text-muted-foreground">
              Bookmark articles to build your reading list.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block bg-untele py-3 px-6 text-xs font-black uppercase tracking-widest text-white"
          >
            Browse Articles
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((article) => (
            <article
              key={article.slug}
              className="group flex gap-4 border border-border hover:border-untele transition-colors p-4"
            >
              {article.imageUrl && (
                <div className="relative h-20 w-28 shrink-0 overflow-hidden">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <Link href={`/articles/${article.slug}`}>
                  <h2 className="font-black uppercase tracking-wide text-sm leading-tight hover:text-untele transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                </Link>
                {article.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {article.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-widest">
                  {article.author && <span>{article.author}</span>}
                  {article.publishedAt && (
                    <span>{formatDate(article.publishedAt)}</span>
                  )}
                  <span className="ml-auto">
                    Saved {formatDate(article.savedAt)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleRemove(article.slug)}
                aria-label={`Remove ${article.title} from reading list`}
                className="shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
```

### Step 4 — Integrate BookmarkButton into the article page

```typescript
// src/app/(user)/articles/[slug]/page.tsx
// Add import:
import BookmarkButton from '@/components/post/BookmarkButton';

// In the article header/meta row, add alongside share buttons:
<BookmarkButton
  article={{
    slug: article.slug.current,
    title: article.title,
    description: article.description ?? '',
    imageUrl: article.mainImage ? urlForImage(article.mainImage).url() : '',
    publishedAt: article.publishedAt ?? '',
    author: article.author?.name ?? '',
  }}
  showLabel
/>
```

### Step 5 — Add Reading List link to the navigation

```typescript
// src/components/global/Nav.tsx
// Add to nav links array:
{ href: '/reading-list', label: 'Reading List', icon: Bookmark }
```

### Step 6 — Add metadata to the reading list page

```typescript
// src/app/(user)/reading-list/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reading List | UnTelevised Media',
  description: 'Your saved articles on UnTelevised Media.',
  robots: { index: false, follow: false }, // Private page, do not index
};

export default function ReadingListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

## Implementation Plan

1. Create `src/lib/bookmarks.ts` with full localStorage utility functions
2. Build `src/components/post/BookmarkButton.tsx` client component
3. Create `src/app/(user)/reading-list/page.tsx` client page
4. Create `src/app/(user)/reading-list/layout.tsx` with noindex metadata
5. Integrate `<BookmarkButton>` into `src/app/(user)/articles/[slug]/page.tsx`
6. Optionally add Reading List link to `src/components/global/Nav.tsx`
7. Test: save/unsave toggles, reading list renders saved articles, remove individual, clear all, empty state, no hydration errors

## Files Affected

- `src/lib/bookmarks.ts` — new: localStorage utility functions and `BookmarkedArticle` interface
- `src/components/post/BookmarkButton.tsx` — new: client component with Bookmark/BookmarkCheck toggle
- `src/app/(user)/reading-list/page.tsx` — new: client page rendering saved articles from localStorage
- `src/app/(user)/reading-list/layout.tsx` — new: noindex metadata wrapper
- `src/app/(user)/articles/[slug]/page.tsx` — add `<BookmarkButton>` to article header
- `src/components/global/Nav.tsx` — optionally add Reading List nav link

## Deliverables Checklist

### Bookmark Utility Library
- [ ] `src/lib/bookmarks.ts` created with `BookmarkedArticle` interface
- [ ] `getBookmarks()` returns array from localStorage (empty array on error)
- [ ] `addBookmark()` adds article to start of array (most recent first), deduplicates by slug
- [ ] `removeBookmark()` filters out article by slug
- [ ] `isBookmarked()` returns boolean
- [ ] `clearBookmarks()` removes the storage key entirely
- [ ] All localStorage access wrapped in try/catch for private browsing / quota errors
- [ ] `savedAt` ISO timestamp set automatically in `addBookmark()`

### BookmarkButton Component
- [ ] `'use client'` directive present
- [ ] `mounted` state prevents localStorage access during SSR
- [ ] Renders `Bookmark` icon (unfilled) when not saved
- [ ] Renders `BookmarkCheck` icon (filled, untele color) when saved
- [ ] `aria-label` and `title` attributes update based on saved state
- [ ] Tooltip text: "Save for later" / "Saved to reading list"
- [ ] `showLabel` prop controls whether text label renders alongside icon
- [ ] `text-untele` / `fill-untele` applied when in saved state
- [ ] Optimistic UI: state updates immediately on click (no async delay)
- [ ] Invisible placeholder rendered pre-mount to avoid layout shift

### Reading List Page
- [ ] `'use client'` directive present
- [ ] `mounted` state prevents SSR hydration mismatch
- [ ] Reads bookmarks from localStorage on mount
- [ ] Renders article list with image, title, description, author, publish date
- [ ] Each article links to `/articles/[slug]`
- [ ] Per-article remove button (X icon) removes from list immediately
- [ ] "Clear All" button removes all bookmarks and clears the displayed list
- [ ] Empty state: icon + message + "Browse Articles" CTA button
- [ ] Saved date displayed per article ("Saved [date]")
- [ ] Article count displayed in header ("N saved articles")
- [ ] Cards use `hover:border-untele` transition (consistent with site card style)
- [ ] No border-radius on cards (sharp edges, news aesthetic)

### Article Page Integration
- [ ] `<BookmarkButton>` imported and rendered in article header
- [ ] All required article metadata (slug, title, description, imageUrl, publishedAt, author) passed as props
- [ ] `imageUrl` correctly derived from `urlForImage(article.mainImage).url()`

### Metadata & SEO
- [ ] `/reading-list` page has `robots: noindex, nofollow`
- [ ] Page title set to "Reading List | UnTelevised Media"

### Navigation
- [ ] Reading List link added to nav (or confirmed as intentionally excluded for clean nav)

### QA
- [ ] Bookmark button state persists after page refresh
- [ ] Bookmarking and unbookmarking an article updates state immediately
- [ ] No hydration errors in browser console
- [ ] Reading list page renders correctly with 0, 1, and many bookmarks
- [ ] Works in both dark and light mode
- [ ] Works in private/incognito browsing (graceful failure if localStorage blocked)
