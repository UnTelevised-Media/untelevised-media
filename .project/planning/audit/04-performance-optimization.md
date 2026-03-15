# Audit 04: Performance & React Best Practices

> Status: RE-AUDITED — 2026-03-13
> All prior open items resolved. One carryover from audit 01: `generateStaticParams` consistency (tracked there).

---

## ✅ COMPLETED

| Item | Notes |
|------|-------|
| Unused `categories` fetch removed from homepage | `Promise.all` cleaned up — eliminates one Sanity round-trip per homepage load |
| Heavy packages deferred via `next/dynamic` | framer-motion (CookieConsentBanner, AdBlockerMessage, TimelineJSVisualization), react-tweet `Tweet`, react-syntax-highlighter `Prism` — all code-split |
| `styled-components` removed | Removed from `package.json`; Tailwind CSS only |
| `priority={true}` on LCP images | Article hero, author hero, HeaderLogo |
| `sizes` prop on article grid images | Homepage featured stories grid: `(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw` |
| Header scroll handler throttled | `requestAnimationFrame` throttle + `{ passive: true }` listener in `Header.tsx` |
| `React.cache()` on shared data fetches | `getArticleBySlug` + `getAuthorBySlug` wrapped — single fetch shared between `generateMetadata` and page component |
| Server-hoist logo (`HeaderLogo`) | `HeaderLogo` server component; passed as `logoSlot` prop to client `Header` — logo doesn't re-render on client interaction |
| Font loading cleanup | Geist Sans/Mono removed from `src/app/layout.tsx`; only Inter active |
| Suspense on homepage | `FeaturedStoriesGrid` + hero wrapped in `<Suspense>` with `<LoadingSpinner>` fallbacks |
| `'use cache'` on music dynamic routes | `lyrics/[slug]`, `music-artists/[slug]`, `albums/[slug]` — all use `'use cache'` + `cacheTag` + `cacheLife('hours')` |
| `generateStaticParams` on music routes | All 3 music dynamic routes generate static params at build time |
| `generateStaticParams` → `sanityFetch` in all 10 dynamic routes | Fixed 2026-03-13 — articles, live-event, category, author, timeline, timeline-event, timeline-category, policies, lyrics, music-artists, albums |
| `useCache: true` in `next.config.ts` | Enables `'use cache'` directive, `cacheTag()`, `cacheLife()` from `next/cache` |
| LQIP blur placeholders | `placeholder="blur"` + `blurDataURL` (20px Sanity thumbnail) on: homepage hero, `articles/[slug]` hero, `author/[slug]` hero |
| Bundle analyzer wired | `@next/bundle-analyzer` via `withBundleAnalyzer()` in `next.config.ts`; `npm run analyze` script |

---

## ❌ OPEN

No open items. All performance audit items are complete.
