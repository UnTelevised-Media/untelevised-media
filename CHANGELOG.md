# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Performance

#### P1 — Bundle Size / Waterfalls
- Remove unused `categories` fetch from homepage `Promise.all` — eliminates one extra Sanity round-trip on every homepage load
- Defer `CookieConsentBanner` and `AdBlockerMessage` (framer-motion) via `next/dynamic` with `ssr: false` — removes framer-motion from the initial JS bundle on every page
- Defer `TimelineJSVisualization` (framer-motion) via `next/dynamic` on timeline pages — only loads when a timeline page is visited
- Defer `react-tweet` `Tweet` component and `react-syntax-highlighter` `Prism` via `next/dynamic` in `RichTextComponents` — only loaded when article body contains those block types

### Added
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

### Fixed
- Update `next-sanity` v12 import paths: `VisualEditing` now from `next-sanity/visual-editing`, `defineLive` now from `next-sanity/live`
- Replace boilerplate "Next.js 15 Boilerplate" root layout metadata with UnTelevised Media branding
- Replace inline `notFound()` div fallback with proper `notFound()` from `next/navigation` in `/articles/[slug]`
- Fix `StructuredData.tsx` — replace `next/script` with plain `<script>` tags for inline JSON-LD (correct RSC pattern)
- Fix `sitemap.ts` — homepage priority `0.3` → `1.0`, article priorities now recency-based (`0.8/0.6/0.4`), live events `0.9`, all URLs use trailing slashes, added missing static pages (`/about/`, `/staff/`, `/donate/`, `/past-events/`)
- Fix `robots.ts` — add `Disallow: /api/`, fix `BASEURL` with fallback to `NEXT_PUBLIC_APP_URL` then hardcoded production URL, explicitly allow all major AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, anthropic-ai, cohere-ai)

---
