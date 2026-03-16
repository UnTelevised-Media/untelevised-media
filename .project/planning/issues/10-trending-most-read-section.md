<!-- GitHub Issue: #22 -->

## Problem

UnTelevised Media has no mechanism to surface its most popular content to readers. Every major news outlet — from local independents to large national publications — features a "Most Read" or "Trending Now" section because it solves a real discovery problem: readers don't know what they're missing, and popular content is popular for a reason. Without a view counter and trending section, the site's best-performing articles are invisible to new visitors who land on the homepage or an article page and see only the most recent content.

Trending sections also extend session time. A reader who finishes an article and sees "5 other readers are reading this" or a numbered list of the week's top stories has a clear, low-friction path to more content. For an independent outlet that depends on engaged readership to grow its audience, this is a retention tool that costs nothing to show but can meaningfully increase pages-per-session.

The view counter itself also provides editorial intelligence: the Sanity Studio can show which stories are resonating with readers, informing future coverage decisions. The `viewCount` field is hidden from content editors (it's managed by the API, not editorial staff) but visible to admins via Sanity's GROQ-based data tools.

## Background & Context

The implementation stores `viewCount` as a hidden integer field on the Sanity `article` document. This means trending data lives in the same Sanity dataset as the content, is included in the existing `sanityFetch` ISR pattern, and requires no additional database. The trade-off is that Sanity mutations are slightly slower than writing to a dedicated time-series store (like Redis or Vercel KV), but for the traffic scale of an independent news outlet this is entirely acceptable.

Rate limiting is implemented in two layers: client-side via `sessionStorage` (prevents re-pings on every navigation to the same article within a session) and server-side via a simple in-memory cache keyed by `IP + slug` with a 24-hour expiry. Note: in-memory caching on Vercel is not persistent across function invocations, so server-side rate limiting is best-effort only. For a production upgrade, replace with `@vercel/kv` or Upstash Redis.

The `queryMostReadArticles` GROQ query uses `| order(viewCount desc)` which requires no special Sanity index for small datasets. The `TrendingSection` component on the homepage should be placed in the sidebar or as a numbered list section, styled as a compact ranked list (not full article cards) to keep the homepage clean.

The `ViewPing` component must be a `'use client'` component that fires a `POST /api/view` request once per session per article using `sessionStorage` to track which slugs have already been pinged.

## Architecture

```
Article Page Load:
┌─────────────────────────────────────────────┐
│  Article Page (Server Component)            │
│  └── <ViewPing slug={article.slug.current}> │
│        (Client Component)                   │
│        │                                    │
│        └── useEffect on mount               │
│              ├── Check sessionStorage:      │
│              │   'viewed_[slug]' exists?    │
│              │   → skip (already counted)   │
│              └── Not seen this session?     │
│                  → POST /api/view           │
│                  → Set sessionStorage key   │
└─────────────────────────────────────────────┘

/api/view POST handler:
┌────────────────────────────────────────────────────────────┐
│ 1. Parse { slug } from request body                        │
│ 2. Check in-memory rate limit cache: IP+slug seen < 24h?   │
│    → Return 200 { skipped: true } (silent, no retries)     │
│ 3. Update rate limit cache                                 │
│ 4. Sanity client mutation:                                 │
│    client.patch(articleId)                                 │
│      .setIfMissing({ viewCount: 0 })                       │
│      .inc({ viewCount: 1 })                                │
│      .commit({ visibility: 'async' })                      │
│ 5. Return 200 { success: true }                            │
└────────────────────────────────────────────────────────────┘

Homepage / Article Sidebar:
┌──────────────────────────────────────────────┐
│  TrendingSection (Server Component)          │
│  └── sanityFetch(queryMostReadArticles)      │
│        GROQ: *[_type == "article"]           │
│              | order(viewCount desc) [0...10]│
│        Renders numbered list (1–10)          │
│        Title + author + publish date         │
└──────────────────────────────────────────────┘
```

## Proposed Solution

### Step 1 — Add `viewCount` to the Sanity article schema

```typescript
// src/lib/sanity/schemas/article.ts
// Add to the fields array:

import { defineField } from 'sanity';

// Inside the fields array:
defineField({
  name: 'viewCount',
  title: 'View Count',
  type: 'number',
  description: 'Managed automatically by the view tracking API. Do not edit manually.',
  hidden: true,         // Hidden from Studio content editors
  readOnly: true,       // Read-only in Studio (admins can still see via Vision/GROQ)
  initialValue: 0,
  validation: (Rule) => Rule.min(0).integer(),
}),
```

### Step 2 — Add GROQ queries for trending content

```typescript
// src/lib/sanity/queries.ts

export const queryMostReadArticles = groq`
  *[_type == "article" && defined(slug.current) && defined(viewCount)]
  | order(viewCount desc) [0...10] {
    _id,
    title,
    slug,
    description,
    publishedAt,
    viewCount,
    mainImage,
    "author": author->{ name, slug },
    "categories": categories[]->{ title, slug },
  }
`;

// For category-specific trending (used on category pages):
export const queryMostReadByCategory = groq`
  *[
    _type == "article" &&
    defined(slug.current) &&
    defined(viewCount) &&
    $categorySlug in categories[]->slug.current
  ] | order(viewCount desc) [0...5] {
    _id,
    title,
    slug,
    publishedAt,
    viewCount,
    "author": author->{ name },
  }
`;
```

### Step 3 — Create the view tracking API route

```typescript
// src/app/api/view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Best-effort in-memory rate limit (resets on cold start — acceptable for MVP)
// Key: "ip:slug", Value: timestamp of last view
const rateLimitCache = new Map<string, number>();
const RATE_LIMIT_MS = 24 * 60 * 60 * 1000; // 24 hours

function isRateLimited(ip: string, slug: string): boolean {
  const key = `${ip}:${slug}`;
  const lastSeen = rateLimitCache.get(key);
  if (!lastSeen) return false;
  return Date.now() - lastSeen < RATE_LIMIT_MS;
}

function recordView(ip: string, slug: string): void {
  const key = `${ip}:${slug}`;
  rateLimitCache.set(key, Date.now());
  // Cleanup old entries to prevent unbounded memory growth
  if (rateLimitCache.size > 10000) {
    const cutoff = Date.now() - RATE_LIMIT_MS;
    for (const [k, v] of rateLimitCache.entries()) {
      if (v < cutoff) rateLimitCache.delete(k);
    }
  }
}

export async function POST(request: NextRequest) {
  let body: { slug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { slug } = body;
  if (!slug || typeof slug !== 'string' || slug.length > 200) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  // Sanitize slug (only allow URL-safe characters)
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (isRateLimited(ip, slug)) {
    return NextResponse.json({ skipped: true, reason: 'rate_limited' }, { status: 200 });
  }

  // Look up article _id from slug
  const article = await sanityClient.fetch<{ _id: string } | null>(
    `*[_type == "article" && slug.current == $slug][0]{ _id }`,
    { slug }
  );

  if (!article?._id) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  // Increment viewCount atomically
  await sanityClient
    .patch(article._id)
    .setIfMissing({ viewCount: 0 })
    .inc({ viewCount: 1 })
    .commit({ visibility: 'async' }); // async commit — don't block the response

  recordView(ip, slug);

  return NextResponse.json({ success: true });
}
```

### Step 4 — Build the ViewPing client component

```typescript
// src/components/post/ViewPing.tsx
'use client';

import { useEffect } from 'react';

interface ViewPingProps {
  slug: string;
}

export default function ViewPing({ slug }: ViewPingProps) {
  useEffect(() => {
    if (!slug) return;

    const storageKey = `viewed_${slug}`;

    // Only ping once per browser session per article
    if (sessionStorage.getItem(storageKey)) return;

    sessionStorage.setItem(storageKey, '1');

    fetch('/api/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {
      // Silently fail — view tracking is non-critical
    });
  }, [slug]);

  // Renders nothing — purely side-effect component
  return null;
}
```

### Step 5 — Build the TrendingSection component

```typescript
// src/components/homepage/TrendingSection.tsx
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity/fetch';
import { queryMostReadArticles } from '@/lib/sanity/queries';
import { formatDate } from '@/lib/utils';

interface TrendingArticle {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  viewCount: number;
  author: { name: string; slug: { current: string } } | null;
}

export default async function TrendingSection() {
  const articles = await sanityFetch<TrendingArticle[]>({
    query: queryMostReadArticles,
    tags: ['article'],
    // Revalidate every 30 minutes — trending doesn't need real-time updates
    revalidate: 1800,
  });

  if (!articles || articles.length === 0) return null;

  return (
    <section className="space-y-0" aria-label="Trending articles">
      <div className="bg-untele px-4 py-2 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-white" aria-hidden="true" />
        <h2 className="text-xs font-black uppercase tracking-widest text-white">
          Most Read
        </h2>
      </div>
      <ol className="border border-border divide-y divide-border">
        {articles.slice(0, 10).map((article, index) => (
          <li key={article._id} className="group">
            <Link
              href={`/articles/${article.slug.current}`}
              className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors"
            >
              <span className="text-2xl font-black text-muted-foreground/30 leading-none w-7 shrink-0 tabular-nums">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-sm font-black uppercase tracking-wide leading-tight group-hover:text-untele transition-colors line-clamp-3">
                  {article.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
                  {article.author?.name && <span>{article.author.name}</span>}
                  {article.publishedAt && (
                    <span>{formatDate(article.publishedAt)}</span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

### Step 6 — Integrate ViewPing and TrendingSection into pages

```typescript
// src/app/(user)/articles/[slug]/page.tsx
// Add imports:
import ViewPing from '@/components/post/ViewPing';
import TrendingSection from '@/components/homepage/TrendingSection';

// Inside the page JSX, add ViewPing early (fires as soon as component mounts):
<ViewPing slug={article.slug.current} />

// In the sidebar (desktop) or after article body (mobile):
<aside className="hidden lg:block w-80 shrink-0 space-y-8">
  <TrendingSection />
  {/* ... other sidebar content (ads, etc.) */}
</aside>
```

```typescript
// src/app/(user)/page.tsx (homepage)
// Add import:
import TrendingSection from '@/components/homepage/TrendingSection';

// Add to homepage layout (sidebar or dedicated section):
<section className="mt-12">
  <TrendingSection />
</section>
```

### Step 7 — Ensure SANITY_API_TOKEN has write permission

```bash
# .env.example — add/verify:
SANITY_API_TOKEN=     # Needs write permission for view counter mutations
                      # Create at manage.sanity.io → API → Tokens → Add API token
                      # Role: Editor (allows mutations to existing documents)
```

## Implementation Plan

1. Add `viewCount` field to `src/lib/sanity/schemas/article.ts`
2. Add `queryMostReadArticles` and `queryMostReadByCategory` to `src/lib/sanity/queries.ts`
3. Verify `SANITY_API_TOKEN` has write (Editor) permissions in Sanity Manage
4. Create `src/app/api/view/route.ts` with rate limiting and Sanity patch mutation
5. Create `src/components/post/ViewPing.tsx` client component
6. Create `src/components/homepage/TrendingSection.tsx` server component
7. Add `<ViewPing>` to article detail page
8. Add `<TrendingSection>` to homepage and article sidebar
9. Deploy to Vercel and verify view counts increment in Sanity dataset
10. QA: rate limiting, sessionStorage deduplication, trending order, revalidation

## Files Affected

- `src/lib/sanity/schemas/article.ts` — add `viewCount` number field (hidden, readOnly, initialValue: 0)
- `src/lib/sanity/queries.ts` — add `queryMostReadArticles` and `queryMostReadByCategory`
- `src/app/api/view/route.ts` — new: POST handler with rate limiting and Sanity increment mutation
- `src/components/post/ViewPing.tsx` — new: client component firing once-per-session view ping
- `src/components/homepage/TrendingSection.tsx` — new: numbered list of most-read articles
- `src/app/(user)/page.tsx` — add `<TrendingSection>` to homepage layout
- `src/app/(user)/articles/[slug]/page.tsx` — add `<ViewPing>` and sidebar `<TrendingSection>`
- `.env.example` — note that `SANITY_API_TOKEN` requires write (Editor) role

## Deliverables Checklist

### Sanity Schema
- [ ] `viewCount` number field added to article schema
- [ ] Field has `hidden: true` (not visible to content editors in Studio)
- [ ] Field has `readOnly: true` in Studio
- [ ] Field has `initialValue: 0`
- [ ] Field has validation: `Rule.min(0).integer()`
- [ ] Field description explains it is API-managed

### GROQ Queries
- [ ] `queryMostReadArticles` added to `queries.ts`
- [ ] Query orders by `viewCount desc` and returns top 10
- [ ] Query includes: title, slug, description, publishedAt, viewCount, mainImage, author
- [ ] `queryMostReadByCategory` added for category page use
- [ ] Both queries use `defined(viewCount)` filter to exclude articles with no views

### API Route: /api/view
- [ ] `src/app/api/view/route.ts` created
- [ ] Only accepts POST requests
- [ ] Validates `slug` is a non-empty string ≤ 200 chars
- [ ] Validates slug format with regex (only `[a-z0-9-]`)
- [ ] Extracts client IP from `x-forwarded-for` or `x-real-ip` headers
- [ ] In-memory rate limit: 1 view per IP per slug per 24 hours
- [ ] Rate limit cache cleanup on size > 10,000 entries
- [ ] Looks up article `_id` from slug (not stored in request to prevent spoofing)
- [ ] Uses `.setIfMissing({ viewCount: 0 }).inc({ viewCount: 1 })` for atomic increment
- [ ] Uses `{ visibility: 'async' }` in `.commit()` for non-blocking response
- [ ] Returns 200 with `{ skipped: true }` for rate-limited requests (not 429, to avoid client retries)
- [ ] Returns 200 with `{ success: true }` for successful increments

### ViewPing Component
- [ ] `src/components/post/ViewPing.tsx` created as `'use client'` component
- [ ] Fires only once per session per article (sessionStorage check)
- [ ] sessionStorage key pattern: `viewed_[slug]`
- [ ] Uses `fetch()` with `POST /api/view` and JSON body
- [ ] Errors silently (`.catch(() => {})`) — non-critical tracking
- [ ] Renders `null` — no visible output
- [ ] `useEffect` dependency array contains only `[slug]`

### TrendingSection Component
- [ ] `src/components/homepage/TrendingSection.tsx` created as async server component
- [ ] Uses `sanityFetch` with `queryMostReadArticles` and `tags: ['article']`
- [ ] Uses `revalidate: 1800` (30 minutes) for trending data
- [ ] Returns `null` if no articles (graceful empty state)
- [ ] Renders numbered list (1–N) with large faded rank numbers
- [ ] Each item links to `/articles/[slug]`
- [ ] Shows article title, author, and publish date
- [ ] `bg-untele` header bar with TrendingUp icon and white uppercase text
- [ ] `hover:text-untele` on article title links
- [ ] `line-clamp-3` on article titles
- [ ] No border-radius (sharp news aesthetic)

### Page Integration
- [ ] `<ViewPing>` added to article detail page
- [ ] `<TrendingSection>` added to homepage
- [ ] `<TrendingSection>` added to article page sidebar (desktop: `hidden lg:block`)
- [ ] `<TrendingSection>` added to article page below content (mobile fallback)

### Environment & Config
- [ ] `SANITY_API_TOKEN` confirmed to have Editor/write role in Sanity Manage
- [ ] `.env.example` notes the required write permission for the token

### QA
- [ ] Visiting an article increments its `viewCount` in Sanity (verify via Sanity Vision GROQ)
- [ ] Second visit to same article in same session does NOT increment (sessionStorage working)
- [ ] New session (cleared sessionStorage) DOES increment
- [ ] TrendingSection on homepage shows articles ordered by viewCount
- [ ] TrendingSection revalidates within ~30 minutes of new view activity
- [ ] Rate limit prevents the same IP from inflating count within 24 hours
- [ ] API route returns 200 (not 500) if Sanity API token is missing (should fail gracefully)
- [ ] ViewPing does not cause hydration errors
- [ ] TrendingSection renders correctly with 0 articles (returns null, no broken layout)
