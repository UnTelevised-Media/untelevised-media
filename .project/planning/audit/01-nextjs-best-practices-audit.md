# Plan: Next.js Best Practices Audit & Upgrades

> Status: RE-AUDITED — 2026-03-13 Most items complete. Remaining open items listed below.

---

## ✅ COMPLETED

| Item | Notes |
| --- | --- |
| Font loading duplication | Geist fonts removed; body uses `inter.className` only |
| Server-hoist logo | `HeaderLogo` server component; passed as `logoSlot` prop to client Header |
| `generateStaticParams` on music routes | lyrics, music-artists, albums — all have `generateStaticParams` |
| `use cache` directive on music routes | All 3 music dynamic routes use `'use cache'` + `cacheTag` + `cacheLife` |
| Suspense on homepage | `FeaturedStoriesGrid` and hero wrapped in Suspense |
| Async params pattern | All dynamic routes verified |
| `keywords` field migrated to array | Article schema uses array + tags layout |
| Static page metadata | about, staff, donate, support — all have `export const metadata` |
| Metadata via layout.tsx | secure-contact, whistleblower, join — use layout.tsx pattern |
| TypeGen | `sanity.types.ts` generated at project root (59 queries, 50 types) |

---

## ❌ OPEN — Still Pending

### 1. `generateStaticParams` in articles uses raw `sanityClient`

**File:** `src/app/(user)/articles/[slug]/page.tsx` line ~282 **Current state:** `generateStaticParams` calls `sanityClient.fetch` — bypasses the ISR tag system. **Fix:** Replace with `sanityFetch` to keep CDN cache consistent with tag-based revalidation.

---

### 2. LQIP blur placeholders not implemented

**Current state:** `plaiceholder` package is installed but never used. No `blurDataURL` on any `<Image>` component. Layout shift (bad CLS) occurs on image load. **Fix (low-cost Sanity approach):**

```tsx
<Image
  placeholder="blur"
  blurDataURL={urlForImage(image).width(20).url()}
  ...
/>
```

Apply to: article cards, homepage hero, author photos, event images.

---

### 3. NEW: `og-default.png` → `og-default.png` mismatch

**Files with stale `.jpg` reference:**

- `src/util/metadata.ts` line 10 — `DEFAULT_OG_IMAGE` constant
- `src/app/(music)/lyrics/[slug]/page.tsx` line 45 — fallback OG image
- `src/app/(music)/music-artists/[slug]/page.tsx` line 46 — fallback OG image
- `src/app/(music)/albums/[slug]/page.tsx` line 48 — fallback OG image

**Root `layout.tsx` is correct** — uses `og-default.png`. **Fix:** Update all 4 files to use `og-default.png`.

---

### 4. Barrel file audit — `src/components/global/`

**Current state:** `src/components/ads/` has a barrel `index.ts`. `src/components/global/` does **not** have one (imports are direct). **Action:** Audit whether barrel files are causing unnecessary bundling. For components that aren't always needed, prefer direct imports over barrel exports. Decide: add barrel or keep direct imports consistently.

---

### 5. `trailingSlash: true` canonical URL consistency

**File:** `next.config.ts` — `trailingSlash: true` **Current state:** Root layout and sitemap use trailing slashes. Spot-check that all structured data `@id` URLs and `alternates.canonical` values consistently use trailing slashes. **Spot check:** `NewsArticleStructuredData` `@id` field, `GlobalStructuredData`.

---

## Summary Table (remaining)

| Issue                                              | Priority | Impact       | Effort |
| -------------------------------------------------- | -------- | ------------ | ------ |
| `og-default.png` → `.png` fix (4 files)            | P1       | Medium       | 15 min |
| `generateStaticParams` → `sanityFetch` in articles | P2       | Low-Med      | 30 min |
| LQIP blur placeholders                             | P2       | Medium (CLS) | 2 hrs  |
| Barrel file audit (global/)                        | P3       | Low-Med      | 1 hr   |
| trailingSlash audit on structured data             | P3       | Low          | 30 min |
