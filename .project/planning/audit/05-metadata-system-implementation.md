# Plan: Metadata System — Complete Implementation

> Status: RE-AUDITED — 2026-03-13 Core system complete. A few cleanup items and one new bug remain.

---

## Overview

This is the concrete implementation checklist for the metadata system. It tracks _how_ each item was or will be implemented, as a companion to `02-seo-aeo-audit.md`.

---

## ✅ COMPLETED

| Item | Notes |
| --- | --- |
| `dateModified` in `NewsArticleStructuredData` | Uses `article.updatedAt`; `dateModified` wired correctly |
| `updatedAt` displayed in article UI | "Updated: {date}" shown near byline when `updatedAt !== publishedAt` |
| Static page metadata — about, staff, donate, support | `export const metadata` in each page |
| Static page metadata — secure-contact, whistleblower, join | Done via `layout.tsx` in each route |
| Static page metadata — lyrics (index), music-artists (index) | `export const metadata` present |
| `/public/og-default.png` | Added by user; referenced in root `layout.tsx` |
| Author `Person` structured data | `author/[slug]/page.tsx` renders JSON-LD `@type: 'Person'` |
| FAQ schema + `FAQPage` structured data | `faqs[]` in article schema; `NewsArticleStructuredData` emits `FAQPage` |
| Related articles section | `relatedArticles[]->` in GROQ + rendered at end of article body |
| `queryArticleBySlug` expanded | Includes: `seo`, `faqs`, `sources`, `updatedAt`, `leadParagraph`, `relatedArticles` |
| `keywords` as array in article metadata | `buildArticleMetadata` uses `article.keywords` array directly |
| TypeGen | `sanity.types.ts` generated; 59 queries, 50 types |
| Dynamic OG image | N/A — user chose static `og-default.png` instead |

---

## ❌ REMAINING

### P1: `og-default.png` reference in 4 files (BUG — file is `.png`)

The file added to `/public/` is `og-default.png`, but four files still reference `.jpg`:

| File                                            | Line | Fix                                 |
| ----------------------------------------------- | ---- | ----------------------------------- |
| `src/util/metadata.ts`                          | 10   | `og-default.png` → `og-default.png` |
| `src/app/(music)/lyrics/[slug]/page.tsx`        | 45   | same                                |
| `src/app/(music)/music-artists/[slug]/page.tsx` | 46   | same                                |
| `src/app/(music)/albums/[slug]/page.tsx`        | 48   | same                                |

**Root `layout.tsx` is already correct** — only the 4 files above need updating.

---

### P2: `liveEvent.keywords` string → array migration

**Schema:** `src/models/schema/liveEvent.ts` — `keywords` is still `type: 'string'` **Metadata:** `src/util/metadata.ts` `buildLiveEventMetadata` — still does `.split(',')` **Fix:** Migrate liveEvent keywords to array (same pattern as article keywords migration).

---

### P2: `seoObject` field overrides not read in `generateMetadata`

**Files:** music dynamic pages, live-event dynamic page, category page **Current state:** `seoObject` was added to all schemas but `generateMetadata` in each dynamic route likely doesn't read `seo.title`/`seo.description` yet. **Fix:** In each dynamic route's `generateMetadata`, prefer `data.seo?.title ?? computedTitle` pattern.

---

### P3: Run keywords migration against production

**Script:** `migrations/keywords-string-to-array/index.ts` — exists but not confirmed run against production content.

```bash
pnpm sanity migration run keywords-string-to-array --dry-run
pnpm sanity migration run keywords-string-to-array
```
