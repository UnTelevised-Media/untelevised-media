# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
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

---
