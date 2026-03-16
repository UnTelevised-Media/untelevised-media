# UnTelevised Media — Changelog

---

## 2026-03-16 — Sprint 1: Reading Time Estimates (Issue #20, PR #32)

### Added
- Reading Time Estimate — displayed on article detail pages, `FeaturedArticleCard`, featured stories grid, `ArticleCard`, and `RawFeed` items
  - `src/lib/readingTime.ts` — `estimateReadingTime(body, extras?)` at 200 wpm (standard average adult pace), minimum 1 min
  - Article detail page counts body + FAQ questions/answers + source labels via `extras` param
  - `readingTimeFromWordCount()` for card-level computation from GROQ-projected `wordCount`
  - `formatReadingTime()` returns `"N min read"`
  - `getReadingTime()` convenience wrapper
  - `"wordCount": length(string::split(pt::text(body), " "))` GROQ projection on `queryAllArticles` — actual word count (not char count)
  - `wordCount?: number` added to global `Article` type in `types.d.ts`

---

## 2026-03-15 — Audit Close-Out: notFound() + Music/Category/Timeline JSON-LD

### Fixed
- `notFound()` on `author/[slug]` — replaced inline "Author Not Found" div with proper `notFound()` call (HTTP 404 + `not-found.tsx`)
- `notFound()` on `live-event/[slug]` — added null guard after data fetch; page was casting null to `LiveEvent` and crashing at runtime
- `notFound()` on `albums/[slug]` — replaced inline "Album Not Found" div with `notFound()`
- `notFound()` on `lyrics/[slug]` — replaced inline "Song Not Found" div with `notFound()`
- `notFound()` on `music-artists/[slug]` — replaced inline "Artist Not Found" div with `notFound()`
- `notFound()` on `category/[slug]` — added null guard after data fetch
- `albums/[slug]` `keywords` metadata changed from template-string to `string[]` to match Next.js `Metadata` type and the article/liveEvent pattern

### Added
- JSON-LD `MusicAlbum` structured data on `albums/[slug]` — includes `byArtist`, `numTracks`, `datePublished`, `genre`, `image`, `url`
- JSON-LD `MusicComposition` structured data on `lyrics/[slug]` — includes `composer`, `inAlbum` (when available), `genre`, `image`, `url`
- JSON-LD `MusicGroup` structured data on `music-artists/[slug]` — includes `genre`, `sameAs` (all social links + website), `foundingLocation`, `image`, `url`
- JSON-LD `CollectionPage` structured data on `category/[slug]` — includes `name`, `description`, `url`, `publisher`
- JSON-LD `ItemList` structured data on `timeline/[slug]` — includes `numberOfItems` and `itemListElement` array with position + name for each event

---

## 2026-03-14 — Schema-to-UI Gap Pass + Query Fixes

### Fixed
- Article: `corrections`, `sources`, `faqs`, `reviewedBy` fields now rendered in article body
- Live event: `subtitle`, `eventStatus` badge, `endDate` rendered on event page
- Category: `description` rendered on category pages
- `queryEventBySlug` — `tag[]->` corrected to `eventTag[]->` (broken field reference)
- `queryAllAuthors` — self-reference bug fixed

### Changed
- Live news banner restricted to homepage only (was appearing on all pages)
- Social links updated: YouTube → `@AntiWarTV`, TikTok → `@radical.edward`
- Email domain migration to `@untelevised.media`

---

## 2026-03-13 — Audit Pass: Static Params, Keywords, Metadata, Performance

### Fixed
- `generateStaticParams` → `sanityFetch` across all 10 dynamic routes
- `article.keywords` and `liveEvent.keywords` migrated string → array (schema + migration scripts; 25 articles + 5 liveEvents patched in production)
- Root `layout.tsx` OG reference updated `.jpg` → `.png`

### Added
- `generateMetadata` with full SEO overrides on all dynamic routes (articles, live events, categories, music pages, author, timelines)
- `SeoOverride` interface + `seo?` field on `LiveEvent`, `Category`, `MusicArtist`, `Album`, `Song`
- Author `Person` structured data on `author/[slug]`
- `Event` structured data on `live-event/[slug]`
- `FAQPage` structured data on articles with FAQ sections
- `NewsArticle` structured data on articles
- Static metadata on all static routes (about, staff, donate, support, secure-contact, whistleblower, join, lyrics index, music-artists index)
- LQIP blur placeholders on article, author, and homepage images
- `Suspense` boundary on `FeaturedStoriesGrid` (homepage)
- `siteSettings` singleton in Sanity Studio structure
- `og-default.png` in `/public/`
- Sanity TypeGen (`sanity.types.ts`) — 59 queries, 50 types

### Changed
- Server-hoisted `HeaderLogo` via `logoSlot` prop (eliminates client-side logo flash)
- Font loading cleaned up — Inter only, Geist removed
- Barrel file audit: `global/` direct imports; `ads/` + `consent/` barrels intentional

---

## 2026-03-12 — Ads Branch Merged (PR #1)

### Added
- Google AdSense integration via `next-google-adsense`
- `RectangleAd`, `BannerAd` components (`src/components/ads/`)
- GTM integration via `ConsentAwareAnalytics` (GDPR-gated)
- GDPR cookie consent + AdBlocker detection components
- Dev mode bypass for ad components
- `.env.example` with all env vars documented
- `ADSENSE-SETUP.md` — full AdSense/GTM/Analytics setup & diagnosis guide

### Fixed
- Consent-init `<Script>` moved inside `<head>` to fix hydration error
- AdSense slot IDs updated to verified ad units on article pages
