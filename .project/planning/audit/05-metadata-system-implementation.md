# Plan: Metadata System — Complete Implementation

> Status: IN PROGRESS — Core system shipped in Issue #2. Remaining checklist below.
> Last audited: 2026-03-13

---

## Overview

This is the concrete implementation checklist for the metadata system. It tracks *how* each item was or will be implemented, as a companion to `02-seo-aeo-audit.md`.

---

---

## ❌ REMAINING CHECKLIST

### High Priority

- [ ] **Wire `dateModified` into `NewsArticleStructuredData`** — `updatedAt` is in the schema; `NewsArticleStructuredData` should use it for `dateModified`. Currently may be using `publishedAt` for both.

- [ ] **Static page metadata (about, staff, donate)** — Add `export const metadata` with branded titles/descriptions:
  - `src/app/(user)/about/page.tsx` → "About UnTelevised Media"
  - `src/app/(user)/staff/page.tsx` → "Our Team — UnTelevised Media"
  - `src/app/(user)/donate/page.tsx` → "Support Independent Journalism"

- [ ] **Add `/public/og-default.jpg`** — 1200×630 branded fallback OG image referenced in root layout metadata. Does not exist yet — causes broken social preview on pages without a specific OG image.

### Medium Priority

- [ ] **Author `Person` structured data** — `author/[slug]/page.tsx` has `generateMetadata` but no `Person` schema.org output. Implementation in `05-metadata-system-implementation.md` Step 6:
```ts
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `https://www.untelevised.media/author/${slug}/#person`,
  name: author.name,
  jobTitle: author.title,
  worksFor: { '@id': 'https://www.untelevised.media/#organization' },
  sameAs: author.sameAs ?? [],
  knowsAbout: author.expertise ?? [],
}
```

- [ ] **FAQ schema** — Add `faqs[]` to article Sanity schema (see Plan #3), then render `FAQPage` structured data in `NewsArticleStructuredData`. High AEO value.

- [ ] **Related articles section** — Add `relatedArticles[]->` to `queryArticleBySlug` GROQ expansion, render at end of article body. Also in Plan #3.

- [ ] **Expand `queryArticleBySlug` GROQ** — Add new fields to the query:
```groq
*[_type=='article' && slug.current == $slug][0] {
  ...,
  seo,
  faqs,
  sources,
  updatedAt,
  relatedArticles[]-> {
    _id, title, "slug": slug.current, mainImage, description, publishedAt,
    author-> { name }
  }
}
```

### Lower Priority

- [ ] **Dynamic OG image generation** — `next/og` ImageResponse at `src/app/(user)/articles/[slug]/opengraph-image.tsx` for branded per-article OGs (title + author + category overlay on image).

- [ ] **`generateMetadata` for remaining static pages** — `/secure-contact`, `/whistleblower`, `/join`, `/support`, `/lyrics` (index), `/music-artists` (index).

- [ ] **`keywords` field migration** — Article schema `keywords` is still a `string`. Once migrated to `string[]` (see Plan #3), update `buildArticleMetadata` to pass array directly rather than splitting on commas.

- [ ] **TypeGen** — Run `pnpm sanity typegen generate` to produce `sanity.types.ts`. Replace manual type interfaces. Removes schema/type drift as schemas continue to expand.
