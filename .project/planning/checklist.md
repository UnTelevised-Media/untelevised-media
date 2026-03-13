# UnTelevised Media — Open Issues Checklist

> Re-audited: 2026-03-13
> All items from previous audit rounds confirmed complete (including generateStaticParams, LQIP, trailingSlash audit, siteSettings singleton).
> Remaining items below.

---

## P1 — Fix Now

- [ ] **`og-default.jpg` → `og-default.png` in 4 files** — The asset in `/public/` is `.png` but 4 files still reference `.jpg`, breaking social OG fallback.
  - `src/util/metadata.ts` line 10 — `DEFAULT_OG_IMAGE` constant
  - `src/app/(music)/lyrics/[slug]/page.tsx` line 45
  - `src/app/(music)/music-artists/[slug]/page.tsx` line 46
  - `src/app/(music)/albums/[slug]/page.tsx` line 48

---

## P2 — Next Sprint

- [ ] **`liveEvent.keywords` string → array migration**
  - `src/models/schema/liveEvent.ts` — `keywords` still `type: 'string'`
  - `src/util/metadata.ts` `buildLiveEventMetadata` — still does `.split(',')`
  - Fix: create `migrations/liveEvent-keywords-string-to-array/`, update schema to array + tags layout, update metadata handler

- [ ] **Wire `seoObject` field overrides into `generateMetadata` for music and event pages**
  - `seoObject` field was added to all schemas but not yet read in `generateMetadata` of dynamic routes
  - Pattern: `seo?.title ?? computedTitle` fallback in each `generateMetadata`
  - Affects: `lyrics/[slug]`, `music-artists/[slug]`, `albums/[slug]`, `live-event/[slug]`, `category/[slug]`

---

## P3 — Backlog

- [ ] **Run article `keywords` migration against production content**
  - `migrations/keywords-string-to-array/index.ts` exists but not confirmed run against production
  - `pnpm sanity migration run keywords-string-to-array --dry-run` first, then without `--dry-run`

- [ ] **Barrel file audit — `src/components/global/`**
  - `src/components/ads/` has a barrel `index.ts`; `src/components/global/` does not
  - Decide on consistent pattern; prefer direct imports for components not always needed

---

## Reference — Confirmed Complete

| Item | Verified |
|------|---------|
| `generateStaticParams` in articles → `sanityFetch` | line 282 of `articles/[slug]/page.tsx` |
| LQIP blur placeholders | `blurDataURL` in `page.tsx`, `articles/[slug]`, `author/[slug]` |
| Trailing slashes on all structured data URLs | NewsArticleStructuredData + GlobalStructuredData verified |
| `siteSettings` singleton in Studio structure | src/lib/sanity/structure.ts lines 8–13 |
| SEO/metadata system (P1/P2) | merged to development |
| Performance optimizations (P1/P2) | merged to development |
| Server-hoist logo (`HeaderLogo`) | merged to development |
| Font loading cleanup (Geist removed) | merged to development |
| Sanity TypeGen (`sanity.types.ts`) | merged to development |
| `keywords` → array (article schema + migration script) | merged to development |
| `use cache` + `generateStaticParams` on music pages | merged to development |
| Article schema fields (leadParagraph, faqs, relatedArticles, reviewedBy) | merged to development |
| LiveEvent schema fields (endDate, eventStatus, seo) | merged to development |
| `seoObject` on all content types | merged to development |
| Author `Person` structured data | merged to development |
| FAQ schema + FAQPage structured data | merged to development |
| Related articles section on article page | merged to development |
| `dateModified` wired from `updatedAt` | merged to development |
| `og-default.png` added to `/public/` | done |
| Root `layout.tsx` OG reference fixed to `.png` | done |
| Static metadata — about, staff, donate, support | merged to development |
| Static metadata — secure-contact, whistleblower, join | merged to development |
| Static metadata — lyrics index, music-artists index | merged to development |
| Suspense on homepage (`FeaturedStoriesGrid`) | merged to development |
