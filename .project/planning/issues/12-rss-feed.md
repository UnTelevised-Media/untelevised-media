<!-- GitHub Issue: #9 -->
## Problem

UnTelevised Media has no RSS feed. This is a significant distribution gap for any news outlet. RSS is not a legacy technology — it is the primary subscription mechanism used by:

- News aggregators: Feedly, Inoreader, NewsBlur, The Old Reader
- Platforms: Apple News, Google News, Flipboard, Pocket
- Podcast clients that also aggregate written news: Overcast, Castro
- Power readers: journalists, researchers, activists who follow independent media closely via RSS
- Automated republication and link-sharing pipelines that many small outlets rely on for amplification

Without an RSS feed, UnTelevised Media is invisible to this entire distribution layer. Worse, Google News and Apple News both require an RSS feed as part of their publisher onboarding. These platforms can drive thousands of new readers per month to an independent outlet. A missing RSS feed is costing reach daily.

The fix is low-effort. A Next.js Route Handler that generates RFC-compliant RSS 2.0 XML takes approximately 1–2 hours to implement correctly.

## Background & Context

- Next.js 15 App Router supports Route Handlers (`route.ts`) that can return arbitrary Response objects including XML
- The site's `sanityFetch` utility with ISR tags is already in place — no new data fetching infrastructure needed
- The existing `queryAllArticles` GROQ query returns all necessary fields
- `@sanity/image-url` (`urlForImage`) already resolves Sanity image URLs for use in `<media:content>`
- RFC 2822 date format (required by RSS 2.0) can be generated from a standard JS Date object via `.toUTCString()`

## Architecture

```
GET /feed.xml
  └── src/app/feed.xml/route.ts
        ├── sanityFetch({ query: queryRSSFeed, tags: ['article'] })
        │     └── Returns: title, slug, description, publishedAt,
        │                  mainImage, author.name, categories[0].title
        ├── generateRSSXML(articles) → string
        │     └── Builds RSS 2.0 XML with <channel> + <item> per article
        └── Response('...xml...', {
              headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
              }
            })

Root Layout <head>
  └── <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
        (allows browsers and feed readers to auto-discover the feed)

Optional Per-Category Feeds
  └── GET /feed/[category].xml
        └── src/app/feed/[category]/route.ts (future enhancement)
```

## Proposed Solution

### Step 1 — Dedicated RSS Query

Add a dedicated query that returns exactly the fields needed for RSS (avoid over-fetching):

```typescript
// src/lib/sanity/queries.ts — add:

export const queryRSSFeed = groq`
  *[_type == "article"] | order(publishedAt desc) [0...50] {
    _id,
    title,
    "slug": slug.current,
    description,
    publishedAt,
    mainImage {
      asset->,
      alt
    },
    "author": author-> {
      name,
      "email": email
    },
    "category": categories[0]-> {
      title
    }
  }
`
```

### Step 2 — RSS Generation Helper

```typescript
// src/lib/rssUtils.ts

import { urlForImage } from '@/lib/sanity/image'

const BASE_URL = 'https://untelevised.media'

interface RSSArticle {
  _id: string
  title: string
  slug: string
  description?: string
  publishedAt: string
  mainImage?: {
    asset: { url?: string; _ref?: string }
    alt?: string
  }
  author?: { name: string; email?: string }
  category?: { title: string }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toRFC2822(dateStr: string): string {
  return new Date(dateStr).toUTCString()
}

function buildItem(article: RSSArticle): string {
  const url = `${BASE_URL}/articles/${article.slug}`
  const imageUrl = article.mainImage?.asset
    ? urlForImage(article.mainImage).width(1200).url()
    : null
  const authorStr = article.author?.email
    ? `${article.author.email} (${article.author.name})`
    : article.author?.name ?? 'UnTelevised Media'

  return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRFC2822(article.publishedAt)}</pubDate>
      <description><![CDATA[${article.description ?? ''}]]></description>
      <author>${escapeXml(authorStr)}</author>
      ${article.category ? `<category><![CDATA[${article.category.title}]]></category>` : ''}
      ${imageUrl ? `<media:content url="${escapeXml(imageUrl)}" medium="image" />` : ''}
    </item>`
}

export function generateRSSXML(articles: RSSArticle[]): string {
  const lastBuildDate = new Date().toUTCString()
  const items = articles.map(buildItem).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
>
  <channel>
    <title>UnTelevised Media</title>
    <link>${BASE_URL}</link>
    <description>Unfiltered. Uncensored. Uncompromising. Independent journalism from UnTelevised Media.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <managingEditor>news@untelevised.media (UnTelevised Media)</managingEditor>
    <webMaster>tech@untelevised.media (UnTelevised Media Tech)</webMaster>
    <ttl>60</ttl>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/og-image.png</url>
      <title>UnTelevised Media</title>
      <link>${BASE_URL}</link>
      <width>144</width>
      <height>144</height>
    </image>
    ${items}
  </channel>
</rss>`
}
```

### Step 3 — Route Handler

```typescript
// src/app/feed.xml/route.ts

import { NextResponse } from 'next/server'
import { sanityFetch } from '@/lib/sanity/fetch'
import { queryRSSFeed } from '@/lib/sanity/queries'
import { generateRSSXML } from '@/lib/rssUtils'

export const dynamic = 'force-dynamic' // Always fresh on revalidation
export const revalidate = 3600 // ISR: revalidate every hour

export async function GET() {
  try {
    const { data: articles } = await sanityFetch({
      query: queryRSSFeed,
      tags: ['article'],
    })

    const xml = generateRSSXML(articles ?? [])

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('[RSS] Failed to generate feed:', error)
    return new Response('Failed to generate RSS feed', { status: 500 })
  }
}
```

### Step 4 — Auto-Discovery Link Tags

Add RSS auto-discovery to the user-facing layout `<head>`. This allows browsers (the address bar RSS icon in Firefox), browser extensions, and feed readers to detect the feed automatically when visiting the site.

```typescript
// src/app/(user)/layout.tsx — inside <head> metadata or directly:

// Option A: Via Next.js metadata (preferred):
// In the layout's exported metadata object:
export const metadata: Metadata = {
  // ... existing metadata ...
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/feed.xml', title: 'UnTelevised Media RSS Feed' },
      ],
    },
  },
}

// Option B: Direct <link> tag in layout JSX:
<head>
  <link
    rel="alternate"
    type="application/rss+xml"
    title="UnTelevised Media"
    href="/feed.xml"
  />
</head>
```

### Step 5 — Robots.txt Update

Ensure `/feed.xml` is explicitly allowed and not accidentally blocked by any wildcard `Disallow` rules:

```
# public/robots.txt
User-agent: *
Allow: /feed.xml
# ... other rules
```

### Step 6 — Publisher Submissions (Post-Launch Tasks)

After the feed is live and validated:
1. **Google News Publisher Center** — https://publishercenter.google.com → Add publication → Submit RSS feed URL
2. **Apple News** — https://www.icloud.com/newspublisher → Requires Apple ID and editorial review
3. **Flipboard** — https://flipboard.com/partner → Magazine creation + RSS import
4. **Feedly Source Suggestions** — https://feedly.com/i/discover (organic; add enough content and readers will subscribe)

## Implementation Plan

1. **Query** — Add `queryRSSFeed` to `src/lib/sanity/queries.ts` with `[0...50]` slice and all required projections.
2. **Utility** — Create `src/lib/rssUtils.ts` with `generateRSSXML` and `buildItem` helpers. Include XML escaping and RFC 2822 date formatting.
3. **Route Handler** — Create `src/app/feed.xml/route.ts` that fetches articles, generates XML, and returns it with correct Content-Type and cache headers.
4. **Auto-discovery** — Add `alternates.types` to the user layout `metadata` export, or add `<link rel="alternate">` directly in the layout JSX.
5. **Robots.txt** — Verify `public/robots.txt` explicitly allows `/feed.xml`.
6. **Validation** — Test feed at https://validator.w3.org/feed/ and confirm all items parse correctly.
7. **Build** — Run `pnpm build` to confirm no errors. Test `GET /feed.xml` locally.

## Files Affected

- `src/app/feed.xml/route.ts` — new Route Handler
- `src/lib/rssUtils.ts` — new RSS XML generation utility
- `src/lib/sanity/queries.ts` — add `queryRSSFeed`
- `src/app/(user)/layout.tsx` — add RSS auto-discovery link metadata
- `public/robots.txt` — verify `/feed.xml` is allowed

## Deliverables Checklist

### RSS Query
- [ ] `queryRSSFeed` added to `src/lib/sanity/queries.ts`
- [ ] Query uses `[0...50]` slice (latest 50 articles)
- [ ] Query projects: `title`, `slug.current`, `description`, `publishedAt`, `mainImage.asset`, `author.name`, `categories[0].title`
- [ ] Query is ordered by `publishedAt desc`

### RSS Utility
- [ ] `src/lib/rssUtils.ts` created
- [ ] `generateRSSXML(articles)` returns valid RSS 2.0 string
- [ ] `<channel>` includes: `<title>`, `<link>`, `<description>`, `<language>`, `<lastBuildDate>`, `<atom:link rel="self">`, `<image>`
- [ ] Each `<item>` includes: `<title>` (CDATA), `<link>`, `<guid isPermaLink="true">`, `<pubDate>` (RFC 2822), `<description>` (CDATA), `<author>`, `<category>` (when available)
- [ ] `<media:content>` element included when article has a `mainImage`
- [ ] All user-generated strings wrapped in CDATA or XML-escaped to prevent malformed XML
- [ ] `urlForImage` used to resolve Sanity image asset URLs
- [ ] `toRFC2822` converts ISO 8601 `publishedAt` to RFC 2822 format

### Route Handler
- [ ] `src/app/feed.xml/route.ts` created
- [ ] `GET` handler fetches articles via `sanityFetch`
- [ ] Returns `Response` with `Content-Type: application/xml; charset=utf-8`
- [ ] Returns `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`
- [ ] Error handling: returns 500 with plain text message if fetch fails
- [ ] `revalidate = 3600` export for ISR cache

### Auto-Discovery
- [ ] RSS `<link>` auto-discovery present in `<head>` of user layout
- [ ] `rel="alternate"`, `type="application/rss+xml"`, `title="UnTelevised Media"`, `href="/feed.xml"` all present
- [ ] Verified with browser developer tools that the `<link>` tag appears in rendered HTML

### Robots & Crawlability
- [ ] `public/robots.txt` has `Allow: /feed.xml` (or no blanket Disallow that would block it)
- [ ] `/feed.xml` is NOT in the sitemap (it's a feed, not an indexable page)

### Validation & QA
- [ ] Feed validates at https://validator.w3.org/feed/ with zero errors
- [ ] Feed viewed in Firefox (shows native RSS preview) or Feedly (parses correctly)
- [ ] All articles appear in correct date order (newest first)
- [ ] Images appear in feed reader thumbnails (via `media:content`)
- [ ] `pubDate` is valid RFC 2822 format for all items
- [ ] Feed URL: `https://untelevised.media/feed.xml` accessible in production

### Post-Deploy
- [ ] Feed submitted to Google News Publisher Center
- [ ] Feed submitted to Flipboard
- [ ] Feed URL documented in site footer or `/about` page
- [ ] `pnpm build` passes without TypeScript errors
