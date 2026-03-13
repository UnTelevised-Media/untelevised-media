# UnTelevised Media — Open Issues Checklist

> Compiled from audit files in `.project/planning/audit/`
> Last updated: 2026-03-13
> Issues #2 (SEO/AEO) and #3 (Performance) merged to `development`. All items below are remaining work.

---

## P1 — Critical / Quick Wins

- [ ] **Wire `dateModified` into `NewsArticleStructuredData`**
  `src/components/seo/NewsArticleStructuredData.tsx` — `updatedAt` is in the schema but `dateModified` in the structured data may still be using `publishedAt`. Fix: pass `article.updatedAt ?? article.publishedAt` to `dateModified`.
  > Audit ref: `02`, `05`

- [ ] **Add `export const metadata` to `/about` page**
  `src/app/(user)/about/page.tsx` → title: "About UnTelevised Media"
  > Audit ref: `01`, `02`, `05`

- [ ] **Add `export const metadata` to `/staff` page**
  `src/app/(user)/staff/page.tsx` → title: "Our Team — UnTelevised Media"
  > Audit ref: `01`, `02`, `05`

- [ ] **Add `export const metadata` to `/donate` page**
  `src/app/(user)/donate/page.tsx` → title: "Support Independent Journalism"
  > Audit ref: `01`, `02`, `05`

- [ ] **Add `/public/og-default.jpg`** (1200×630 branded fallback)
  Referenced in root layout `openGraph.images` but file does not exist — broken social preview on pages without a specific OG image.
  > Audit ref: `02`, `05`

- [ ] **Add Suspense boundary around `FeaturedStoriesGrid`**
  `src/app/(user)/page.tsx` ~line 168 — not wrapped in Suspense, blocks full page render on slow Sanity fetch.
  ```tsx
  <Suspense fallback={<GridSkeleton count={6} />}>
    <FeaturedStoriesGrid articles={featuredStories} />
  </Suspense>
  ```
  > Audit ref: `01`, `04`

- [ ] **Replace `sanityClient.fetch` with `sanityFetch` in `generateStaticParams` (articles)**
  `src/app/(user)/articles/[slug]/page.tsx:219` — raw client bypasses ISR tag system.
  > Audit ref: `01`, `04`

---

## P2 — High Value

- [ ] **Add `leadParagraph` field to article Sanity schema**
  `src/models/schema/article.ts` — 2–3 sentence plain text summary for AI extraction and featured snippets.
  ```ts
  defineField({ name: 'leadParagraph', title: 'Lead / Summary', type: 'text', rows: 3 })
  ```
  > Audit ref: `02`, `03`

- [ ] **Add `faqs[]` field to article Sanity schema**
  `src/models/schema/article.ts` — array of question/answer objects for FAQPage structured data.
  > Audit ref: `02`, `03`, `05`

- [ ] **Render `FAQPage` structured data in `NewsArticleStructuredData`**
  Only render when `article.faqs?.length > 0`. Depends on schema field above.
  > Audit ref: `02`, `05`

- [ ] **Add `reviewedBy` reference field to article schema**
  `src/models/schema/article.ts` — reference to author, for editorial fact-checker.
  > Audit ref: `03`

- [ ] **Add `relatedArticles[]` field to article Sanity schema**
  `src/models/schema/article.ts` — up to 5 references to related articles (max: 5).
  > Audit ref: `03`, `05`

- [ ] **Expand `queryArticleBySlug` GROQ to include new fields**
  Add `seo`, `faqs`, `sources`, `updatedAt`, and `relatedArticles[]->` to the query in `src/lib/sanity/lib/queries.ts`.
  > Audit ref: `05`

- [ ] **Render Related Articles section on article pages**
  `src/app/(user)/articles/[slug]/page.tsx` — render `relatedArticles` at end of article body. Depends on schema + GROQ changes above.
  > Audit ref: `02`, `05`

- [ ] **Add `Person` structured data to author pages**
  `src/app/(user)/author/[slug]/page.tsx` — render schema.org `Person` with `sameAs`, `knowsAbout`, `worksFor` fields.
  > Audit ref: `02`, `05`

- [ ] **Display `updatedAt` in article UI near byline**
  Show "Updated: {date}" when `updatedAt > publishedAt`. Uses existing schema field.
  > Audit ref: `02`

- [ ] **Add LQIP blur placeholders to images**
  `plaiceholder` is installed but never used. Apply to article cards, homepage hero, author photos, event images using Sanity low-res URL:
  ```tsx
  <Image placeholder="blur" blurDataURL={urlForImage(image).width(20).url()} ... />
  ```
  > Audit ref: `01`, `04`

- [ ] **Add `seoObject` field to `liveEvent`, `category`, `musicArtist`, `album`, `song` schemas**
  Currently only `article` has the `seoObject` field. Purely additive — no migration needed.
  > Audit ref: `03`

- [ ] **Add `endDate` and `eventStatus` fields to `liveEvent` schema**
  `src/models/schema/liveEvent.ts` — needed for complete Event structured data.
  > Audit ref: `03`

---

## P3 — Quality Improvements

- [ ] **Audit barrel file imports — consider direct imports**
  `@/components/ads`, `@/components/global`, `@/components/consent` barrel index files may prevent tree-shaking. Audit and replace with direct imports where components aren't universally needed.
  > Audit ref: `04`

- [ ] **Add `generateStaticParams` to music dynamic routes**
  Once pages are built: `lyrics/[slug]`, `music-artists/[slug]`, `albums/[slug]` all lack `generateStaticParams`. Follow the article page pattern.
  > Audit ref: `01`

- [ ] **Verify `await params` pattern on all dynamic routes**
  Confirm `live-event/[slug]`, `author/[slug]`, `category/[slug]` all use `Promise<{ slug: string }>` (Next.js 15 async params).
  > Audit ref: `01`

- [ ] **Verify trailing slash consistency in all structured data URLs**
  `next.config.ts` has `trailingSlash: true`. Spot-check all `@id` and `item` URLs in `NewsArticleStructuredData` and `GlobalStructuredData` for consistent trailing slashes.
  > Audit ref: `01`, `02`

- [ ] **Server-hoist logo out of `Header.tsx` client component**
  `src/components/global/Header.tsx` — extract `<Image>` logo as a separate server component passed as a child/slot to the client Header to prevent re-renders on scroll/nav.
  > Audit ref: `04`

- [ ] **Add `generateMetadata` to remaining static pages**
  `/secure-contact`, `/whistleblower`, `/join`, `/support`, `/lyrics` (index), `/music-artists` (index).
  > Audit ref: `02`

- [ ] **Add `siteSettings` singleton to Sanity Studio structure**
  `structure.ts` — add singleton desk item for `siteSettings` if not already present.
  > Audit ref: `03`

- [ ] **Resolve font loading duplication**
  `src/app/layout.tsx` — three fonts loaded (Geist Sans, Geist Mono, Inter) but only Inter applies visually. Decide: drop Geist or wire Geist variable properly.
  > Audit ref: `01`

---

## P4 — Future / Low Priority

- [ ] **Run Sanity TypeGen**
  ```bash
  pnpm sanity typegen generate
  ```
  Produces `sanity.types.ts`. Replace manual `Article`, `LiveEvent`, etc. type interfaces to eliminate schema/type drift.
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
