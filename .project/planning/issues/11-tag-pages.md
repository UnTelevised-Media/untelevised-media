<!-- GitHub Issue: #8 -->
## Problem

UnTelevised Media currently groups content only by broad `category` (Crime, Politics, Culture, etc.). This leaves a large discovery gap: readers interested in a specific person, place, or topic — "NYPD", "Rikers Island", "Police Brutality", "Eric Adams", "housing crisis" — have no way to navigate directly to all coverage on that subject. Categories are too coarse for this level of navigation. Tags fill the gap between a site-wide search and a category browse, and they create a secondary layer of SEO-indexed pages targeting long-tail keywords that categories never cover.

Without tags, the site loses:
- Reader paths deeper into the archive ("more coverage on this topic")
- Long-tail keyword traffic from Google ("NYPD accountability reporting", "Rikers Island conditions 2024")
- The kind of organic linking structure that signals topical authority to search engines
- A mechanism for related-content surfacing that goes beyond category

## Background & Context

The site already has:
- `category` as a reference array on articles (broad grouping)
- `src/app/(user)/category/[slug]/page.tsx` — per-category listing pages (the pattern to clone for tags)
- `src/lib/sanity/queries.ts` — GROQ queries used by category pages

The tag system must be lightweight at this stage. A simple `string[]` field on the article schema is the correct MVP approach — it avoids schema overhead of a full `tag` document type while still enabling full tag page routing, GROQ filtering, and SEO metadata. If tags later need descriptions, images, or editorial annotations, promotion to a reference document type is straightforward.

## Architecture

```
Sanity Studio
  └── Article Document
        └── tags: string[]  (tag input UI, free-text with suggestions)
              └── e.g. ["nypd", "police-brutality", "eric-adams"]

GROQ Queries
  ├── queryAllTags              → array::unique(*[_type=="article"].tags[])
  └── queryArticlesByTag        → *[_type=="article" && $tag in tags]

Next.js App Router
  └── /tag/[slug]/page.tsx      → generateStaticParams + generateMetadata
        └── ArticleCard grid (same as /category/[slug])

Article Detail Page
  └── /articles/[slug]/page.tsx
        └── Tags section (below body, above sources)
              └── <Tag> → /tag/[slug]  (clickable badge)

Sitemap
  └── sitemap.ts → includes /tag/[slug] for all known tags
```

## Proposed Solution

### Step 1 — Add `tags` Field to Article Schema

In `src/lib/sanity/schemas/article.ts`, add the `tags` field after the `categories` field reference:

```typescript
// src/lib/sanity/schemas/article.ts
import { defineField, defineType } from 'sanity'

// Add inside the fields array, after categories:
defineField({
  name: 'tags',
  title: 'Tags',
  type: 'array',
  of: [{ type: 'string' }],
  options: {
    layout: 'tags', // Sanity's built-in tag chip UI
  },
  description:
    'Fine-grained topics, people, places, or events. Use lowercase with hyphens (e.g. "police-brutality", "eric-adams", "rikers-island"). These become browsable /tag/[slug] pages.',
  validation: (Rule) =>
    Rule.max(10).warning('Keep tags focused — 10 max per article.'),
}),
```

### Step 2 — Tag Normalization Utility

```typescript
// src/lib/tagUtils.ts

/**
 * Converts a raw tag string to a URL-safe slug.
 * "Police Brutality" → "police-brutality"
 * "NYPD" → "nypd"
 * "Eric Adams (Mayor)" → "eric-adams-mayor"
 */
export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-') // collapse consecutive hyphens
    .replace(/^-|-$/g, '') // strip leading/trailing hyphens
}

/**
 * Converts a URL slug back to a human-readable label.
 * "police-brutality" → "Police Brutality"
 */
export function slugToTagLabel(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Returns the canonical URL for a tag page.
 */
export function tagPageUrl(tag: string): string {
  return `/tag/${tagToSlug(tag)}`
}
```

### Step 3 — GROQ Queries

```typescript
// src/lib/sanity/queries.ts — add these exports:

// All unique tags across all published articles (for generateStaticParams)
export const queryAllTags = groq`
  array::unique(
    *[_type == "article" && defined(tags) && array::length(tags) > 0].tags[]
  )
`

// Articles matching a specific tag slug
// Note: tags are stored as human strings; we filter by normalized slug comparison
export const queryArticlesByTag = groq`
  *[
    _type == "article"
    && defined(tags)
    && $tag in tags[]
  ] | order(publishedAt desc) {
    _id,
    title,
    slug,
    description,
    publishedAt,
    mainImage {
      asset->,
      alt
    },
    "author": author-> {
      name,
      slug,
      image { asset-> }
    },
    "categories": categories[]-> {
      title,
      slug
    },
    tags
  }
`

// Tag page metadata — just the count for description
export const queryTagArticleCount = groq`
  count(*[_type == "article" && $tag in tags[]])
`
```

### Step 4 — Tag Page Route

```typescript
// src/app/(user)/tag/[slug]/page.tsx

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/lib/sanity/fetch'
import { queryAllTags, queryArticlesByTag } from '@/lib/sanity/queries'
import { slugToTagLabel, tagToSlug } from '@/lib/tagUtils'
import ArticleCard from '@/components/cards/ArticleCards'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { data: tags } = await sanityFetch<string[]>({
    query: queryAllTags,
    tags: ['article'],
  })
  return (tags ?? []).map((tag: string) => ({
    slug: tagToSlug(tag),
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const label = slugToTagLabel(slug)
  return {
    title: `${label} — UnTelevised Media`,
    description: `All UnTelevised Media coverage tagged "${label}". Independent journalism on ${label}.`,
    alternates: { canonical: `https://untelevised.media/tag/${slug}` },
    openGraph: {
      title: `${label} Coverage — UnTelevised Media`,
      description: `Independent, uncensored reporting on ${label}.`,
    },
  }
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params
  const label = slugToTagLabel(slug)

  // Tags are stored as raw strings; find which raw string normalizes to this slug
  const { data: allTags } = await sanityFetch<string[]>({
    query: queryAllTags,
    tags: ['article'],
  })

  const matchedTag = (allTags ?? []).find(
    (t: string) => tagToSlug(t) === slug
  )

  if (!matchedTag) notFound()

  const { data: articles } = await sanityFetch({
    query: queryArticlesByTag,
    params: { tag: matchedTag },
    tags: ['article'],
  })

  const baseUrl = 'https://untelevised.media'

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${label} — UnTelevised Media`,
            description: `All coverage tagged: ${label}`,
            url: `${baseUrl}/tag/${slug}`,
            publisher: {
              '@type': 'NewsMediaOrganization',
              name: 'UnTelevised Media',
              url: baseUrl,
            },
          }),
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs uppercase tracking-widest text-zinc-500">
          <a href="/" className="hover:text-untele">Home</a>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">Tags</span>
          <span className="mx-2">/</span>
          <span className="text-white">{label}</span>
        </nav>

        {/* Header */}
        <div className="mb-8 border-b border-zinc-700 pb-6">
          <div className="mb-2 inline-block bg-untele px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
            Tag
          </div>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-tight text-white">
            {label}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {articles?.length ?? 0} article{articles?.length !== 1 ? 's' : ''} tagged &ldquo;{label}&rdquo;
          </p>
        </div>

        {/* Article Grid */}
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article: any) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-zinc-400">No articles found for this tag.</p>
        )}
      </main>
    </>
  )
}
```

### Step 5 — Tag Display on Article Detail Pages

```typescript
// src/app/(user)/articles/[slug]/page.tsx
// Add to the article body section, below content and above sources:

// In the TSX return, after </PortableText>:
{article.tags && article.tags.length > 0 && (
  <div className="mt-10 border-t border-zinc-700 pt-6">
    <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">
      Filed Under
    </h3>
    <div className="flex flex-wrap gap-2">
      {article.tags.map((tag: string) => (
        <a
          key={tag}
          href={`/tag/${tagToSlug(tag)}`}
          className="border border-zinc-600 px-3 py-1 text-xs uppercase tracking-wide text-zinc-400 transition-colors hover:border-untele hover:text-white"
        >
          {tag}
        </a>
      ))}
    </div>
  </div>
)}
```

### Step 6 — Sitemap Integration

```typescript
// src/app/sitemap.ts — add tag pages to the return array:

const { data: allTags } = await sanityFetch<string[]>({
  query: queryAllTags,
  tags: ['article'],
})

const tagPages: MetadataRoute.Sitemap = (allTags ?? []).map((tag: string) => ({
  url: `${baseUrl}/tag/${tagToSlug(tag)}`,
  lastModified: now,
  changeFrequency: 'daily',
  priority: 0.5,
}))

// Include in the returned array:
return [
  ...staticPages,
  ...articlePages,
  ...categoryPages,
  ...tagPages, // <-- add this
]
```

### Step 7 — Tag Field in `queryAllArticles` Response

Ensure existing `queryAllArticles` returns `tags` so article cards can optionally show them:

```typescript
// In queryAllArticles within queries.ts, add 'tags' to the projection:
export const queryAllArticles = groq`
  *[_type == "article"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    description,
    publishedAt,
    mainImage { asset->, alt },
    "author": author->{ name, slug },
    "categories": categories[]->{ title, slug },
    tags  // <-- ensure this is included
  }
`
```

## Implementation Plan

1. **Schema** — Add `tags` string array field to `src/lib/sanity/schemas/article.ts` with `layout: 'tags'` option and max-10 validation rule.
2. **Utility** — Create `src/lib/tagUtils.ts` with `tagToSlug`, `slugToTagLabel`, and `tagPageUrl` functions.
3. **Queries** — Add `queryAllTags` and `queryArticlesByTag` to `src/lib/sanity/queries.ts`; update `queryAllArticles` to include `tags`.
4. **Tag page** — Create `src/app/(user)/tag/[slug]/page.tsx` with `generateStaticParams`, `generateMetadata`, CollectionPage JSON-LD, breadcrumb nav, and ArticleCard grid.
5. **Article detail** — Update `src/app/(user)/articles/[slug]/page.tsx` to display tags as badge links below the article body.
6. **Sitemap** — Update `src/app/sitemap.ts` to include all `/tag/[slug]` URLs.
7. **Studio testing** — Verify tag chip input UI works in Sanity Studio; add test tags to 3–5 existing articles.
8. **Build verification** — Run `pnpm build` to confirm `generateStaticParams` resolves without errors.

## Files Affected

- `src/lib/sanity/schemas/article.ts` — add `tags` field
- `src/lib/tagUtils.ts` — new utility file
- `src/lib/sanity/queries.ts` — add `queryAllTags`, `queryArticlesByTag`; update `queryAllArticles`
- `src/app/(user)/tag/[slug]/page.tsx` — new tag listing page
- `src/app/(user)/articles/[slug]/page.tsx` — display tags on article detail
- `src/app/sitemap.ts` — include tag pages

## Deliverables Checklist

### Schema & CMS
- [ ] `tags` string array field added to article schema in `src/lib/sanity/schemas/article.ts`
- [ ] Field uses `layout: 'tags'` for chip input UI in Sanity Studio
- [ ] Field has `description` instructing editors to use lowercase with hyphens
- [ ] Field has `Rule.max(10)` validation warning
- [ ] Tags field appears correctly in Sanity Studio article editor
- [ ] Test tags added to at least 5 existing articles for QA

### Utilities
- [ ] `src/lib/tagUtils.ts` created with `tagToSlug` function
- [ ] `tagToSlug` handles: spaces → hyphens, uppercase → lowercase, special chars stripped, consecutive hyphens collapsed
- [ ] `slugToTagLabel` converts slug back to Title Case for display
- [ ] `tagPageUrl` helper returns `/tag/[slug]`
- [ ] Unit-testable pure functions (no external deps)

### GROQ Queries
- [ ] `queryAllTags` added to `src/lib/sanity/queries.ts` using `array::unique`
- [ ] `queryArticlesByTag` added with correct GROQ `$tag in tags[]` filter
- [ ] `queryAllArticles` updated to include `tags` in projection
- [ ] Queries tested in Sanity Vision tool

### Tag Page Route
- [ ] `src/app/(user)/tag/[slug]/page.tsx` created
- [ ] `generateStaticParams` fetches all unique tags and maps to slug format
- [ ] `generateMetadata` returns unique `title` and `description` per tag
- [ ] `alternates.canonical` set to `https://untelevised.media/tag/[slug]`
- [ ] `notFound()` called when no tag matches the slug
- [ ] CollectionPage JSON-LD rendered via `<script type="application/ld+json">`
- [ ] Breadcrumb nav: Home > Tags > [Tag Label]
- [ ] Section header with `bg-untele` label bar and article count
- [ ] ArticleCard grid (same component as category pages)
- [ ] Empty state rendered gracefully when no articles match

### Article Detail Page
- [ ] Tags rendered below article body in `src/app/(user)/articles/[slug]/page.tsx`
- [ ] "Filed Under" label above tag badges
- [ ] Each tag is an anchor tag linking to `/tag/[tagToSlug(tag)]`
- [ ] Tag badge style: `border border-zinc-600 px-3 py-1 text-xs hover:border-untele`
- [ ] No tag section rendered if `article.tags` is empty or undefined
- [ ] Tags included in article GROQ projection

### Sitemap
- [ ] `src/app/sitemap.ts` fetches all tags using `queryAllTags`
- [ ] Each tag slug produces a `/tag/[slug]` sitemap entry
- [ ] Priority set to `0.5`, changeFrequency `'daily'`
- [ ] No duplicate entries if tag appears in multiple articles

### Quality Assurance
- [ ] `/tag/police-brutality` (or similar) loads correctly in browser
- [ ] Tag links from article detail pages navigate to correct tag pages
- [ ] `pnpm build` passes without TypeScript or build errors
- [ ] Sitemap XML includes tag entries when viewed at `/sitemap.xml`
- [ ] No 404s on any tag pages generated by `generateStaticParams`
- [ ] Google Search Console validates sitemap after deployment
