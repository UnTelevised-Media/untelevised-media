# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- **Corrections & Retractions Workflow (#23)** — Full editorial correction pipeline:
  - New reusable `correctionObject` Sanity schema supporting four correction types: `correction` (amber), `clarification` (blue), `update` (green), `retraction` (red)
  - `Article` and `LiveEvent` Sanity schemas updated to use shared `correctionObject` field (live events support corrections/clarifications/updates only — not retractions)
  - `CorrectionNotice` component renders inline above article body with per-type color, icon, label, issued date, and detail text
  - Distinct retraction badge (red `bg-untele` + XCircle icon) vs correction badge (amber + AlertTriangle) on all card surfaces (`ArticleCard`, `FeaturedArticleCard`, `ArticleCardLg`)
  - Retracted article titles display with `line-through opacity-60` on article page and all card surfaces
  - GROQ queries updated to project `correction { type, issuedAt, summary, detail }` on all article and event fetch paths
  - `ArticleCorrection` TypeScript interface added; `correction?` field on `Article` and `LiveEvent` global types

### Fixed
- **GTM never loaded in production** — `GTM_ID` was a server-side env var passed
  to a `'use client'` component where it evaluated to `undefined`; renamed to
  `NEXT_PUBLIC_GTM_ID` so the client bundle can read it
- **Dual GTM + GA4 script conflict** — `ConsentAwareAnalytics` was loading both
  `gtag/js?id=GTM-…` (GA4 endpoint) and `gtm.js?id=GTM-…` (GTM endpoint) for
  the same container ID; now loads only the GTM snippet via `gtm.js`, with a
  separate optional `gtag/js?id=G-…` for direct GA4 (`NEXT_PUBLIC_GA4_ID`)
- **Google Consent Mode v2 compliance** — consent defaults were set inside the
  GTM `onLoad` callback (after GTM fired); moved to a `beforeInteractive` inline
  script in `layout.tsx` so defaults are established before any tags execute
- **Broken `trackPageView`** — called `gtag('config', '')` with an empty string
  because `NEXT_PUBLIC_GA_ID` was never defined; removed the broken export;
  `useConsentAwareTracking` now exposes only `trackEvent`
- **Reactive consent updates** — `gtag('consent', 'update', …)` is now fired
  from a `useEffect` in `ConsentAwareAnalytics` whenever consent preferences
  change, replacing the previous one-time `onLoad` callback
- Renamed `GA4_ID` → `NEXT_PUBLIC_GA4_ID` and `GTM_ID` → `NEXT_PUBLIC_GTM_ID`
  in `.env.local`
- **Ad components bypass consent gate** — `BannerAd`, `SidebarAd`, `RectangleAd`,
  and `InFeedAd` now each call `useConsentCheck()` and skip `pushAd` until
  `hasConsent && canUseMarketing` — prevents ad loads before user decides
- **Article page ad slots not in config** — `ARTICLE_RECTANGLE` and
  `ARTICLE_BANNER_BOTTOM` slot IDs added to `AD_CONFIG.AD_SLOTS`; article page
  now references named constants instead of raw string literals
- **Hardcoded AdSense publisher ID** — removed `'ca-pub-…'` fallback from
  `adConfig.ts`, `adsenseInit.ts`, and both layout files; all now use
  `NEXT_PUBLIC_GAS_ID` only (fails loudly if env var is missing)
- **`acceptAll` forced full page reload** — `window.location.reload()` removed
  from consent context; Consent Mode v2's `gtag('consent', 'update')` (already
  called in `consentStorage.saveConsent`) handles dynamic updates without reload
- **AdSense script torn down on route change** — removed `useEffect` cleanup
  that removed the `<script>` tag on unmount; the script is a persistent global
  resource that must survive route changes

### Added
- **Ad lazy loading** — `BannerAd`, `SidebarAd`, `RectangleAd`, and `InFeedAd`
  now use `IntersectionObserver` with `AD_CONFIG.PERFORMANCE.LAZY_LOAD_MARGIN`
  (`200px`) to defer `pushAd` until the container approaches the viewport,
  reducing initial page load impact for below-fold ad placements
- **`.env.example`** — created with all required env vars documented, including
  `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA4_ID`, and `NEXT_PUBLIC_GAS_ID` with
  descriptions and where to find each value

---

## [2.2.0] — 2026-03-14 — Best Practices Refactor & Performance Upgrade

### Summary
Full migration to Sanity Live Content API for real-time UI updates, a
complete rich text renderer overhaul, and a series of best-practice fixes
across data fetching, caching, and article presentation.

### Added
- **Sanity Live Content API** — all 21 server pages and components now use
  `sanityFetch` from `next-sanity/live`. Content published in Sanity Studio
  appears on the site immediately with no rebuild or manual revalidation.
- **Rich text renderer** — full `RichTextComponents` coverage:
  - `table` block type with branded header row and striped body rows
  - `code` block type with `vscDarkPlus` syntax highlighting and language label
  - `mermaidDiagram` block type (code-block fallback until mermaid pkg added)
  - `blockquote` block style with untele red left border
  - `normal` paragraph block, `break` block
  - Inline marks: `em`, `strong`, `underline`, `strikethrough`, `superscript`,
    `subscript`, `code` (styled `<code>` tag)
- **NavWrapper** — migrated from raw `sanityClient.fetch()` to live `sanityFetch`

### Fixed
- **`defineLive` misconfiguration** — token was inside `client.withConfig()`
  instead of `serverToken`/`browserToken` options; `<SanityLive />` had no
  credentials to open the browser-side EventSource subscription
- **`perspective: 'previewDrafts'` hardcoded** — was serving draft content to
  all production users; removed so `defineLive` manages perspective internally
- **`experimental_taintUniqueValue` conflict** — was silently blocking
  `browserToken` from reaching the client; sourced directly from `process.env`
  in `live.ts` to bypass the taint check
- **Inline `code` mark** — was incorrectly using `SyntaxHighlighter`; now uses
  a styled `<code>` tag as intended
- **Article byline** — Reviewed By repositioned from the date/location row to
  sit directly next to the author card

### Changed
- Music detail pages (`albums/`, `lyrics/`, `music-artists/`) — removed
  `'use cache'` / `cacheTag` / `cacheLife` wrappers; live API handles cache
  invalidation via EventSource, making per-function caching redundant
- `SyntaxHighlighter` theme updated from `dark` to `vscDarkPlus`
- All `sanityFetch` call sites updated to destructure `{ data }` from the
  live API return value

---

### Sanity Live Content API — Real-Time UI Updates (2026-03-14)

Closes [#6](https://github.com/UnTelevised-Media/untelevised-media-new/issues/6)

#### Summary
All server-rendered pages and components now use the Sanity Live Content API
(`sanityFetch` from `lib/live.ts` / `next-sanity/live`). The `<SanityLive />`
component was already mounted in both `(user)` and `(music)` layouts; this
change wires every data query into the live system so that content published
in Sanity Studio appears on the site immediately — no rebuild or manual
revalidation required.

#### Changed — Data Fetching (21 files)
- Replace `import sanityFetch from '@/lib/sanity/lib/fetch'` (legacy ISR) with
  `import { sanityFetch } from '@/lib/sanity/lib/live'` (live API) across all
  server pages and components
- Destructure `{ data }` from the live `sanityFetch` return value at every call
  site (live API returns `{ data, sourceMap, tags }` instead of raw data)
- Remove `as Promise<T>` type casts no longer needed after the destructuring change

#### Changed — NavWrapper
- `src/components/global/NavWrapper.tsx`: migrated from raw `sanityClient.fetch()`
  to live `sanityFetch` so the navigation categories update in real time

#### Changed — Music Detail Pages
- `src/app/(music)/albums/[slug]/page.tsx`
- `src/app/(music)/lyrics/[slug]/page.tsx`
- `src/app/(music)/music-artists/[slug]/page.tsx`
  - Removed `'use cache'` / `cacheTag` / `cacheLife` wrappers (from `next/cache`)
  - Replaced direct `sanityClient.fetch()` calls with live `sanityFetch`
  - Live API handles cache invalidation via EventSource; per-function caching
    was redundant and prevented real-time updates

#### Not Changed (intentional)
- `generateStaticParams()` in all dynamic routes — continues to use direct
  `sanityClient.fetch()` to avoid `draftMode()` during static generation
- `src/components/global/Ticker.tsx` — client component; cannot use server-side
  `sanityFetch`; polling via direct client call is retained
- Metadata utility functions — run at build/revalidation time, direct calls appropriate

---

### Schema-to-UI Data Pass + Site Config (2026-03-14)

#### Queries — Bug Fixes
- Fix `queryEventBySlug`: `tag[]->` → `eventTag[]->` — was silently returning null for all event tags
- Fix `queryAllAuthors`: remove nonsensical `author->` self-reference; correct sort to `order(order desc)`

#### Queries — New Fields
- `queryLiveEvents` (current events listing): add `endDate`, `eventStatus`, `mainImage`, `subtitle`, `videoLink` — homepage `LiveWidget` now receives full event data
- `queryArticleBySlug`: add `reviewedBy->{ name, slug, title, image }` and explicit `corrections` field

#### Article Detail Page (`articles/[slug]`)
- Render **Reviewed By** link in byline when `reviewedBy` is set
- Render **Corrections** notice block (red left-border alert) above article body when the field has content
- Render **Sources** list with external links after article body
- Render **FAQs** definition list after sources — surfaces structured Q&A already powering FAQPage JSON-LD

#### Live Event Detail Page (`live-event/[slug]`)
- Render `subtitle` below the event title
- Render `eventStatus` badge: red for Cancelled, amber for Postponed, blue for Moved Online (no badge for Scheduled)
- Render `endDate` alongside start date in the header
- Fix JSON-LD `eventStatus`: now maps from CMS `eventStatus` field to correct `schema.org` URL instead of hardcoding based on `isCurrentEvent`

#### Category Page (`category/[slug]`)
- Fetch category object in parallel with articles (single extra query, no waterfall)
- Render category `title` as `<h1>` and `description` above the article grid
- Fix typo in container class: `95wv` → `95vw`

#### TypeScript Types (`types.d.ts`)
- Add `endDate?: string` to `LiveEvent` interface
- Add `eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed' | 'EventMovedOnline'` to `LiveEvent` interface

#### Social Media — Account Updates
- YouTube: `@UnTelevised` → `@AntiWarTV` (banned, new account)
- TikTok: `@untelevisedmedia` → `@radical.edward` (banned, new account)
- Updated in: `Footer.tsx`, `Socials.tsx`, `GlobalStructuredData.tsx` (sameAs array — TikTok also added)

#### Email — Domain Migration
- `newsroom@untelevised.live` → `newsroom@untelevised.media` (all 5 footer contact links)
- `UnTelevisedMedia.Live@gmail.com` → `support@untelevised.media` (donate page + support page)
- Addresses to provision: `newsroom@untelevised.media`, `support@untelevised.media`

#### Live News Banner
- Remove `<Banner />` from `(user)/layout.tsx` — was appearing on every page
- Add `<Banner />` to top of `(user)/page.tsx` — now homepage-only

#### Project Docs
- Add `.project/email-addresses.md` — inventory of all hardcoded email addresses with file locations and purpose

---

### Audit — Second Pass (2026-03-13)

Full second-pass audit against Next.js, Sanity, SEO/AEO, and Vercel/React best-practice skills. All prior items confirmed complete. New open items surfaced and logged in `.project/planning/audit/` and `.project/planning/checklist.md`.

#### Open — P2
- `notFound()` missing on 6 dynamic routes: `author/[slug]`, `live-event/[slug]`, `albums/[slug]`, `lyrics/[slug]`, `music-artists/[slug]`, `category/[slug]` — all currently return inline "not found" divs instead of triggering the proper Next.js 404 mechanism
- JSON-LD `MusicAlbum` structured data missing from `albums/[slug]`
- JSON-LD `MusicComposition` structured data missing from `lyrics/[slug]`
- JSON-LD `MusicGroup`/`Person` structured data missing from `music-artists/[slug]`
- `albums/[slug]` `generateMetadata` emits `keywords` as a template-literal string instead of `string[]`

#### Open — P3
- JSON-LD `ItemList`/`CollectionPage` structured data missing from `timeline/[slug]`
- JSON-LD `CollectionPage` structured data missing from `category/[slug]`

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

### Sanity Schema — Live Event Keywords

- Migrate `liveEvent.keywords` field from `type: 'string'` → `type: 'array'` of strings with tags layout (consistent with article keywords)
- Create `migrations/liveEvent-keywords-string-to-array/index.ts` — splits existing comma-separated strings into arrays on migration run; skips documents already holding an array
- Update `buildLiveEventMetadata` in `src/util/metadata.ts` — use keywords array directly, remove `.split(',')` splitting
- Update `generateLiveEventMetadata` in `src/util/metadata/generateLiveEventMetadata.ts` — same array-aware fix

---

### Production Data Migrations

- Run `keywords-string-to-array` against `articles` dataset — 41 documents scanned, 25 article documents patched (keywords field converted from comma-separated string to array)
- Run `liveEvent-keywords-string-to-array` against `articles` dataset — 5 liveEvent documents scanned and patched

---

### SEO & Metadata — seoObject Override Wiring

- Wire `seo.metaTitle`, `seo.metaDescription`, `seo.canonicalUrl`, `seo.ogImage` overrides into `buildLiveEventMetadata` — per-event Studio overrides now take precedence over computed defaults
- Wire `seo` overrides into `buildCategoryMetadata` — per-category Studio SEO fields now applied
- Wire `seo` overrides into `generateMetadata` for `/lyrics/[slug]` — `song.seo?.metaTitle ?? computedTitle` pattern
- Wire `seo` overrides into `generateMetadata` for `/music-artists/[slug]` — same pattern
- Wire `seo` overrides into `generateMetadata` for `/albums/[slug]` — same pattern
- Add `seo` field to `queryCategoryBySlug` GROQ projection — was previously not returned from Sanity

---

### TypeScript Types

- Add `SeoOverride` interface to `types.d.ts` — shared type with `metaTitle?`, `metaDescription?`, `ogImage?`, `noIndex?`, `canonicalUrl?` fields
- Add `seo?: SeoOverride` to `LiveEvent`, `Category`, `MusicArtist`, `Album`, `Song` global interfaces
- Correct `Article.keywords` type from `string` → `string[]` in `types.d.ts` (was mismatched with schema)
- Correct `LiveEvent.keywords` type from `string` → `string[]` in `types.d.ts`

---
