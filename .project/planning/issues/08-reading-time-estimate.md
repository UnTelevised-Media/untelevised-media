<!-- GitHub Issue: #20 -->

## Problem

Every article on UnTelevised Media displays no estimated reading time, breaking an expectation set by every major news and publishing platform — from Reuters to Substack to Medium. This is not a cosmetic nicety: reading time estimates measurably reduce bounce rate because readers who know an article is short are more likely to commit to it, while readers who see "12 min read" can make an informed choice to save it for later. For an independent journalism outlet publishing both quick breaking-news items and long-form investigative pieces, the gap in perceived effort between a 2-minute update and a 15-minute deep dive is entirely invisible to readers without this signal.

The fix requires a single utility function (no schema changes, no additional Sanity queries, no new dependencies) that extracts plain text from Portable Text `block` nodes, counts words, and divides by 238 (the average adult reading speed in words per minute). This is the same approach used by Medium and Substack. The result is passed to an inline display component and rendered in the article meta row and on article cards.

## Background & Context

Sanity's Portable Text format stores article body content as a structured array of typed blocks. Text content lives inside `block`-type nodes, each of which contains a `children` array of `span` objects with a `text` property. Non-text blocks (images, embeds, code blocks, custom components) must be excluded from the word count. The `@portabletext/react` package is already installed but the utility function operates on the raw Portable Text array, not the rendered output — making it a pure data transformation with no React dependency.

The `PortableTextBlock` type is available from `@portabletext/types` (already a transitive dependency via `@portabletext/react`). The function should operate as a server-side computation inside server components — article pages and card components are server components and receive the `body` field from Sanity already, so no additional data fetching is needed. The reading time can be computed inline without caching.

The display should follow the site's typography convention: `text-xs uppercase tracking-widest` with `text-muted-foreground`. It should render in the article meta row alongside the publish date and author name, separated by a dot or pipe character consistent with existing meta row formatting.

## Architecture

```
Sanity Article Document
│
└── body: PortableTextBlock[]  (already fetched in article query)
      │
      └── estimateReadingTime(body)
            │
            ├── Filter blocks where _type === 'block'
            ├── Map each block → extract span text from children
            ├── Join all text with spaces
            ├── Count words via split(/\s+/)
            ├── Divide by 238, ceil, minimum 1
            └── Returns: number (minutes)

formatReadingTime(minutes) → "3 min read"

Usage locations:
├── Article detail page  → article meta row (server component)
├── ArticleCardLg        → below excerpt (server component)
└── ArticleCard          → meta row (server component)

All usage is in server components — no useState/useEffect needed.
```

## Proposed Solution

### Step 1 — Create the reading time utility

```typescript
// src/lib/readingTime.ts

import type { PortableTextBlock } from '@portabletext/types';

const WORDS_PER_MINUTE = 238;

/**
 * Estimates reading time from a Portable Text body array.
 * Extracts text from `block` nodes only (skips images, embeds, etc).
 * Average adult reading speed: 238 words per minute.
 *
 * @returns number of minutes, minimum 1
 */
export function estimateReadingTime(body: PortableTextBlock[]): number {
  if (!body || !Array.isArray(body) || body.length === 0) return 1;

  const text = body
    .filter((block) => block._type === 'block')
    .map((block) => {
      const children = block.children as Array<{ _type: string; text?: string }> | undefined;
      if (!children) return '';
      return children
        .filter((child) => child._type === 'span' && typeof child.text === 'string')
        .map((child) => child.text ?? '')
        .join(' ');
    })
    .join(' ')
    .trim();

  if (!text) return 1;

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
  return Math.max(1, minutes);
}

/**
 * Formats a reading time in minutes to a display string.
 * Always returns at least "1 min read".
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

/**
 * Convenience: estimate and format in one call.
 */
export function getReadingTime(body: PortableTextBlock[] | null | undefined): string {
  if (!body) return '1 min read';
  return formatReadingTime(estimateReadingTime(body));
}
```

### Step 2 — Create the ReadingTime display component

```typescript
// src/components/post/ReadingTime.tsx
// A tiny presentational component for consistent rendering across contexts.

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortableTextBlock } from '@portabletext/types';
import { getReadingTime } from '@/lib/readingTime';

interface ReadingTimeProps {
  body: PortableTextBlock[] | null | undefined;
  className?: string;
  showIcon?: boolean;
}

export default function ReadingTime({
  body,
  className,
  showIcon = false,
}: ReadingTimeProps) {
  const readingTime = getReadingTime(body);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-widest',
        className
      )}
    >
      {showIcon && <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />}
      <span>{readingTime}</span>
    </span>
  );
}
```

### Step 3 — Integrate into article detail page

```typescript
// src/app/(user)/articles/[slug]/page.tsx
// Import:
import ReadingTime from '@/components/post/ReadingTime';

// In the article meta row (alongside author name and publish date):
<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground uppercase tracking-widest">
  {article.author && (
    <span>{article.author.name}</span>
  )}
  <span aria-hidden="true">·</span>
  {article.publishedAt && (
    <time dateTime={article.publishedAt}>
      {formatDate(article.publishedAt)}
    </time>
  )}
  <span aria-hidden="true">·</span>
  <ReadingTime body={article.body} showIcon />
</div>
```

### Step 4 — Integrate into ArticleCardLg

```typescript
// src/components/cards/ArticleCardLg.tsx
// Import:
import ReadingTime from '@/components/post/ReadingTime';

// Below the article excerpt/description:
{article.body && (
  <ReadingTime body={article.body} className="mt-2" />
)}
```

### Step 5 — Integrate into ArticleCard

```typescript
// src/components/cards/ArticleCards.tsx
// Import:
import ReadingTime from '@/components/post/ReadingTime';

// In the card meta row alongside publish date:
<div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
  {article.publishedAt && (
    <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
  )}
  {article.body && (
    <>
      <span aria-hidden="true">·</span>
      <ReadingTime body={article.body} />
    </>
  )}
</div>
```

### Step 6 — Ensure article cards query includes `body` field

```typescript
// src/lib/sanity/queries.ts
// Verify that article card queries include the body field.
// If body is not currently included in card queries (to keep payloads small),
// two options:
//
// Option A: Include body in card query (simpler, slightly larger payload)
// "body": body,  // in GROQ projection
//
// Option B: Add a derived readingTime field computed server-side in Sanity
// This avoids sending full body to card queries. Compute once and cache.
// Add to GROQ projection: "wordCount": length(pt::text(body)),
// Then: Math.max(1, Math.ceil(wordCount / 238)) in TypeScript.
//
// Recommendation: Use Option B for card queries to keep payloads lean:

export const queryAllArticles = groq`
  *[_type == "article"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    description,
    publishedAt,
    mainImage,
    "author": author->{ name, slug },
    "categories": categories[]->{ title, slug },
    "wordCount": length(pt::text(body)),  // <-- add this
  }
`;
```

### Step 7 — Use wordCount from GROQ for card components

```typescript
// src/components/cards/ArticleCards.tsx
// If using Option B (wordCount from GROQ instead of body):

function readingTimeFromWordCount(wordCount: number | null | undefined): string {
  if (!wordCount) return '1 min read';
  return `${Math.max(1, Math.ceil(wordCount / 238))} min read`;
}

// In render:
{article.wordCount != null && (
  <span className="text-xs text-muted-foreground uppercase tracking-widest">
    {readingTimeFromWordCount(article.wordCount)}
  </span>
)}
```

## Implementation Plan

1. Create `src/lib/readingTime.ts` with `estimateReadingTime`, `formatReadingTime`, and `getReadingTime` utilities
2. Create `src/components/post/ReadingTime.tsx` presentational component
3. Integrate `<ReadingTime body={article.body} showIcon />` into article detail page meta row
4. Decide on full-body vs wordCount GROQ approach for card queries
5. Update `queryAllArticles` (and other card-level queries) to include `"wordCount": length(pt::text(body))`
6. Integrate reading time display into `ArticleCardLg` and `ArticleCards`
7. QA: verify counts are reasonable for short (~300 word) and long (~3000 word) articles

## Files Affected

- `src/lib/readingTime.ts` — new: `estimateReadingTime`, `formatReadingTime`, `getReadingTime` utilities
- `src/components/post/ReadingTime.tsx` — new: presentational component for consistent rendering
- `src/app/(user)/articles/[slug]/page.tsx` — add `<ReadingTime>` to article meta row
- `src/components/cards/ArticleCards.tsx` — add reading time to card meta row
- `src/components/cards/ArticleCardLg.tsx` — add reading time below excerpt
- `src/lib/sanity/queries.ts` — add `"wordCount": length(pt::text(body))` to card-level GROQ projections

## Deliverables Checklist

### Utility Functions
- [ ] `src/lib/readingTime.ts` created
- [ ] `estimateReadingTime(body)` filters to `_type === 'block'` nodes only
- [ ] Extracts text from `children` spans with `_type === 'span'`
- [ ] Handles null/undefined/empty body gracefully (returns 1)
- [ ] Handles blocks with no children gracefully
- [ ] Divides word count by 238 (avg adult reading speed)
- [ ] Uses `Math.ceil` (round up, not down)
- [ ] Returns minimum of 1 (never "0 min read")
- [ ] `formatReadingTime(n)` returns `"N min read"` format
- [ ] `getReadingTime(body)` convenience wrapper works correctly

### ReadingTime Component
- [ ] `src/components/post/ReadingTime.tsx` created
- [ ] Accepts `body`, `className`, and `showIcon` props
- [ ] Applies `text-xs text-muted-foreground uppercase tracking-widest` styling
- [ ] `showIcon` prop shows Clock icon from lucide-react
- [ ] Component is a server component (no `'use client'` needed)

### Article Detail Page
- [ ] `<ReadingTime>` rendered in article meta row
- [ ] Positioned alongside author name and publish date
- [ ] Separated by `·` dot separator consistent with other meta items
- [ ] `showIcon` enabled on detail page for visual emphasis

### Article Cards
- [ ] Reading time displayed on `ArticleCardLg` below excerpt
- [ ] Reading time displayed on `ArticleCard` in meta row
- [ ] GROQ query updated to include `"wordCount": length(pt::text(body))` for efficient card queries
- [ ] `wordCount` used in card components instead of full body when applicable

### Sanity Queries
- [ ] `queryAllArticles` includes `wordCount` derived field
- [ ] Any other card-level queries updated similarly
- [ ] Full `body` field still included in article detail query for `estimateReadingTime` use

### QA
- [ ] "1 min read" shown for very short articles (under 238 words)
- [ ] Correct estimate for ~1000-word article (~4 min)
- [ ] Correct estimate for ~2500-word article (~11 min)
- [ ] Never shows "0 min read"
- [ ] Styling matches site typography: uppercase, tracking-widest, muted color
- [ ] No TypeScript errors in utility file
- [ ] No additional bundle size impact (pure computation, no new npm packages)
