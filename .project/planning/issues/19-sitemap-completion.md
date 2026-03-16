<!-- GitHub Issue: #16 -->
## Problem

The site's `sitemap.ts` already generates dynamic pages from Sanity (articles, live events, categories, authors, policies, timelines, music content). However, every manually-created static page in `src/app/(user)/` is absent from the sitemap. Google cannot efficiently discover pages it has never seen a link to, and the sitemap is the authoritative signal of what the site considers indexable.

Missing from the current sitemap:
- `/about`, `/staff` — Editorial identity pages
- `/past-events` — Archives of live coverage
- `/timelines` — Overview listing page
- `/donate`, `/join`, `/support` — Conversion and support pages
- `/secure-contact`, `/whistleblower` — Source protection pages
- `/search` — Discovery page (noindex, but still needs explicit treatment)
- `/careers` (Issue 20) — Hiring page

Additionally, `robots.txt` needs a comprehensive review to ensure:
- Debug routes (Issue 18) are blocked or removed
- `/api/` routes are appropriately disallowed
- `/feed.xml` (Issue 12) is explicitly allowed
- Internal pages (`/privacy-settings`, `/unlock`, `/reading-list`) have `noindex` meta tags

A malformed or incomplete sitemap directly costs organic search traffic. Google's crawler prioritizes URLs it finds in the sitemap. Missing pages from the sitemap means slower discovery and weaker crawl budget allocation.

## Background & Context

- **Next.js `sitemap.ts`** returns a `MetadataRoute.Sitemap` array that Next.js serves as `/sitemap.xml`
- **Priority values** are a hint to crawlers, not a guarantee. Use `1.0` for homepage, `0.8-0.9` for major archive pages, `0.6-0.7` for secondary pages, `0.3-0.5` for utility pages
- **`changeFrequency`** tells crawlers how often to re-check. News articles: `'daily'` or `'weekly'`. Static pages: `'monthly'`
- **`lastModified`** should be set to the actual modification date. For Sanity documents, use `_updatedAt`. For static pages where you don't track modification dates, `new Date()` (current time) is acceptable — it signals "might have changed"
- **`robots.txt` vs `noindex`**: `robots.txt` `Disallow` prevents crawling but not indexing (if another site links to the page, Google can still index it from the link). `<meta name="robots" content="noindex">` prevents indexing even if the page is crawled. Use both for maximum control on truly private pages.

## Architecture

```
src/app/sitemap.ts
  ├── Static pages array (hardcoded, from app structure audit)
  ├── Dynamic Sanity pages (existing — articles, events, categories, etc.)
  ├── Tag pages (from Issue 11 queryAllTags)
  └── Returns merged array

public/robots.txt
  ├── User-agent: * Allow: /
  ├── Disallow: /studio/ /api/ /privacy-settings /reading-list /unlock
  ├── Allow: /feed.xml (explicit allowance)
  └── Sitemap: https://untelevised.media/sitemap.xml

noindex metadata (per page):
  ├── /privacy-settings → robots: { index: false, follow: false }
  ├── /search → robots: { index: false, follow: true }
  ├── /unlock → robots: { index: false, follow: false }
  └── /reading-list → robots: { index: false, follow: false }
```

## Proposed Solution

### Step 1 — Complete Static Page Audit

Full inventory of `src/app/(user)/` routes that should be in the sitemap:

| Route | Priority | changeFrequency | Notes |
|---|---|---|---|
| `/` | 1.0 | `hourly` | Homepage |
| `/about` | 0.5 | `monthly` | Editorial identity |
| `/staff` | 0.5 | `monthly` | Staff/contributor page |
| `/past-events` | 0.7 | `weekly` | Live event archives |
| `/timelines` | 0.8 | `weekly` | Timelines overview |
| `/donate` | 0.4 | `monthly` | Conversion page |
| `/join` | 0.6 | `monthly` | Membership conversion |
| `/support` | 0.3 | `monthly` | Support/FAQ |
| `/secure-contact` | 0.4 | `monthly` | Source protection |
| `/whistleblower` | 0.5 | `monthly` | Source protection |
| `/careers` | 0.6 | `monthly` | From Issue 20 |

Routes that should **NOT** be in sitemap (+ their noindex treatment):

| Route | Treatment | Reason |
|---|---|---|
| `/privacy-settings` | noindex + `Disallow` in robots.txt | User preference page |
| `/reading-list` | noindex + `Disallow` | Personal saved articles |
| `/unlock` | noindex + `Disallow` | Auth page |
| `/search` | noindex only | Useful to crawl, not index |
| `/studio/*` | `Disallow` in robots.txt | Admin panel |
| `/api/*` | `Disallow` in robots.txt | API routes |

### Step 2 — Updated `sitemap.ts`

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import { sanityFetch } from '@/lib/sanity/fetch'
import {
  queryAllArticles,
  queryAllLiveEvents,
  queryAllAuthors,
  queryAllCategories,
  queryAllTags,
  queryAllTimelines,
  queryAllPolicies,
} from '@/lib/sanity/queries'
import { tagToSlug } from '@/lib/tagUtils'

const BASE_URL = 'https://untelevised.media'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // ── Static pages ────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/staff`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/past-events`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/timelines`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/donate`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/join`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/support`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/secure-contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/whistleblower`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/careers`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // ── Dynamic Sanity pages (parallel fetch) ────────────────────────
  const [
    { data: articles },
    { data: liveEvents },
    { data: authors },
    { data: categories },
    { data: timelines },
    { data: policies },
    { data: tags },
  ] = await Promise.all([
    sanityFetch({ query: queryAllArticles, tags: ['article'] }),
    sanityFetch({ query: queryAllLiveEvents, tags: ['liveEvent'] }),
    sanityFetch({ query: queryAllAuthors, tags: ['author'] }),
    sanityFetch({ query: queryAllCategories, tags: ['category'] }),
    sanityFetch({ query: queryAllTimelines, tags: ['timeline'] }),
    sanityFetch({ query: queryAllPolicies, tags: ['policy'] }),
    sanityFetch({ query: queryAllTags, tags: ['article'] }),
  ])

  const articlePages: MetadataRoute.Sitemap = (articles ?? []).map((a: any) => ({
    url: `${BASE_URL}/articles/${a.slug.current}`,
    lastModified: new Date(a._updatedAt ?? a.publishedAt ?? now),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const liveEventPages: MetadataRoute.Sitemap = (liveEvents ?? []).map((e: any) => ({
    url: `${BASE_URL}/live-event/${e.slug.current}`,
    lastModified: new Date(e._updatedAt ?? now),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }))

  const authorPages: MetadataRoute.Sitemap = (authors ?? []).map((a: any) => ({
    url: `${BASE_URL}/author/${a.slug.current}`,
    lastModified: new Date(a._updatedAt ?? now),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((c: any) => ({
    url: `${BASE_URL}/category/${c.slug.current}`,
    lastModified: new Date(c._updatedAt ?? now),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const timelinePages: MetadataRoute.Sitemap = (timelines ?? []).map((t: any) => ({
    url: `${BASE_URL}/timelines/${t.slug.current}`,
    lastModified: new Date(t._updatedAt ?? now),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const policyPages: MetadataRoute.Sitemap = (policies ?? []).map((p: any) => ({
    url: `${BASE_URL}/policies/${p.slug.current}`,
    lastModified: new Date(p._updatedAt ?? now),
    changeFrequency: 'monthly' as const,
    priority: 0.3,
  }))

  const tagPages: MetadataRoute.Sitemap = (tags ?? []).map((tag: string) => ({
    url: `${BASE_URL}/tag/${tagToSlug(tag)}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.5,
  }))

  return [
    ...staticPages,
    ...articlePages,
    ...liveEventPages,
    ...authorPages,
    ...categoryPages,
    ...timelinePages,
    ...policyPages,
    ...tagPages,
  ]
}
```

### Step 3 — Updated `robots.txt`

```
# public/robots.txt

User-agent: *
Allow: /

# Disallow admin and system routes
Disallow: /studio/
Disallow: /api/
Disallow: /privacy-settings
Disallow: /reading-list
Disallow: /unlock

# Explicitly allow the RSS feed (in case /api/ disallow is too broad)
Allow: /feed.xml

# Sitemap location
Sitemap: https://untelevised.media/sitemap.xml
```

### Step 4 — Noindex Meta Tags on Private Pages

```typescript
// src/app/(user)/privacy-settings/page.tsx
export const metadata = {
  title: 'Privacy Settings — UnTelevised Media',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

// src/app/(user)/search/page.tsx
export const metadata = {
  title: 'Search — UnTelevised Media',
  robots: {
    index: false,
    follow: true, // Allow following links from this page
  },
}

// src/app/(user)/unlock/page.tsx (from Issue 17)
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}
```

### Step 5 — Verify Current Sitemap Coverage

Before making changes, view the current sitemap at `https://untelevised.media/sitemap.xml` and audit:
- Which static pages are missing (confirm the gap)
- Which pages are present that should not be (debug routes, private pages)
- Whether `_updatedAt` timestamps are being used correctly

## Implementation Plan

1. **Audit** — View the live sitemap; list all gaps and incorrect inclusions.
2. **Static pages** — Add all missing static page entries to `sitemap.ts` with appropriate priority and changeFrequency values.
3. **Dynamic pages** — Verify all existing dynamic page generators use `_updatedAt` for `lastModified`.
4. **Tag pages** — Add tag page generation (depends on Issue 11; add conditionally if `queryAllTags` exists).
5. **Robots.txt** — Update `public/robots.txt` with comprehensive disallows and explicit `/feed.xml` allow.
6. **Noindex** — Add `robots: { index: false }` metadata to `/privacy-settings`, `/search`, and `/unlock` pages.
7. **Validate** — Submit sitemap to Google Search Console and validate at `xml-sitemaps.com`.
8. **Submit** — Submit sitemap URL to Bing Webmaster Tools.

## Files Affected

- `src/app/sitemap.ts` — major update adding static pages, tag pages, using `_updatedAt`
- `public/robots.txt` — comprehensive disallows and allowances
- `src/app/(user)/privacy-settings/page.tsx` — add noindex metadata
- `src/app/(user)/search/page.tsx` — add noindex metadata
- `src/app/(user)/unlock/page.tsx` — add noindex metadata (from Issue 17)
- `src/lib/tagUtils.ts` — `tagToSlug` imported by sitemap (from Issue 11)

## Deliverables Checklist

### Sitemap Static Pages
- [ ] Homepage `/` added with `priority: 1.0`, `changeFrequency: 'hourly'`
- [ ] `/about` added with `priority: 0.5`, `changeFrequency: 'monthly'`
- [ ] `/staff` added with `priority: 0.5`, `changeFrequency: 'monthly'`
- [ ] `/past-events` added with `priority: 0.7`, `changeFrequency: 'weekly'`
- [ ] `/timelines` added with `priority: 0.8`, `changeFrequency: 'weekly'`
- [ ] `/donate` added with `priority: 0.4`, `changeFrequency: 'monthly'`
- [ ] `/join` added with `priority: 0.6`, `changeFrequency: 'monthly'`
- [ ] `/support` added with `priority: 0.3`, `changeFrequency: 'monthly'`
- [ ] `/secure-contact` added with `priority: 0.4`, `changeFrequency: 'monthly'`
- [ ] `/whistleblower` added with `priority: 0.5`, `changeFrequency: 'monthly'`
- [ ] `/careers` added with `priority: 0.6`, `changeFrequency: 'monthly'` (depends on Issue 20)

### Sitemap Dynamic Pages
- [ ] Articles use `a._updatedAt` for `lastModified` (not `new Date()`)
- [ ] Live events use `e._updatedAt` for `lastModified`
- [ ] Author pages included
- [ ] Category pages included
- [ ] Timeline individual pages included
- [ ] Policy pages included
- [ ] Tag pages included (depends on Issue 11)
- [ ] No debug routes in sitemap (`/timeline-debug`, `/timeline-test`, `/timeline-simple-test`)
- [ ] `/privacy-settings`, `/reading-list`, `/unlock`, `/search` NOT in sitemap
- [ ] `/feed.xml` NOT in sitemap (it's a feed, not a page)

### Robots.txt
- [ ] `User-agent: * Allow: /` at top
- [ ] `Disallow: /studio/`
- [ ] `Disallow: /api/`
- [ ] `Disallow: /privacy-settings`
- [ ] `Disallow: /reading-list`
- [ ] `Disallow: /unlock`
- [ ] `Allow: /feed.xml`
- [ ] `Sitemap: https://untelevised.media/sitemap.xml` at bottom
- [ ] Robots.txt validated at https://www.google.com/webmasters/tools/robots-testing-tool

### Noindex Tags
- [ ] `/privacy-settings` has `robots: { index: false, follow: false }`
- [ ] `/search` has `robots: { index: false, follow: true }`
- [ ] `/unlock` has `robots: { index: false, follow: false }` (when created in Issue 17)
- [ ] Verified with browser dev tools: `<meta name="robots" content="noindex">` present in rendered HTML

### Submission & Validation
- [ ] Sitemap validates at https://www.xml-sitemaps.com/validate-xml-sitemap.html
- [ ] Sitemap submitted to Google Search Console
- [ ] Sitemap submitted to Bing Webmaster Tools
- [ ] `/sitemap.xml` accessible in production browser (returns XML, not 404)
- [ ] `pnpm build` passes without TypeScript errors
- [ ] Sitemap generates in under 5 seconds (parallel Sanity fetches confirmed)
