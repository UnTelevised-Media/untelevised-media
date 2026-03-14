# Audit 01: Next.js Best Practices

> Status: RE-AUDITED — 2026-03-13
> All prior open items resolved. One new P2 finding: `generateStaticParams` consistency.

---

## ✅ COMPLETED

| Item | Notes |
|------|-------|
| Async params pattern | All 10 dynamic routes use `params: Promise<{ slug: string }>` |
| `generateStaticParams` on all dynamic routes | articles, live-event, category, author, timeline, timeline-event, timeline-category, lyrics, music-artists, albums |
| `generateStaticParams` → `sanityFetch` in all 10 dynamic routes | Fixed — articles, live-event, category, author, timeline, timeline-event, timeline-category, policies, lyrics, music-artists, albums |
| `'use cache'` on music dynamic routes | lyrics, music-artists, albums — all use `'use cache'` + `cacheTag` + `cacheLife('hours')` |
| `useCache: true` in `next.config.ts` | `next.config.ts` line 44 — enables `'use cache'` directive |
| `trailingSlash: true` in `next.config.ts` | `next.config.ts` line 5 |
| Suspense on homepage | `FeaturedStoriesGrid` + hero wrapped in `<Suspense>` with `<LoadingSpinner>` fallbacks |
| `next/dynamic` for heavy components | framer-motion (CookieConsentBanner, AdBlockerMessage), TimelineJSVisualization, react-tweet `Tweet`, react-syntax-highlighter `Prism` — all dynamically imported |
| `priority={true}` on LCP images | Article hero, author hero, HeaderLogo — confirmed |
| `sizes` prop on article grid images | Homepage featured stories: `sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'` |
| LQIP blur placeholders | `placeholder="blur"` + `blurDataURL` on homepage, `articles/[slug]`, `author/[slug]` hero images |
| Font loading | Only Inter (via `next/font/google`) active; Geist Sans/Mono removed |
| Barrel file audit | `ads/` and `consent/` barrels intentional (co-imported client bundles); `global/` has no barrel (correct — direct imports for server components) |
| `typedRoutes` | Disabled pending Turbopack support (`next.config.ts` — commented out with note) |
| `@next/bundle-analyzer` wired | `withBundleAnalyzer()` in `next.config.ts`; `npm run analyze` script added |

---

## ❌ OPEN

> Re-audited 2026-03-13 (second pass). New findings added.

| Item | Priority | Notes |
|------|----------|-------|
| `notFound()` on `author/[slug]` | P2 | Returns inline `<div>Author Not Found</div>` — should call `notFound()` for proper 404 HTTP status and `not-found.tsx` rendering |
| `notFound()` on `live-event/[slug]` | P2 | `liveEvent` null check exists in `generateMetadata` but page body does not call `notFound()` — falls through to undefined errors |
| `notFound()` on `albums/[slug]` | P2 | Returns inline `<div>Album Not Found</div>` instead of `notFound()` |
| `notFound()` on `lyrics/[slug]` | P2 | No null guard or `notFound()` call found |
| `notFound()` on `music-artists/[slug]` | P2 | No null guard or `notFound()` call found |
| `notFound()` on `category/[slug]` | P2 | No null guard or `notFound()` call found |

**Pattern to apply** — replace inline fallback divs:
```tsx
// ❌ current
if (!album) return <div>Album Not Found</div>;

// ✅ correct
import { notFound } from 'next/navigation';
if (!album) notFound();
```
