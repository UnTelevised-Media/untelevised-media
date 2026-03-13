# Plan: SEO & AEO Audit — UnTelevised Media

> Status: RE-AUDITED — 2026-03-13 Nearly all high/medium items complete. Remaining items listed below.

---

## ✅ COMPLETED

| Item | Notes |
| --- | --- |
| Static page metadata — about, staff, donate, support | All have `export const metadata` |
| Static page metadata — secure-contact, whistleblower, join | Done via `layout.tsx` pattern |
| Static page metadata — lyrics index, music-artists index | `export const metadata` present |
| `dateModified` from `updatedAt` in structured data | `NewsArticleStructuredData` uses `article.updatedAt` |
| `updatedAt` displayed in UI | Article page shows "Updated: {date}" near byline when different from publishedAt |
| Author `Person` structured data | `author/[slug]/page.tsx` renders JSON-LD with `@type: 'Person'` |
| FAQ schema — `faqs[]` in article schema | Field added; `FAQPage` structured data in `NewsArticleStructuredData` |
| Related articles section | `relatedArticles[]->` in GROQ query; rendered at end of article body |
| `leadParagraph` field | Added to article schema + included in `queryArticleBySlug` |
| OG default fallback image | `og-default.png` added to `/public/` |
| `keywords` → array (article) | Article schema migrated; `buildArticleMetadata` passes array directly |
| AEO: `queryArticleBySlug` expanded | Includes `seo`, `faqs`, `sources`, `updatedAt`, `leadParagraph`, `relatedArticles` |
| Dynamic OG image generation | N/A — user opted for static `og-default.png` instead |

---

## ❌ OPEN — Still Pending

### 1. `og-default.png` reference stale in metadata utility and music pages

**Files:** (details in audit #01, issue #3)

- `src/util/metadata.ts` — `DEFAULT_OG_IMAGE` constant still uses `.jpg`
- 3 music dynamic pages — fallback OG images still use `.jpg` URL

---

### 2. `liveEvent.keywords` is still a plain `string`

**File:** `src/models/schema/liveEvent.ts` line 80–83 **Current state:** `type: 'string'` — inconsistent with article schema which is now `array`. **File:** `src/util/metadata.ts` line 84–86 — `buildLiveEventMetadata` still does `.split(',')`. **Fix:** Migrate liveEvent keywords to array (same pattern as article). Create migration script, update schema, update metadata handler.

---

### 3. `seoObject` on remaining content types — verify surfaced in metadata

**Status:** `seoObject` field was added to all schema types (liveEvent, category, musicArtist, album, song). However, `generateMetadata` for live-event, category, and music pages may not be reading `seo.title`/`seo.description` overrides from this field yet. **Action:** Check that `generateMetadata` in each dynamic route reads `seo.title` and `seo.description` if present, falling back to computed values.

---

## IMPLEMENTATION PRIORITY (remaining)

| Priority | Task | Impact | Effort |
| --- | --- | --- | --- |
| P1 | `og-default.png` → `.png` in 4 files | Medium | 15 min |
| P2 | `liveEvent.keywords` → array + migration | Medium | 1 hr |
| P2 | Wire `seo.*` overrides into `generateMetadata` for music/event pages | Medium | 1 hr |
