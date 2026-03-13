# Plan: Performance & React Best Practices

> Status: APPROVED — Implement all fixes across the entire app.
> Skill reference: `.claude/skills/vercel-react-best-practices/`, `.claude/skills/next-cache-components/`

---

## Priority Classification

Follows the Vercel React Best Practices skill priority order: Waterfalls → Bundle → Server → Client → Re-renders.

---

## CRITICAL — Waterfalls

### 1. Homepage data fetching is sequential (already partially fixed)

**File:** `src/app/(user)/page.tsx`
**Current state:** `getFrontPageData()` already uses `Promise.all` — this is correct.
```ts
const [liveEvents, articles, categories] = await Promise.all([...])
```
**Status:** ✅ Correct pattern in place.

**Remaining issue:** `categories` is fetched but never used in the page component. Remove from `Promise.all` to avoid wasted network call.

---

### 2. Article page has potential waterfall: two Sanity fetches could be combined

**File:** `src/app/(user)/articles/[slug]/page.tsx`
**Current state:** `getArticleBySlug` is one fetch. `generateStaticParams` uses `sanityClient.fetch` separately. At page render time there is only one fetch — this is fine.

**Future concern:** If related articles or author articles are added as separate fetch calls inside the article component, this creates a waterfall. Plan: fetch all needed article data in a single expanded GROQ query.

---

### 3. Missing Suspense streaming on homepage sections

**File:** `src/app/(user)/page.tsx`
**Current state:** Only `LiveWidget` is wrapped in `<Suspense>`. The hero article, breaking news, featured stories, and raw feed all block rendering until `getFrontPageData()` resolves.

**Fix:** Extract sections into async sub-components with Suspense boundaries to enable streaming:
```tsx
// Split into streamable sections:
<Suspense fallback={<HeroSkeleton />}>
  <HeroSection heroArticle={heroArticle} breakingNews={breakingNews} />
</Suspense>

<Suspense fallback={<GridSkeleton count={6} />}>
  <FeaturedStoriesGrid articles={featuredStories} />
</Suspense>
```

---

## CRITICAL — Bundle Size

### 4. Barrel file imports from components

**Issue:** Imports like `import { SidebarAd, AD_CONFIG } from '@/components/ads'` use barrel file exports. These can prevent tree-shaking.

**Check:** Audit all `@/components/ads`, `@/components/global`, etc. for barrel index files that re-export multiple components. Consider direct imports:
```ts
// Before:
import { SidebarAd, AD_CONFIG } from '@/components/ads'

// After:
import SidebarAd from '@/components/ads/SidebarAd'
import { AD_CONFIG } from '@/components/ads/config'
```

---

### 5. Heavy third-party dependencies — defer loading

Packages that should be dynamically imported or deferred:

| Package | Use | Action |
|---------|-----|--------|
| `framer-motion` | Animations | `next/dynamic` — only load if animations are on-screen |
| `react-player` | Video | `next/dynamic` with `{ ssr: false }` |
| `react-social-media-embed` | Social embeds | `next/dynamic` with `{ ssr: false }` |
| `react-tweet` / `react-twitter-embed` | Tweet embeds | `next/dynamic` with `{ ssr: false }` |
| `google-map-react` | Maps | `next/dynamic` with `{ ssr: false }` |

---

### 6. `styled-components` in bundle

**Issue:** `styled-components` is listed as a dependency but the codebase uses Tailwind CSS. This adds ~25–40KB to the bundle for nothing.

**Action:** Audit if `styled-components` is actually used anywhere:
```bash
grep -r "styled\." src/ --include="*.tsx" --include="*.ts"
```
If unused, remove from dependencies.

---

## HIGH — Server-Side Performance

### 7. Static hoisting of logo/brand assets

**Current state:** `Header.tsx` is a client component (`'use client'`). The logo Image component re-renders on every client interaction.

**Fix (pattern: `server-hoist-static-io`):** Extract the logo as a separate server component that renders once. Pass it as a child or slot to the client Header.

---

### 8. `React.cache()` for per-request deduplication

**Current state:** `sanityFetch` wraps the ISR fetch but if multiple components on the same page request the same data (e.g., organization settings), it triggers duplicate fetches.

**Fix:** Wrap commonly-reused fetches in `React.cache()`:
```ts
import { cache } from 'react'

export const getOrganizationSettings = cache(async () => {
  return sanityFetch({ query: querySiteSettings, tags: ['siteSettings'] })
})
```

---

### 9. Implement `use cache` directive for Sanity fetches (Next.js 15+)

**Current state:** All Sanity fetches use tag-based ISR (`revalidateTag`). This is correct for Next.js 15 but could benefit from `use cache` for fine-grained control.

**Note:** `use cache` requires `cacheComponents: true` in `next.config.ts`. This is a Next.js 16 feature — check if current Next.js 15.4.5 supports it as experimental.

**Future plan (Next.js 16 upgrade):**
```ts
async function getArticle(slug: string) {
  'use cache'
  cacheTag('article', `article-${slug}`)
  cacheLife('hours')
  return sanityClient.fetch(queryArticleBySlug, { slug })
}
```

---

### 10. `after()` for non-blocking analytics

**Current state:** Unknown if any analytics or logging happens synchronously in route handlers.

**Best practice:** Any analytics tracking, email notifications, or logging after a form submission should use `after()` so it doesn't delay the user response:
```ts
import { after } from 'next/server'

after(() => {
  trackSubmission(data)  // Non-blocking
})
return redirect('/thank-you')
```

---

## MEDIUM — Re-render Optimization

### 11. `Header.tsx` — excessive re-renders on scroll

**File:** `src/components/global/Header.tsx`
**Issue:** The `handleScroll` event listener updates `isScrolled` state on every scroll event. This triggers a React re-render on every pixel scrolled.

**Fix (pattern: `rerender-use-ref-transient-values`):**
```ts
// Use throttling or a ref for the scroll check:
const frameRef = useRef<number>()

const handleScroll = useCallback(() => {
  if (frameRef.current) cancelAnimationFrame(frameRef.current)
  frameRef.current = requestAnimationFrame(() => {
    setIsScrolled(window.scrollY > 20)
  })
}, [])
```

---

### 12. Inline component definitions in article card loops

**File:** `src/app/(user)/page.tsx`
**Issue:** Anonymous map callback functions that return JSX create new function references on every render.

**Fix (pattern: `rerender-no-inline-components`):** Extract card components out of inline map renders. `ArticleCard`, `BreakingNewsItem`, etc. should be named exported components.

---

## MEDIUM — Images (Core Web Vitals Impact)

### 13. Add blur placeholders (LQIP) to images

**Current state:** `plaiceholder` is installed but not used. Article images load without blur placeholder, causing layout shift.

**Fix:** Use `plaiceholder` to generate base64 blur:
```ts
import { getPlaiceholder } from 'plaiceholder'

const { base64 } = await getPlaiceholder(imageUrl)
// Pass to next/image:
<Image placeholder="blur" blurDataURL={base64} ... />
```

Or use Sanity's built-in LQIP:
```ts
urlForImage(image).width(20).url()  // Tiny image as blurDataURL
```

---

### 14. Add `priority` to LCP images

**Pages needing `priority={true}` on their first visible image:**
- Homepage: hero article image
- Article page: hero/mainImage (already has it — verify)
- Category page: first article card image
- Author page: author photo
- Live event page: main image

---

### 15. Add `sizes` to all article grid images

```tsx
// Article card in 3-column grid:
<Image
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  ...
/>

// Hero image (2/3 width):
<Image
  sizes="(max-width: 1024px) 100vw, 66vw"
  ...
/>
```

---

## LOW — Configuration

### 16. Enable `typedRoutes`

```ts
// next.config.ts
experimental: {
  taint: true,
  typedRoutes: true,  // Uncomment this
}
```

Provides compile-time type checking for all `href` props in `Link` components.

---

### 17. Bundle analysis setup

Add bundle analyzer for periodic checks:
```bash
pnpm add -D @next/bundle-analyzer  # Already in devDependencies
```
Script already exists in package.json — ensure it's configured in next.config.ts:
```ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
export default withBundleAnalyzer(nextConfig)
```

---

## Summary Table

| Issue | Priority | Impact | Effort |
|-------|----------|--------|--------|
| Remove unused `categories` from homepage Promise.all | P1 | Low | 5 min |
| Add Suspense boundaries to homepage sections | P1 | High | 2 hrs |
| Defer heavy packages (framer-motion, react-player, embeds) | P1 | High | 2 hrs |
| Remove `styled-components` if unused | P1 | Medium | 30 min |
| Add `React.cache()` to siteSettings fetch | P2 | Medium | 1 hr |
| Fix Header scroll handler re-renders | P2 | Low-Med | 30 min |
| Add LQIP blur placeholders | P2 | Medium | 2 hrs |
| Add `priority` to LCP images | P2 | High | 1 hr |
| Add `sizes` to grid images | P2 | Medium | 1 hr |
| Enable typedRoutes | P3 | Low | 10 min |
| Direct imports (avoid barrel files) | P3 | Low-Med | 1 hr |
