# Plan: Next.js Best Practices Audit & Upgrades

> Status: APPROVED — Implement all fixes across the entire app.
> Skill reference: `.claude/skills/next-best-practices/`

---

## Summary of Findings

After auditing the codebase against Next.js 15 best practices, the following issues were identified. They are grouped by severity.

---

## CRITICAL — Fix First

### 1. Article pages missing `generateMetadata()`

**File:** `src/app/(user)/articles/[slug]/page.tsx`
**Issue:** No `generateMetadata` export — every article page shares the same generic metadata from the root layout ("Next.js 15 Boilerplate"). This is catastrophic for SEO.
**Fix:** Add `generateMetadata` that fetches the article by slug and returns:
- `title`: article title (50–60 chars)
- `description`: article description (150–160 chars)
- `openGraph.images`: article mainImage at 1200×630
- `openGraph.type`: `'article'`
- `alternates.canonical`: full article URL
- Note: use `stega: false` in the sanityFetch call inside `generateMetadata`

**Applies to:**
- `articles/[slug]/page.tsx`
- `live-event/[slug]/page.tsx`
- `author/[slug]/page.tsx`
- `category/[slug]/page.tsx`
- `lyrics/[slug]/page.tsx`
- `music-artists/[slug]/page.tsx`
- `albums/[slug]/page.tsx`

---

### 2. Root layout metadata is boilerplate placeholder

**File:** `src/app/layout.tsx` (root) and `src/app/(user)/layout.tsx`
**Issue:** Metadata is still the template defaults ("Next.js 15 Boilerplate", "Your Name"). Must be replaced with UnTelevised Media branding.
**Fix:**
```ts
metadata: {
  title: { default: 'UnTelevised Media', template: '%s | UnTelevised Media' },
  description: 'Independent journalism covering breaking news, live events, and investigative reporting that mainstream media won\'t touch.',
  authors: [{ name: 'UnTelevised Media Editorial Team' }],
  creator: 'UnTelevised Media',
  openGraph: { siteName: 'UnTelevised Media', ... },
  twitter: { site: '@untelevised', ... }
}
```

---

### 3. No `generateStaticParams` on most dynamic routes

**Issue:** Only `/articles/[slug]` has `generateStaticParams`. All other dynamic routes (`/live-event/[slug]`, `/author/[slug]`, `/category/[slug]`, `/lyrics/[slug]`, `/music-artists/[slug]`, `/albums/[slug]`) render dynamically on every request.
**Fix:** Add `generateStaticParams` to each, mirroring the article page pattern but using the correct GROQ query.

---

## HIGH — Fix Soon

### 4. Missing Suspense boundaries around client data

**File:** `src/app/(user)/page.tsx`
**Issue:** `LiveWidget` is wrapped in Suspense (good), but the hero article and breaking news sidebar are not — they block the entire page render. A slow Sanity fetch delays the whole homepage.
**Fix:** Extract `HeroSection` and `BreakingNewsSidebar` as separate async server components wrapped in `<Suspense fallback={<Skeleton />}>`.

---

### 5. `generateStaticParams` in articles uses raw `sanityClient` instead of `sanityFetch`

**File:** `src/app/(user)/articles/[slug]/page.tsx` line 217
```ts
const slugs = await sanityClient.fetch(query);  // bypasses ISR tag system
```
**Fix:** Use `sanityFetch` consistently so CDN cache is properly managed.

---

### 6. `article` schema missing `location` field

**File:** `src/models/schema/article.ts`
**Issue:** The article page renders `article.location` but it's not defined in the Sanity schema. This works by accident (Sanity returns all fields) but should be explicit.
**Fix:** Add location where missing. 
---

### 7. `keywords` field is a plain `string` not an `array`

**File:** `src/models/schema/article.ts`
**Issue:** `keywords` is a single string. Google's metadata `keywords` takes an array. When used in `generateMetadata`, it must be split.
**Fix (schema):** keep as string and split on commas in `generateMetadata`.

---

## MEDIUM — Quality Improvements

### 8. `not-found.tsx` should be added to dynamic route segments

**Issue:** If an article slug doesn't exist, the page renders a custom "not found" message inside the component, not the proper 404 page. Should use `notFound()` from `next/navigation`.
**File:** `src/app/(user)/articles/[slug]/page.tsx` line 33

```ts
// Current (wrong):
if (!article) { return <div>Article Not Found</div> }

// Correct:
import { notFound } from 'next/navigation'
if (!article) notFound()
```

---

### 9. Async params pattern (Next.js 15)

**File:** `src/app/(user)/articles/[slug]/page.tsx`
**Issue:** Uses `params: Promise<{ slug: string }>` pattern correctly (good!) but `generateStaticParams` returns `slugs.map(slug => slug.slug.current)` — it should return `{ slug: string }` objects.
**Current (partially wrong):**
```ts
return slugRoutes.map((slug) => ({ slug }))
// This is correct — just ensure the type is right
```
Check all other dynamic pages for the `await params` pattern.

---

### 10. Image `priority` prop missing on hero images

**File:** `src/app/(user)/page.tsx`
**Issue:** The homepage hero article image (`FeaturedArticleCard`) likely does not have `priority={true}`. This image is the LCP element — it must be prioritized for Core Web Vitals.
**Fix:** Pass `priority` prop to the LCP image on each page.

---

### 11. Image `sizes` attribute missing

**Issue:** Most `next/image` usages don't specify `sizes`. This causes the browser to download a full-resolution image even on mobile.
**Fix:** Add responsive `sizes` to all article card images:
```tsx
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
```

---

### 12. `experimental.typedRoutes` disabled

**File:** `next.config.ts`
**Note:** `typedRoutes: true` is commented out. This provides compile-time checking of all `href` values. Safe to enable with no breaking changes.

---

## LOW — Nice to Have

### 13. `next/script` should be used for all third-party scripts

**Current:** Some structured data components use `<Script>` (correct), but the StructuredData components should use `<script>` tags (plain HTML inside RSC) not `next/script`, since `next/script` is for third-party loading strategies, not inline JSON-LD data. Inline JSON-LD is fine in `<script type="application/ld+json">` directly.

### 14. Font loading duplication

**File:** `src/app/layout.tsx`
**Issue:** Three fonts loaded (Geist Sans, Geist Mono, Inter) but only Inter is applied to body via `className`. Geist variables are set but Inter visually wins. Need to unify or pick one system.

### 15. `trailingSlash: true` may conflict with canonical URLs

**File:** `next.config.ts`
**Issue:** `trailingSlash: true` means `/articles/slug` redirects to `/articles/slug/`. All canonical URLs in structured data and `generateMetadata` must consistently use trailing slashes. Currently the sitemap uses trailing slash URLs — good. Verify structured data URLs match.
