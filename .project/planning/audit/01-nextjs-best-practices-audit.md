# Plan: Next.js Best Practices Audit & Upgrades

> Status: IN PROGRESS — Issues #2 (SEO) and #3 (Performance) merged to `development`. Remaining items below.
> Last audited: 2026-03-13

---

---

## OPEN — Still Pending

### 3. No `generateStaticParams` on music dynamic routes

**Status:** `lyrics/[slug]`, `music-artists/[slug]`, `albums/[slug]` page files do not exist yet — these routes are either not built or are placeholders. Once built, add `generateStaticParams` following the article page pattern.

---

### 4. Missing Suspense boundaries around homepage sections

**File:** `src/app/(user)/page.tsx`
**Current state:** `LiveWidget` is in Suspense. Hero section may have partial Suspense. `FeaturedStoriesGrid` at line ~168 is **not** in Suspense — blocks full page render.
**Fix:** Wrap `FeaturedStoriesGrid` and any remaining non-suspended sections:
```tsx
<Suspense fallback={<GridSkeleton count={6} />}>
  <FeaturedStoriesGrid articles={featuredStories} />
</Suspense>
```

---

### 5. `generateStaticParams` in articles uses raw `sanityClient`

**File:** `src/app/(user)/articles/[slug]/page.tsx` line 219
**Current state:** Still uses `sanityClient.fetch` — bypasses ISR tag system.
**Fix:** Replace with `sanityFetch` to keep CDN cache consistent.

---

### 6. `keywords` field is a plain `string` not an `array`

**File:** `src/models/schema/article.ts`
**Status:** Schema plan (#03) specifies changing to array with tags layout. Not yet migrated. Requires content migration script (split on commas).

---

### 9. Async params pattern (Next.js 15)

**Status:** Articles page uses correct `await params` pattern. Verify all other dynamic routes (`live-event`, `author`, `category`) also use `Promise<{ slug: string }>`.

---

### 14. Font loading duplication

**File:** `src/app/layout.tsx`
**Status:** Three fonts loaded (Geist Sans, Geist Mono, Inter). Inter wins visually via `inter.className`. Geist variables set but not the primary font. Decide: pick one system or intentionally use both. No change made yet.

---

### 15. `trailingSlash: true` canonical URL consistency

**File:** `next.config.ts`
**Status:** Sitemap uses trailing slashes (fixed in #2). Verify all structured data `@id` URLs and `alternates.canonical` values consistently use trailing slashes. Spot-check `NewsArticleStructuredData` and `GlobalStructuredData`.

---

### NEW: Static page metadata incomplete

**Current state:** `past-events/page.tsx` has `export const metadata`. `about`, `staff`, `donate` pages are missing metadata exports.
**Fix:** Add `export const metadata` to each. See `02-seo-aeo-audit.md` table for suggested titles.

---

### NEW: LQIP blur placeholders not implemented

**Status:** `plaiceholder` package is installed but unused. No `blurDataURL` on any image. Layout shift occurs on image load.
**Fix:** Use Sanity LQIP pattern (low-cost):
```ts
blurDataURL={urlForImage(image).width(20).url()}
placeholder="blur"
```
Or use `getPlaiceholder` for richer base64 previews.
