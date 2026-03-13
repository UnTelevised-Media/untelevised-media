# Plan: Performance & React Best Practices

> Status: IN PROGRESS — P1/P2 shipped in Issue #3. Remaining items below.
> Last audited: 2026-03-13

---

---

## OPEN — Still Pending

### Suspense boundaries on homepage

**File:** `src/app/(user)/page.tsx`
**Current state:** `LiveWidget` in Suspense. `FeaturedStoriesGrid` (~line 168) **not** wrapped — blocks full page render on slow Sanity fetch.
**Fix:**
```tsx
<Suspense fallback={<GridSkeleton count={6} />}>
  <FeaturedStoriesGrid articles={featuredStories} />
</Suspense>
```
Consider extracting each homepage section as a separate async server component for full streaming.

---

### LQIP blur placeholders

**Current state:** `plaiceholder` is installed but never used. All images load without blur placeholder — causes layout shift (bad CLS).
**Fix (low-cost Sanity approach):**
```tsx
<Image
  placeholder="blur"
  blurDataURL={urlForImage(image).width(20).url()}
  ...
/>
```
Apply to: article cards, homepage hero, author photos, event images.

---

### `generateStaticParams` in articles uses raw `sanityClient`

**File:** `src/app/(user)/articles/[slug]/page.tsx:219`
**Current state:** `sanityClient.fetch` — bypasses ISR tag system.
**Fix:** Replace with `sanityFetch` for consistent CDN cache management.

---

### Direct imports — barrel file audit

**Issue:** Imports like `import { RectangleAd, BannerAd } from '@/components/ads'` use barrel files. May prevent tree-shaking.
**Action:** Audit `@/components/ads`, `@/components/global`, `@/components/consent` barrel index files. Consider direct imports for components that aren't always needed.

---

### Server-hoist logo in `Header.tsx`

**File:** `src/components/global/Header.tsx`
**Issue:** `Header` is a client component. Logo `<Image>` re-renders on every client interaction.
**Fix (pattern: server-hoist-static-io):** Extract logo as a separate server component passed as a child/slot to the client Header.

---

### `use cache` directive (Next.js 16)

**Current state:** All Sanity fetches use tag-based ISR (`revalidateTag`). The `use cache` directive is available in Next.js 16.1.6 for fine-grained cache control per function.
**Future plan:**
```ts
async function getArticle(slug: string) {
  'use cache'
  cacheTag('article', `article-${slug}`)
  cacheLife('hours')
  return sanityClient.fetch(queryArticleBySlug, { slug })
}
```
**Note:** Requires `experimental.cacheLife` config. Investigate compatibility with current setup.

---

## Summary Table (remaining work)

| Issue | Priority | Impact | Effort |
|-------|----------|--------|--------|
| Suspense on FeaturedStoriesGrid | P1 | High | 1 hr |
| LQIP blur placeholders | P2 | Medium (CLS) | 2 hrs |
| `generateStaticParams` → `sanityFetch` in articles | P2 | Low-Med | 30 min |
| Direct imports (barrel file audit) | P3 | Low-Med | 1 hr |
| Server-hoist logo | P3 | Low | 1 hr |
| `use cache` directive migration | P4 | Medium | 3 hrs |
