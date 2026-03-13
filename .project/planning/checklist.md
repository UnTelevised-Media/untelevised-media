# UnTelevised Media — Open Issues Checklist

> Compiled from audit files in `.project/planning/audit/`
> Last updated: 2026-03-13
> Issues #2 (SEO/AEO) and #3 (Performance) merged to `development`. All items below are remaining work.

---

## P1 — Critical / Quick Wins

- [x] **Wire `dateModified` into `NewsArticleStructuredData`**
  `src/components/seo/NewsArticleStructuredData.tsx` — `updatedAt` is in the schema but `dateModified` in the structured data may still be using `publishedAt`. Fix: pass `article.updatedAt ?? article.publishedAt` to `dateModified`.
  > Audit ref: `02`, `05`

- [x] **Add `export const metadata` to `/about` page**
  `src/app/(user)/about/page.tsx` → title: "About UnTelevised Media"
  > Audit ref: `01`, `02`, `05`

- [x] **Add `export const metadata` to `/staff` page**
  `src/app/(user)/staff/page.tsx` → title: "Our Team — UnTelevised Media"
  > Audit ref: `01`, `02`, `05`

- [x] **Add `export const metadata` to `/donate` page**
  `src/app/(user)/donate/page.tsx` → title: "Support Independent Journalism"
  > Audit ref: `01`, `02`, `05`

- [ ] **Add `/public/og-default.jpg`** (1200×630 branded fallback)
  Referenced in root layout `openGraph.images` but file does not exist — broken social preview on pages without a specific OG image.
  > Audit ref: `02`, `05`

- [x] **Add Suspense boundary around `FeaturedStoriesGrid`**
  `src/app/(user)/page.tsx` ~line 168 — not wrapped in Suspense, blocks full page render on slow Sanity fetch.
  > Audit ref: `01`, `04`

- [x] **Replace `sanityClient.fetch` with `sanityFetch` in `generateStaticParams` (articles)**
  `src/app/(user)/articles/[slug]/page.tsx:219` — raw client bypasses ISR tag system.
  > Audit ref: `01`, `04`

---

## P2 — High Value

- [x] **Add `leadParagraph` field to article Sanity schema**
  `src/models/schema/article.ts` — 2–3 sentence plain text summary for AI extraction and featured snippets.
  > Audit ref: `02`, `03`

- [x] **Add `faqs[]` field to article Sanity schema**
  `src/models/schema/article.ts` — array of question/answer objects for FAQPage structured data.
  > Audit ref: `02`, `03`, `05`

- [x] **Render `FAQPage` structured data in `NewsArticleStructuredData`**
  Only render when `article.faqs?.length > 0`. Depends on schema field above.
  > Audit ref: `02`, `05`

- [x] **Add `reviewedBy` reference field to article schema**
  `src/models/schema/article.ts` — reference to author, for editorial fact-checker.
  > Audit ref: `03`

- [x] **Add `relatedArticles[]` field to article Sanity schema**
  `src/models/schema/article.ts` — up to 5 references to related articles (max: 5).
  > Audit ref: `03`, `05`

- [x] **Expand `queryArticleBySlug` GROQ to include new fields**
  Add `seo`, `faqs`, `sources`, `updatedAt`, and `relatedArticles[]->` to the query in `src/lib/sanity/lib/queries.ts`.
  > Audit ref: `05`

- [x] **Render Related Articles section on article pages**
  `src/app/(user)/articles/[slug]/page.tsx` — render `relatedArticles` at end of article body. Depends on schema + GROQ changes above.
  > Audit ref: `02`, `05`

- [x] **Add `Person` structured data to author pages**
  `src/app/(user)/author/[slug]/page.tsx` — render schema.org `Person` with `sameAs`, `knowsAbout`, `worksFor` fields.
  > Audit ref: `02`, `05`

- [x] **Display `updatedAt` in article UI near byline**
  Show "Updated: {date}" when `updatedAt > publishedAt`. Uses existing schema field.
  > Audit ref: `02`

- [x] **Add LQIP blur placeholders to images**
  Applied to homepage featured stories grid, article hero image, and author photo using Sanity low-res URL with `.width(20).blur(10).url()`.
  > Audit ref: `01`, `04`

- [x] **Add `seoObject` field to `liveEvent`, `category`, `musicArtist`, `album`, `song` schemas**
  Currently only `article` has the `seoObject` field. Purely additive — no migration needed.
  > Audit ref: `03`

- [x] **Add `endDate` and `eventStatus` fields to `liveEvent` schema**
  `src/models/schema/liveEvent.ts` — needed for complete Event structured data.
  > Audit ref: `03`

---

## P3 — Quality Improvements

- [x] **Audit barrel file imports — consider direct imports**
  `@/components/consent` barrel is bypassed — both components are already dynamically imported in root layout. `@/components/ads` barrel components are universally used; no action needed.
  > Audit ref: `04`

- [ ] **Add `generateStaticParams` to music dynamic routes**
  Once pages are built: `lyrics/[slug]`, `music-artists/[slug]`, `albums/[slug]` all lack `generateStaticParams`. Follow the article page pattern.
  > Audit ref: `01`

- [x] **Verify `await params` pattern on all dynamic routes**
  Confirmed `live-event/[slug]`, `author/[slug]`, `category/[slug]` all use `Promise<{ slug: string }>` — no changes needed.
  > Audit ref: `01`

- [x] **Verify trailing slash consistency in all structured data URLs**
  Fixed missing trailing slashes in `NewsArticleStructuredData` publisher url and `GlobalStructuredData` organization and website urls.
  > Audit ref: `01`, `02`

- [x] **Server-hoist logo out of `Header.tsx` client component**
  Extracted to `src/components/global/HeaderLogo.tsx` server component, passed as `logoSlot` prop to client `Header` from both `(user)/layout.tsx` and `(music)/layout.tsx`.
  > Audit ref: `04`

- [x] **Add `generateMetadata` to remaining static pages**
  Added to `/support` (server component metadata export) and layout files for `/secure-contact`, `/whistleblower`, `/join` (client components that require layout-level metadata).
  > Audit ref: `02`

- [x] **Add `siteSettings` singleton to Sanity Studio structure**
  `structure.ts` — singleton desk item added, filtered from `documentTypeListItems` to prevent duplication.
  > Audit ref: `03`

- [x] **Resolve font loading duplication**
  Removed Geist Sans and Geist Mono from `src/app/layout.tsx` — Inter is the active font, Geist variables were unused (not referenced in Tailwind config or CSS). Body class simplified to `${inter.className} font-sans antialiased`.
  > Audit ref: `01`

---

## P4 — Future / Low Priority

- [x] **Run Sanity TypeGen**
  Created root-level `sanity.config.ts` (CLI-only, no `'use client'`, relative imports). `pnpm sanity schema extract && pnpm sanity typegen generate` now runs clean — 59 queries, 50 schema types. Fixed 10 duplicate query names across 9 files to eliminate all TypeGen warnings.
  > Audit ref: `03`, `05`

- [ ] **`keywords` field migration: string → array**
  Article schema `keywords` is a plain `string`. Migrate to `string[]` with tags layout. Requires content migration script:
  ```bash
  pnpm sanity migration create keywords-string-to-array
  ```
  After migration, update `buildArticleMetadata` to pass array directly.
  > Audit ref: `01`, `02`, `03`, `05`

- [ ] **Dynamic OG image generation with `next/og`**
  `src/app/(user)/articles/[slug]/opengraph-image.tsx` — branded per-article OG with title, author, category overlay using `ImageResponse`.
  > Audit ref: `02`, `05`

- [ ] **Migrate Sanity fetches to `use cache` directive (Next.js 16)**
  Investigate `experimental.cacheLife` config. Replace `sanityFetch` ISR pattern with `'use cache'` + `cacheTag()` + `cacheLife()` for fine-grained per-function cache control.
  > Audit ref: `04`
