# Plan: Performance & React Best Practices

> Status: RE-AUDITED — 2026-03-13 (corrected)
> All major items complete. Only barrel file audit remains.

---

## ✅ COMPLETED

| Item | Notes |
|------|-------|
| Unused categories fetch removed from homepage | Promise.all cleaned up |
| Heavy packages deferred via `next/dynamic` | framer-motion, react-player, react-tweet, google-map-react |
| `styled-components` removed | Removed from package.json |
| `priority={true}` on LCP images | Homepage hero + article hero |
| `sizes` prop on article grid images | Added to article cards |
| Header scroll handler throttled | `requestAnimationFrame` throttle applied |
| `React.cache()` on shared data fetches | Wrapped shared fetches |
| Server-hoist logo | `HeaderLogo` server component; `logoSlot` prop pattern |
| Suspense on homepage | `FeaturedStoriesGrid` and hero wrapped in `<Suspense>` |
| `use cache` on music dynamic routes | lyrics, music-artists, albums — all use `'use cache'` + cacheTag + cacheLife |
| `generateStaticParams` on music routes | All 3 music dynamic routes have static param generation |
| `useCache: true` in `next.config.ts` | Enables `'use cache'` directive + cacheTag/cacheLife |
| LQIP blur placeholders | `placeholder="blur"` + `blurDataURL` on homepage, articles, and author hero images |
| `generateStaticParams` in articles → `sanityFetch` | Fixed; no longer uses raw `sanityClient.fetch` |

---

## ❌ OPEN — Still Pending

### 1. Barrel file audit — `src/components/global/`

**Current state:** `src/components/ads/` has a barrel index. `src/components/global/` does **not** — all imports are direct.
**Action:** Decide on a consistent pattern. If barrel files are used, ensure tree-shaking is not impeded. For components not always needed, prefer direct imports.

---

## Summary Table (remaining)

| Issue | Priority | Impact | Effort |
|-------|----------|--------|--------|
| Barrel file audit (global/) | P3 | Low-Med | 1 hr |
