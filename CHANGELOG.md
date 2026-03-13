# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

### Sanity TypeGen

- Add `sanity.config.ts` at project root (CLI-only config — no `'use client'`, no `@/` aliases) to enable `pnpm sanity typegen generate` without conflicts with the embedded studio config
- Move `sanity.cli.ts` to project root (was at `src/lib/sanity/sanity.cli.ts`)
- Generate `sanity.types.ts` at project root — 59 typed GROQ queries, 50 schema types; replaces hand-written TypeScript interfaces
- Rename 9 files with duplicate GROQ variable names (`query` → descriptive unique names) to reach 0 TypeGen warnings; affected: author, category, live-event, policies, timeline, timeline-category, timeline-event slug pages; `getAllUrls.ts`; `generateBlogCatMetadata.ts`; `generateMetadata.ts`

---

### Sanity Schema — Article

- Add `leadParagraph` field (`type: 'text'`, 3 rows) — plain-text 2–3 sentence summary for AI extraction and featured snippets
- Add `faqs[]` field — array of `{ question, answer }` objects for FAQPage schema.org structured data
- Add `relatedArticles[]` reference array field (max 5) — links to related article documents
- Add `reviewedBy` reference field — editorial reviewer / fact-checker author reference
- Migrate `keywords` field from `type: 'string'` → `type: 'array'` of strings with tags layout (type a keyword and press Enter or comma to add)
- Create `migrations/keywords-string-to-array/index.ts` — splits existing comma-separated keyword strings into arrays on migration run
- Update `buildArticleMetadata` in `src/util/metadata.ts` to use keywords array directly (removes `.split(',')` splitting)
- Update `NewsArticleStructuredData` to join keywords array for output

---

### Sanity Schema — Live Event & Other Types

- Add `endDate` (`datetime`) field to `liveEvent` schema for complete schema.org Event structured data
- Add `eventStatus` field to `liveEvent` — string enum: EventScheduled / EventCancelled / EventPostponed / EventMovedOnline; default: EventScheduled
- Add `seoObject` field to: `liveEvent`, `category`, `musicArtist`, `album`, `song` schemas — consistent per-document SEO override fields across all content types

---

### Sanity Studio

- Add `siteSettings` singleton to Studio desk structure via `S.listItem()` — accessible at top level for global brand config management

---

### SEO & Metadata

#### Structured Data Fixes
- Wire `dateModified` from `article.updatedAt` into `NewsArticleStructuredData` — was previously using `publishedAt` for both dates
- Ensure all structured data `@id` and URL fields use trailing slashes (matches `trailingSlash: true` in `next.config.ts`)
- Render `FAQPage` structured data inside `NewsArticleStructuredData` when `article.faqs` is present — high AEO value for AI citation
- Add `Person` structured data JSON-LD to `/author/[slug]` pages — `@type: 'Person'`, `worksFor`, `sameAs`, `knowsAbout` fields

#### Static Page Metadata
- Add `export const metadata` to `/about` — "About UnTelevised Media"
- Add `export const metadata` to `/staff` — "Our Team — UnTelevised Media"
- Add `export const metadata` to `/donate` — "Support Independent Journalism"
- Add metadata via `layout.tsx` to `/support`, `/secure-contact`, `/whistleblower`, `/join` (client component pages; metadata in parent layout is the correct Next.js pattern)
- Add `export const metadata` to `/lyrics` (index) and `/music-artists` (index) music listing pages

#### OG Image
- Add `/public/og-default.png` — 1200×630 branded fallback OG image for pages without a specific image
- Update root `layout.tsx` OG image reference from `og-default.jpg` → `og-default.png`

---

### Article Page

- Expand `queryArticleBySlug` GROQ to include: `seo`, `faqs`, `sources`, `updatedAt`, `leadParagraph`, `relatedArticles[]->` (with `_id`, `title`, `slug`, `mainImage`, `description`, `publishedAt`, `author->`)
- Render Related Articles section at the bottom of article pages when `relatedArticles` is populated
- Display "Updated: {date}" near byline when `article.updatedAt` differs from `article.publishedAt`

---

### Performance

#### Server Component Architecture
- Server-hoist logo: extract `<Image>`, `<Link>`, gradient decorations from client `Header` into new `HeaderLogo` server component (`src/components/global/HeaderLogo.tsx`) — logo no longer re-renders on every client interaction
- Pass `HeaderLogo` as `logoSlot` prop to client `Header` — clean server/client composition pattern applied in `(user)/layout.tsx` and `(music)/layout.tsx`
- Remove unused `localFont` declarations for Geist Sans and Geist Mono from `src/app/layout.tsx` — Inter (via `next/font/google`) was already the active font; body `className` simplified

#### Suspense & Streaming
- Wrap `FeaturedStoriesGrid` in `<Suspense>` on homepage — was blocking full-page render on slow Sanity fetch

#### LQIP Blur Placeholders
- Add `placeholder="blur"` + `blurDataURL` (20px Sanity thumbnail) to hero images on: homepage featured stories (`page.tsx`), article hero (`articles/[slug]/page.tsx`), author hero (`author/[slug]/page.tsx`) — reduces CLS on image load

#### Cache & Static Generation
- Fix `generateStaticParams` in `/articles/[slug]` — replace raw `sanityClient.fetch` with `sanityFetch` to keep static params consistent with tag-based ISR revalidation
- Add `generateStaticParams` to all music dynamic routes (`lyrics/[slug]`, `music-artists/[slug]`, `albums/[slug]`) — enables static generation at build time
- Migrate all 3 music dynamic routes to `'use cache'` directive with `cacheTag` (per-document + type-level) and `cacheLife('hours')` — replaces ISR on music pages with fine-grained per-function cache control
- Enable `experimental.useCache: true` in `next.config.ts` to activate `'use cache'` directive, `cacheTag()`, and `cacheLife()` from `next/cache`

---

### Performance

#### Bundle Size / Waterfalls
- Remove unused `categories` fetch from homepage `Promise.all` — eliminates one extra Sanity round-trip on every homepage load
- Defer `CookieConsentBanner` and `AdBlockerMessage` (framer-motion) via `next/dynamic` — code-splits framer-motion out of the initial JS bundle on every page
- Defer `TimelineJSVisualization` (framer-motion) via `next/dynamic` on timeline pages — only loads when a timeline page is visited
- Defer `react-tweet` `Tweet` component and `react-syntax-highlighter` `Prism` via `next/dynamic` in `RichTextComponents` — only loaded when article body contains those block types
- Remove unused `styled-components` and `@types/styled-components` from `package.json`

#### Images / Re-renders
- Add `priority` to author hero photo on `/author/[slug]` — was LCP image without preload hint
- Add `sizes` prop to homepage featured stories grid — prevents browser from fetching oversized images
- Fix `Header.tsx` scroll handler: `requestAnimationFrame` throttle + `{ passive: true }` listener — eliminates forced reflows on scroll
- Wrap `getArticleBySlug` and `getAuthorBySlug` in `React.cache()` — `generateMetadata` and the page component now share a single fetch per request instead of making two round-trips

#### Tooling
- Enable `typedRoutes: true` in `next.config.ts` experimental — catches broken internal `<Link href>` at build time
- Wire up `@next/bundle-analyzer` (already installed) via `withBundleAnalyzer()` wrapper in `next.config.ts`
- Add `analyze` npm script — run `npm run analyze` to open interactive bundle treemap

### SEO & AEO

#### Added
- Event schema.org structured data on `/live-event/[slug]` pages (eventStatus, location, organizer, image)
- Canonical URL, Twitter card, and `alternates.canonical` to `/music-artists/[slug]` metadata
- Canonical URL, Twitter card, and `alternates.canonical` to `/albums/[slug]` metadata
- New Sanity schema `seoObject` — reusable SEO object with metaTitle, metaDescription, ogImage, noIndex, canonicalUrl fields; added to `article` schema
- New Sanity schema `siteSettings` — singleton for global brand config (name, description, logo, social links, foundingDate, defaultOgImage)
- EEAT fields on `article` schema: `location`, `updatedAt`, `corrections`, `sources[]`
- EEAT fields on `author` schema: `credentials[]`, `expertise[]`, `sameAs[]`, `location`, `isActive`
- `GlobalStructuredData` component — NewsMediaOrganization + WebSite + SearchAction schema.org rendered in `(user)/layout.tsx`
- `NewsArticleStructuredData` component — NewsArticle + BreadcrumbList schema.org on every article page
- `generateMetadata()` to `/articles/[slug]` — unique title, description, OG image, canonical URL per article
- `generateMetadata()` to `/live-event/[slug]` — per-event metadata with live status in title
- `generateMetadata()` to `/category/[slug]` — per-category metadata using new `queryCategoryBySlug`
- `generateMetadata()` to `/author/[slug]` — per-author metadata with OG profile image
- `queryCategoryBySlug` GROQ query for category metadata fetches
- Canonical URL, Twitter card, and `alternates.canonical` to `/lyrics/[slug]` metadata
- `src/util/metadata.ts` — shared helpers: `getCanonicalUrl`, `getSanityOgImageUrl`, `truncate`, `buildArticleMetadata`, `buildLiveEventMetadata`, `buildCategoryMetadata`, `buildAuthorMetadata`

#### Fixed
- Update `next-sanity` v12 import paths: `VisualEditing` now from `next-sanity/visual-editing`, `defineLive` now from `next-sanity/live`
- Replace boilerplate "Next.js 15 Boilerplate" root layout metadata with UnTelevised Media branding
- Replace inline `notFound()` div fallback with proper `notFound()` from `next/navigation` in `/articles/[slug]`
- Fix `StructuredData.tsx` — replace `next/script` with plain `<script>` tags for inline JSON-LD (correct RSC pattern)
- Fix `sitemap.ts` — homepage priority `0.3` → `1.0`, article priorities now recency-based (`0.8/0.6/0.4`), live events `0.9`, all URLs use trailing slashes, added missing static pages (`/about/`, `/staff/`, `/donate/`, `/past-events/`)
- Fix `robots.ts` — add `Disallow: /api/`, fix `BASEURL` with fallback to `NEXT_PUBLIC_APP_URL` then hardcoded production URL, explicitly allow all major AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, anthropic-ai, cohere-ai)

---
