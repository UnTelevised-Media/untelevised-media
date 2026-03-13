
# Plan: SEO & AEO Audit — UnTelevised Media

> Status: IN PROGRESS — Critical metadata and structured data shipped in Issue #2. Remaining items below.
> Last audited: 2026-03-13

---

---

## OPEN — Still Pending

### Metadata: Static pages missing `export const metadata`

| Page | Suggested Title | Status |
|------|-----------------|--------|
| `/about` | About UnTelevised Media | ❌ Missing |
| `/donate` | Support Independent Journalism | ❌ Missing |
| `/staff` | Our Team — UnTelevised Media | ❌ Missing |
| `/past-events` | Past Events Coverage Archive | ✅ Done |
| `/lyrics` | Music Lyrics — UnTelevised | Not verified |
| `/secure-contact` | Secure Contact — UnTelevised | Not verified |

---

### Structured Data: FAQ schema

**Opportunity:** `faqs[]` field has been planned in schema (Plan #3) but not yet added to schema or rendered as `FAQPage` structured data. High-value for AI citation.

---

### Structured Data: Author Person schema

**File:** `src/app/(user)/author/[slug]/page.tsx`
**Status:** Author page has `generateMetadata` but no `Person` schema.org structured data. Plan (#5 Step 6) documented the implementation. Not yet shipped.

---

### AEO: Related Articles section

**Current state:** No related articles displayed on article pages.
**Impact:** Improves crawl depth, time on site, AI content relationship understanding.
**Plan:** Add `relatedArticles[]->` to article GROQ query, render at end of article body.

---

### AEO: OG image dynamic generation

**Current state:** OG images come from Sanity image assets resized via URL builder. No branded template.
**Option A (quick):** Ensure `/public/og-default.jpg` exists as branded fallback (1200×630).
**Option B (full):** Use `next/og` (ImageResponse) at `src/app/(user)/articles/[slug]/opengraph-image.tsx` for per-article branded OGs with title, author, category overlay.

---

### AEO: Keywords as array

**Current state:** `keywords` in article schema is a `string`. Should be `string[]` for proper metadata and content tagging.
**Requires:** Content migration script (split on commas). See Plan #3.

---

### AEO: `updatedAt` / `dateModified` surface in UI

**Current state:** `updatedAt` field added to schema but not yet displayed on article pages or included in `dateModified` of NewsArticle structured data.
**Fix:** Add "Updated: {date}" near byline when `updatedAt > publishedAt`, and wire `dateModified` into `NewsArticleStructuredData`.

---

### AEO: `leadParagraph` field for AI extraction

**Status:** Planned in schema (#3) but not yet added. Low effort, high AEO value.

---

## IMPLEMENTATION PRIORITY (remaining work)

| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| P1 | Static page metadata (about, staff, donate) | Medium | 30 min |
| P1 | Wire `dateModified` into NewsArticle structured data | High | 30 min |
| P1 | Add `/public/og-default.jpg` branded fallback | Medium | 1 hr |
| P2 | Author `Person` structured data | Medium | 1 hr |
| P2 | FAQ schema (add `faqs[]` to article schema + FAQPage component) | High AEO | 2 hrs |
| P2 | Related articles section | Medium | 2 hrs |
| P2 | `leadParagraph` field on article schema | Medium AEO | 30 min |
| P3 | Dynamic OG image generation (`next/og`) | Medium | 3 hrs |
| P3 | `keywords` → array migration | Low-Med | 2 hrs |
