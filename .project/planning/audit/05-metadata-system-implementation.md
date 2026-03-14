# Audit 05: Metadata System — Complete Implementation

> Status: RE-AUDITED — 2026-03-13
> All items complete. No open items.

---

## Overview

Companion to `02-seo-aeo-audit.md`. Tracks implementation details of the metadata system.

---

## ✅ COMPLETED

| Item | Notes |
|------|-------|
| `src/util/metadata.ts` — shared helper module | `getCanonicalUrl`, `getSanityOgImageUrl`, `truncate`, `buildArticleMetadata`, `buildLiveEventMetadata`, `buildCategoryMetadata`, `buildAuthorMetadata` |
| `buildArticleMetadata` — seo overrides | `seo.metaTitle`, `seo.metaDescription`, `seo.canonicalUrl`, `seo.ogImage` applied as fallbacks |
| `buildLiveEventMetadata` — seo overrides | Same pattern; `seo?.metaTitle ?? computedTitle`; array keywords (no `.split(',')`) |
| `buildCategoryMetadata` — seo overrides | `seo?.metaTitle`, `seo?.metaDescription`, `seo?.canonicalUrl` applied |
| `buildAuthorMetadata` — implemented | Includes OG profile image, canonical URL, Twitter card |
| `lyrics/[slug]` `generateMetadata` — seo overrides | `song.seo?.metaTitle ?? computedTitle`; `song.seo?.canonicalUrl` |
| `music-artists/[slug]` `generateMetadata` — seo overrides | `artist.seo?.metaTitle ?? computedTitle`; `artist.seo?.canonicalUrl` |
| `albums/[slug]` `generateMetadata` — seo overrides | `album.seo?.metaTitle ?? computedTitle`; `album.seo?.canonicalUrl` |
| `queryCategoryBySlug` includes `seo` | Added to GROQ projection in `src/lib/sanity/lib/queries.ts` |
| `queryArticleBySlug` expanded | Includes: `seo`, `faqs`, `sources`, `updatedAt`, `leadParagraph`, `relatedArticles[]->` |
| `DEFAULT_OG_IMAGE` uses `.png` | `src/util/metadata.ts` line 10 — `${BASE_URL}/og-default.png` |
| `dateModified` in structured data | `NewsArticleStructuredData` uses `article.updatedAt ?? article._updatedAt ?? article.publishedAt` |
| `updatedAt` displayed in article UI | "Updated: {date}" near byline when `updatedAt !== publishedAt` |
| Static page metadata — about, staff, donate, support | `export const metadata` in each page |
| Static page metadata — secure-contact, whistleblower, join | `layout.tsx` in each route (`layout.tsx` exports metadata; page is client component) |
| Static page metadata — lyrics index, music-artists index | `export const metadata` in each page |
| `/public/og-default.png` | Added; referenced in root `layout.tsx` and all metadata fallbacks |
| Author `Person` structured data | JSON-LD with `@type: 'Person'`, `worksFor`, `sameAs`, `knowsAbout`, `hasCredential` |
| FAQ schema + `FAQPage` structured data | `faqs[]` in article schema; `NewsArticleStructuredData` emits `FAQPage` when present |
| Related articles section | `relatedArticles[]->` in GROQ + rendered at bottom of article body |
| `SeoOverride` interface in `types.d.ts` | `metaTitle?`, `metaDescription?`, `ogImage?`, `noIndex?`, `canonicalUrl?` |
| `seo?: SeoOverride` on all content types | `LiveEvent`, `Category`, `MusicArtist`, `Album`, `Song` in `types.d.ts` |
| `Article.keywords: string[]` | Corrected from `string` in `types.d.ts` |
| `LiveEvent.keywords: string[]` | Corrected from `string` in `types.d.ts` |
| Dynamic OG image | N/A — decision made to use static `og-default.png` |
| Sanity TypeGen | `sanity.types.ts` at project root — 59 queries, 50 types |

---

## ❌ OPEN

> Re-audited 2026-03-13 (second pass). New findings added.

| Item | Priority | Notes |
|------|----------|-------|
| `albums/[slug]` `keywords` is a template string | P2 | `generateMetadata` returns `keywords: \`\${album.title}, \${artistNames}...\`` (string). Should be an array `string[]` to match the Next.js `Metadata` type and the `article`/`liveEvent` pattern. |
| Music pages missing JSON-LD output | P2 | `albums/[slug]`, `lyrics/[slug]`, `music-artists/[slug]` have `generateMetadata` but no structured data — see Audit 02 for full breakdown. |
