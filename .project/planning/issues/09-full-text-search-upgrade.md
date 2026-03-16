<!-- GitHub Issue: #21 -->

## Problem

The `/search` route exists on UnTelevised Media but the underlying implementation uses basic Sanity GROQ `match` operators, which lack relevance ranking, typo tolerance, result highlighting, and faceted filtering. For a news outlet covering breaking news, investigative journalism, and live events across multiple content types, a degraded search experience directly translates to lost readers: a reader who searches "investigative" and gets no results because they spelled it "invetigative" will leave and not return.

Search is one of the highest-intent user actions on any site. Readers who use the search bar are actively seeking specific content, making them far more valuable per session than passive homepage scrollers. Upgrading search to Algolia's free tier (10,000 records, 10,000 searches/month) gives UnTelevised Media instant results, typo tolerance, hit highlighting, and faceted filtering — the standard for modern news search — without requiring a custom search backend.

The current GROQ-based search also has no faceted filtering by category, author, or date range, and no content-type filtering (articles vs. live events vs. timelines). These are standard discovery features that help readers narrow large result sets efficiently, especially as the content library grows.

## Background & Context

Algolia's free tier is sufficient for UnTelevised Media's current scale. The API key model requires careful handling: the Admin API key (for indexing) must remain server-only and never exposed in client bundles. The Search-only API key (read-only, no indexing) is safe to expose via `NEXT_PUBLIC_` environment variables. The `algoliasearch` package is the official Algolia JS client. `react-instantsearch` is Algolia's official React component library for building search UIs with minimal custom code.

Index sync must happen via a Sanity webhook triggered on document publish/unpublish. The existing `/api/revalidate` webhook demonstrates the pattern. The Algolia record for each article should include a plain-text extraction of the body (not full Portable Text JSON) for full-text search. Sanity's `pt::text()` GROQ function can extract plain text server-side, but for the webhook sync the body should be processed in the API route using `@portabletext/toolkit`'s `toPlainText` utility.

The search page must have `noindex` metadata — search result pages should never be crawled by Google.

## Architecture

```
Content Publish Flow (Sanity → Algolia):
┌─────────────┐     webhook      ┌──────────────────────────┐
│ Sanity CMS  │ ──────────────→  │ /api/algolia-sync        │
│  (publish)  │                  │  - Validate HMAC secret  │
└─────────────┘                  │  - Fetch full doc from   │
                                 │    Sanity client         │
                                 │  - Map to Algolia record │
                                 │  - articlesIndex.saveObject│
                                 └──────────────────────────┘

Search Query Flow (Client → Algolia):
┌──────────────────────────────────────────────────────────┐
│  /search page (Client Component)                         │
│                                                          │
│  InstantSearch (Algolia React)                           │
│  ├── SearchBox (debounced input, 300ms)                  │
│  ├── RefinementList (categories checkbox filter)         │
│  ├── RefinementList (authors checkbox filter)            │
│  ├── DateRangePicker (custom, filters by publishedAt)    │
│  ├── Hits (renders ArticleSearchCard per result)         │
│  │     └── Highlight component for title/description    │
│  └── Pagination                                          │
│                                                          │
│  Direct Algolia API calls (no Next.js server involved)   │
│  Uses NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY (read-only)     │
└──────────────────────────────────────────────────────────┘

Environment Variables:
┌─────────────────────────────────────────┐
│ Server-only (indexing)                  │
│   ALGOLIA_APP_ID                        │
│   ALGOLIA_ADMIN_API_KEY                 │
│                                         │
│ Client-safe (search)                    │
│   NEXT_PUBLIC_ALGOLIA_APP_ID            │
│   NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY    │
└─────────────────────────────────────────┘
```

## Proposed Solution

### Step 1 — Install dependencies

```bash
pnpm add algoliasearch react-instantsearch @portabletext/toolkit
```

### Step 2 — Create the Algolia client utility

```typescript
// src/lib/algolia.ts
// Server-side client (Admin API key — never imported in client components)

import { algoliasearch } from 'algoliasearch';

// This file must ONLY be imported in API routes and server components
// Never import in 'use client' files — would expose ALGOLIA_ADMIN_API_KEY
const adminClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_API_KEY!
);

export const articlesIndex = adminClient.initIndex('untele_articles');
export const eventsIndex = adminClient.initIndex('untele_live_events');

// Algolia record type for articles
export interface AlgoliaArticleRecord {
  objectID: string;       // article slug
  title: string;
  description: string;
  bodyText: string;       // plain text extraction of body
  author: string;
  authorSlug: string;
  categories: string[];   // category titles
  categorySlugList: string[]; // for RefinementList filtering
  publishedAt: number;    // Unix timestamp for date range filtering
  imageUrl: string;
  type: 'article';
}

export interface AlgoliaEventRecord {
  objectID: string;       // event slug
  title: string;
  description: string;
  eventDate: number;      // Unix timestamp
  type: 'live_event';
}
```

### Step 3 — Create the index sync API route

```typescript
// src/app/api/algolia-sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { toPlainText } from '@portabletext/toolkit';
import { articlesIndex, eventsIndex } from '@/lib/algolia';
import type { AlgoliaArticleRecord, AlgoliaEventRecord } from '@/lib/algolia';
import crypto from 'crypto';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

function validateWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) return true; // Skip validation in dev if secret not set
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('sanity-webhook-signature') ?? '';

  if (!validateWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    _type: string;
    _id: string;
    slug?: { current: string };
    operation: 'create' | 'update' | 'delete';
  };

  const { _type, _id, operation } = payload;

  // Handle delete operations
  if (operation === 'delete') {
    if (_type === 'article') {
      const slug = payload.slug?.current ?? _id;
      await articlesIndex.deleteObject(slug);
    }
    return NextResponse.json({ synced: true, operation: 'delete' });
  }

  // Fetch full document from Sanity
  if (_type === 'article') {
    const article = await sanityClient.fetch(
      `*[_id == $id][0]{
        title, slug, description, body,
        publishedAt,
        "mainImage": mainImage.asset->url,
        "author": author->name,
        "authorSlug": author->slug.current,
        "categories": categories[]->title,
        "categorySlugs": categories[]->slug.current,
      }`,
      { id: _id }
    );

    if (!article || !article.slug?.current) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const record: AlgoliaArticleRecord = {
      objectID: article.slug.current,
      title: article.title ?? '',
      description: article.description ?? '',
      bodyText: article.body ? toPlainText(article.body).slice(0, 10000) : '',
      author: article.author ?? '',
      authorSlug: article.authorSlug ?? '',
      categories: article.categories ?? [],
      categorySlugList: article.categorySlugs ?? [],
      publishedAt: article.publishedAt
        ? new Date(article.publishedAt).getTime() / 1000
        : 0,
      imageUrl: article.mainImage ?? '',
      type: 'article',
    };

    await articlesIndex.saveObject(record);
    return NextResponse.json({ synced: true, slug: record.objectID });
  }

  if (_type === 'liveEvent') {
    const event = await sanityClient.fetch(
      `*[_id == $id][0]{ title, slug, description, eventDate }`,
      { id: _id }
    );

    if (!event?.slug?.current) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const record: AlgoliaEventRecord = {
      objectID: event.slug.current,
      title: event.title ?? '',
      description: event.description ?? '',
      eventDate: event.eventDate
        ? new Date(event.eventDate).getTime() / 1000
        : 0,
      type: 'live_event',
    };

    await eventsIndex.saveObject(record);
    return NextResponse.json({ synced: true, slug: record.objectID });
  }

  return NextResponse.json({ skipped: true, type: _type });
}
```

### Step 4 — Create initial index population script

```typescript
// scripts/algolia-initial-index.ts
// Run once with: npx tsx scripts/algolia-initial-index.ts
// to backfill all existing articles into Algolia

import { createClient } from '@sanity/client';
import { toPlainText } from '@portabletext/toolkit';
import { algoliasearch } from 'algoliasearch';

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const algolia = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_API_KEY!
);

const index = algolia.initIndex('untele_articles');

async function run() {
  const articles = await sanity.fetch(`
    *[_type == "article" && defined(slug.current)] {
      title, slug, description, body, publishedAt,
      "mainImage": mainImage.asset->url,
      "author": author->name,
      "authorSlug": author->slug.current,
      "categories": categories[]->title,
      "categorySlugs": categories[]->slug.current,
    }
  `);

  const records = articles.map((a: any) => ({
    objectID: a.slug.current,
    title: a.title ?? '',
    description: a.description ?? '',
    bodyText: a.body ? toPlainText(a.body).slice(0, 10000) : '',
    author: a.author ?? '',
    authorSlug: a.authorSlug ?? '',
    categories: a.categories ?? [],
    categorySlugList: a.categorySlugs ?? [],
    publishedAt: a.publishedAt ? new Date(a.publishedAt).getTime() / 1000 : 0,
    imageUrl: a.mainImage ?? '',
    type: 'article',
  }));

  const { objectIDs } = await index.saveObjects(records);
  console.log(`Indexed ${objectIDs.length} articles.`);
}

run().catch(console.error);
```

### Step 5 — Build the upgraded search page

```typescript
// src/app/(user)/search/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits, RefinementList, Pagination, useInstantSearch } from 'react-instantsearch';
import { Highlight } from 'react-instantsearch';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

interface HitType {
  objectID: string;
  title: string;
  description: string;
  author: string;
  categories: string[];
  publishedAt: number;
  imageUrl: string;
  type: 'article' | 'live_event';
}

function ArticleHit({ hit }: { hit: HitType }) {
  const href = hit.type === 'article'
    ? `/articles/${hit.objectID}`
    : `/live-event/${hit.objectID}`;

  return (
    <article className="group flex gap-4 border border-border hover:border-untele transition-colors p-4">
      {hit.imageUrl && (
        <div className="relative h-20 w-28 shrink-0 overflow-hidden">
          <Image src={hit.imageUrl} alt={hit.title} fill className="object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0 space-y-1">
        <Link href={href}>
          <h2 className="font-black uppercase tracking-wide text-sm leading-tight hover:text-untele transition-colors">
            <Highlight hit={hit} attribute="title" classNames={{
              highlighted: 'bg-untele/20 text-untele',
            }} />
          </h2>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-2">
          <Highlight hit={hit} attribute="description" classNames={{
            highlighted: 'bg-untele/20 text-untele',
          }} />
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-widest">
          {hit.author && <span>{hit.author}</span>}
          {hit.publishedAt > 0 && (
            <span>{formatDate(new Date(hit.publishedAt * 1000).toISOString())}</span>
          )}
          {hit.categories?.[0] && (
            <span className="text-untele">{hit.categories[0]}</span>
          )}
        </div>
      </div>
    </article>
  );
}

function NoResults() {
  const { results } = useInstantSearch();
  if (!results?.query || results.nbHits > 0) return null;

  return (
    <div className="border border-dashed border-border py-12 text-center space-y-3">
      <Search className="h-10 w-10 text-muted-foreground mx-auto" />
      <p className="font-black uppercase tracking-widest">No results for "{results.query}"</p>
      <p className="text-sm text-muted-foreground">
        Try different keywords or remove filters.
      </p>
    </div>
  );
}

export default function SearchPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <InstantSearch searchClient={searchClient} indexName="untele_articles">
      <main className="container mx-auto max-w-6xl px-4 py-12">
        <div className="bg-untele px-4 py-3 mb-8">
          <h1 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </h1>
        </div>

        <div className="mb-6">
          <SearchBox
            placeholder="Search articles, events, topics..."
            classNames={{
              root: 'relative',
              input: 'w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-untele pr-10',
              submit: 'absolute right-3 top-1/2 -translate-y-1/2',
              reset: 'absolute right-8 top-1/2 -translate-y-1/2',
            }}
          />
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`w-64 shrink-0 space-y-6 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest border-b border-border pb-2">
                Category
              </h3>
              <RefinementList
                attribute="categories"
                classNames={{
                  list: 'space-y-1',
                  item: 'flex items-center gap-2',
                  checkbox: 'accent-untele',
                  label: 'text-xs uppercase tracking-widest cursor-pointer',
                  count: 'ml-auto text-xs text-muted-foreground',
                }}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest border-b border-border pb-2">
                Author
              </h3>
              <RefinementList
                attribute="author"
                classNames={{
                  list: 'space-y-1',
                  item: 'flex items-center gap-2',
                  checkbox: 'accent-untele',
                  label: 'text-xs uppercase tracking-widest cursor-pointer',
                  count: 'ml-auto text-xs text-muted-foreground',
                }}
              />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0 space-y-4">
            <NoResults />
            <Hits hitComponent={ArticleHit} classNames={{ list: 'space-y-3', item: 'list-none' }} />
            <div className="pt-4">
              <Pagination classNames={{
                list: 'flex items-center gap-1',
                item: 'border border-border',
                link: 'px-3 py-2 text-xs font-black uppercase tracking-widest hover:bg-untele hover:text-white transition-colors',
                selectedItem: 'bg-untele',
              }} />
            </div>
          </div>
        </div>
      </main>
    </InstantSearch>
  );
}
```

### Step 6 — Add search page metadata with noindex

```typescript
// src/app/(user)/search/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search | UnTelevised Media',
  description: 'Search UnTelevised Media articles, live events, and investigations.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

### Step 7 — Update .env.example with Algolia variables

```bash
# Algolia Search (get from Algolia dashboard → API Keys)
ALGOLIA_APP_ID=                          # Server + client
ALGOLIA_ADMIN_API_KEY=                   # Server-only! NEVER expose to client
NEXT_PUBLIC_ALGOLIA_APP_ID=              # Same as ALGOLIA_APP_ID
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=      # Read-only search key — safe for client
SANITY_WEBHOOK_SECRET=                   # Secret for validating Sanity webhook signatures
```

### Step 8 — Configure Algolia index settings (one-time setup via dashboard)

Recommended Algolia index settings for `untele_articles`:
- **Searchable attributes**: `title` (ordered 1), `description` (ordered 2), `bodyText` (ordered 3), `author`, `categories`
- **Attributes for faceting**: `categories`, `author`, `type`
- **Ranking**: Typo tolerance enabled, Custom ranking: `publishedAt` descending

## Implementation Plan

1. `pnpm add algoliasearch react-instantsearch @portabletext/toolkit`
2. Create Algolia account → create `untele_articles` and `untele_live_events` indexes
3. Configure index settings in Algolia dashboard (searchable attributes, facets, ranking)
4. Add all 4 Algolia env vars + `SANITY_WEBHOOK_SECRET` to `.env.local` and Vercel
5. Create `src/lib/algolia.ts` (server-only admin client + types)
6. Create `src/app/api/algolia-sync/route.ts` (Sanity webhook handler)
7. Configure Sanity webhook in Sanity Manage: URL = `/api/algolia-sync`, trigger on article/liveEvent publish
8. Run `scripts/algolia-initial-index.ts` once to backfill existing content
9. Build upgraded `src/app/(user)/search/page.tsx` with InstantSearch
10. Add `src/app/(user)/search/layout.tsx` with noindex metadata
11. Update `.env.example` with new variables
12. QA: test search, typo tolerance, filters, highlighting, pagination

## Files Affected

- `src/lib/algolia.ts` — new: server-only Algolia admin client and record type definitions
- `src/app/api/algolia-sync/route.ts` — new: Sanity webhook handler for index sync
- `scripts/algolia-initial-index.ts` — new: one-time backfill script for existing content
- `src/app/(user)/search/page.tsx` — major rewrite: InstantSearch UI with faceted filtering
- `src/app/(user)/search/layout.tsx` — new: noindex metadata for search pages
- `src/lib/sanity/queries.ts` — improve GROQ search query as fallback (retain for non-Algolia fallback path)
- `.env.example` — add 5 new variables (4 Algolia + 1 webhook secret)
- `package.json` / `pnpm-lock.yaml` — 3 new packages added

## Deliverables Checklist

### Algolia Account & Index Setup
- [ ] Algolia account created (free tier)
- [ ] `untele_articles` index created
- [ ] `untele_live_events` index created
- [ ] Searchable attributes configured: title, description, bodyText, author, categories
- [ ] Faceting attributes configured: categories, author, type
- [ ] Custom ranking by `publishedAt` descending configured
- [ ] Typo tolerance enabled (default on Algolia)

### Dependencies
- [ ] `algoliasearch` installed via pnpm
- [ ] `react-instantsearch` installed via pnpm
- [ ] `@portabletext/toolkit` installed via pnpm

### Server-Side: Algolia Client & Types
- [ ] `src/lib/algolia.ts` created with admin client (server-only)
- [ ] `AlgoliaArticleRecord` interface defined with all required fields
- [ ] `AlgoliaEventRecord` interface defined
- [ ] File has comment warning it is server-only and must not be imported by client components

### API Route: Index Sync
- [ ] `src/app/api/algolia-sync/route.ts` created
- [ ] HMAC signature validation implemented using `SANITY_WEBHOOK_SECRET`
- [ ] Article publish → maps to `AlgoliaArticleRecord` and saves to Algolia
- [ ] Article delete → removes record from Algolia by slug
- [ ] Live event publish/delete handled
- [ ] `toPlainText()` used for body text extraction (not raw Portable Text JSON)
- [ ] Body text truncated to 10,000 chars (Algolia record size limit)
- [ ] Sanity webhook configured in Sanity Manage pointing to `/api/algolia-sync`

### Initial Backfill
- [ ] `scripts/algolia-initial-index.ts` created
- [ ] Script successfully indexes all existing articles
- [ ] Article count logged on completion

### Environment Variables
- [ ] `ALGOLIA_APP_ID` added to Vercel (production + preview)
- [ ] `ALGOLIA_ADMIN_API_KEY` added to Vercel (server-only, not NEXT_PUBLIC_)
- [ ] `NEXT_PUBLIC_ALGOLIA_APP_ID` added to Vercel
- [ ] `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY` added to Vercel
- [ ] `SANITY_WEBHOOK_SECRET` added to Vercel
- [ ] `.env.example` updated with all 5 variables and descriptions

### Search Page UI
- [ ] Search page rebuilt as client component with InstantSearch
- [ ] `SearchBox` with placeholder text implemented
- [ ] `Hits` component renders `ArticleHit` card per result
- [ ] `Highlight` component shows matched query terms in title and description
- [ ] `RefinementList` for categories implemented
- [ ] `RefinementList` for authors implemented
- [ ] `Pagination` component implemented
- [ ] "No results" state with helpful message displayed
- [ ] Filters panel collapsible on mobile
- [ ] Cards use `hover:border-untele` transition (no border-radius)
- [ ] Search input has `focus:border-untele` styling

### Metadata & SEO
- [ ] `src/app/(user)/search/layout.tsx` created with `robots: { index: false, follow: false }`
- [ ] Search page title set correctly

### Security
- [ ] `ALGOLIA_ADMIN_API_KEY` never appears in client bundles (verify with `pnpm build`)
- [ ] `src/lib/algolia.ts` never imported by any `'use client'` component

### QA
- [ ] Searching "investigative" returns investigative articles
- [ ] Typo "invetigative" still returns correct results
- [ ] Category filter narrows results correctly
- [ ] Author filter narrows results correctly
- [ ] Highlighted terms appear in red (untele color) in search results
- [ ] Pagination works for result sets > 20
- [ ] Empty search shows all recent articles (or empty state prompt)
- [ ] Search works on mobile (responsive layout)
- [ ] No TypeScript errors in any new files
