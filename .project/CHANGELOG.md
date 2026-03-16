# UnTelevised Media — Changelog

> Format: [Semantic Versioning](https://semver.org/) · Dates in YYYY-MM-DD

---

## [Unreleased]

### Added
- RSS Feed (`/feed.xml`) — RSS 2.0 route handler with articles + live events, auto-discovery link in root layout metadata (PR #30, Issue #9)
- Breaking News Banner — editor-controlled site-wide alert strip via Sanity siteSettings singleton; instant live updates via SanityLive; session-dismissible (PR #31, Issue #12)
- Reading Time Estimate — auto-calculated from Portable Text body on article detail pages and article cards; GROQ `wordCount` projection for card efficiency (PR #32, Issue #20)
- Source Transparency Panel — pending (Issue #24)

### Changed
- Sitemap completion: added `/timelines`, `/join`, `/support`, `/secure-contact`, `/whistleblower` static pages; added dynamic timeline individual pages; added `wordCount` to article queries (PR #29, Issue #16)
- `robots.ts`: added `Disallow` for `/privacy-settings`, `/reading-list`, `/unlock`; explicit `Allow: /feed.xml` (PR #29, Issue #16)
- `privacy-settings/layout.tsx`: added `noindex` metadata to prevent search indexing of user preference page (PR #29, Issue #16)

### Removed
- All debug routes, components and API endpoint — deleted `src/components/debug/` (6 components), `/timeline-debug`, `/timeline-simple-test` routes, `/api/debug-log` endpoint; removed unconditional AdDebugger render from music layout (PR #28, Issue #15)
- Decorative `Banner` component removed from homepage (consolidated into PR #31 work)

---

## [2.2.1] — 2026-03-16

### Fixed
- AdSense article page slot IDs updated to verified ad units
- `notFound()` fixes on article/category/timeline pages
- Music/category/timeline JSON-LD structured data improvements

---

## [2.2.0] — 2026-03-15

### Added
- Full AdSense/GTM/Analytics audit and setup documentation (`ADSENSE-SETUP.md`)
- Consent-aware analytics with GDPR compliance

---

_Older entries pre-date this changelog. See git history for full record._
