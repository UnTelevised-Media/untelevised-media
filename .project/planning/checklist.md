# UnTelevised Media — Open Issues Checklist

> Re-audited: 2026-03-13 (second pass) — New P2/P3 items found. See audit files for detail.

---

## ❌ Open — P2

| Item | Audit | File |
|------|-------|------|
| `notFound()` on `author/[slug]` — inline div instead of proper 404 | 01 | `src/app/(user)/author/[slug]/page.tsx` |
| `notFound()` on `live-event/[slug]` — no null guard in page body | 01 | `src/app/(user)/live-event/[slug]/page.tsx` |
| `notFound()` on `albums/[slug]` — inline div instead of proper 404 | 01 | `src/app/(music)/albums/[slug]/page.tsx` |
| `notFound()` on `lyrics/[slug]` — no null guard | 01 | `src/app/(music)/lyrics/[slug]/page.tsx` |
| `notFound()` on `music-artists/[slug]` — no null guard | 01 | `src/app/(music)/music-artists/[slug]/page.tsx` |
| `notFound()` on `category/[slug]` — no null guard | 01 | `src/app/(user)/category/[slug]/page.tsx` |
| JSON-LD `MusicAlbum` schema missing on album pages | 02 | `src/app/(music)/albums/[slug]/page.tsx` |
| JSON-LD `MusicComposition` schema missing on lyrics pages | 02 | `src/app/(music)/lyrics/[slug]/page.tsx` |
| JSON-LD `MusicGroup`/`Person` schema missing on music artist pages | 02 | `src/app/(music)/music-artists/[slug]/page.tsx` |
| `albums/[slug]` `keywords` in metadata is a string not `string[]` | 02, 05 | `src/app/(music)/albums/[slug]/page.tsx` line 58 |

## ❌ Open — P3

| Item | Audit | File |
|------|-------|------|
| JSON-LD `ItemList`/`CollectionPage` schema missing on timeline pages | 02 | `src/app/(user)/timeline/[slug]/page.tsx` |
| JSON-LD `CollectionPage` schema missing on category pages | 02 | `src/app/(user)/category/[slug]/page.tsx` |

---

## Reference — Confirmed Complete (2026-03-14)

| Item | Verified |
|------|---------|
| Schema-to-UI gap pass: article corrections, sources, faqs, reviewedBy rendered | 2026-03-14 |
| Schema-to-UI gap pass: live event subtitle, eventStatus badge, endDate rendered | 2026-03-14 |
| Schema-to-UI gap pass: category description rendered on category pages | 2026-03-14 |
| Fix `queryEventBySlug` `tag[]->` → `eventTag[]->` bug | 2026-03-14 |
| Fix `queryAllAuthors` self-reference bug | 2026-03-14 |
| Live news banner restricted to homepage only | 2026-03-14 |
| Social links updated: YouTube `@AntiWarTV`, TikTok `@radical.edward` | 2026-03-14 |
| Email domain migration to `@untelevised.media` | 2026-03-14 |

---

## Reference — Confirmed Complete (prior)

| Item | Verified |
|------|---------|
| `generateStaticParams` → `sanityFetch` in all 10 dynamic routes | fixed 2026-03-13 |
| `generateStaticParams` in articles → `sanityFetch` | line 282 of `articles/[slug]/page.tsx` |
| LQIP blur placeholders | `blurDataURL` in `page.tsx`, `articles/[slug]`, `author/[slug]` |
| Trailing slashes on all structured data URLs | NewsArticleStructuredData + GlobalStructuredData verified |
| `siteSettings` singleton in Studio structure | `src/lib/sanity/structure.ts` lines 8–13 |
| SEO/metadata system | All dynamic routes have `generateMetadata` with seo overrides |
| Performance optimizations | All items complete — see audit 04 |
| Server-hoist logo (`HeaderLogo`) | `logoSlot` prop pattern in both layouts |
| Font loading cleanup (Geist removed) | Inter only; `src/app/layout.tsx` |
| Sanity TypeGen (`sanity.types.ts`) | 59 queries, 50 types at project root |
| `keywords` → array (article schema + migration script + production run) | 25 articles patched 2026-03-13 |
| `liveEvent.keywords` → array (schema + migration script + production run) | 5 liveEvents patched 2026-03-13 |
| `use cache` + `generateStaticParams` on music pages | lyrics, music-artists, albums |
| Article schema fields (leadParagraph, faqs, relatedArticles, reviewedBy) | merged |
| LiveEvent schema fields (endDate, eventStatus, seo) | merged |
| `seoObject` on all content types | merged |
| Barrel file audit — `global/` direct imports, `ads/`+`consent/` barrels intentional | audited 2026-03-13 |
| Author `Person` structured data | merged |
| FAQ schema + FAQPage structured data | merged |
| Related articles section on article page | merged |
| `dateModified` wired from `updatedAt` | merged |
| `og-default.png` added to `/public/` | done |
| Root `layout.tsx` OG reference fixed to `.png` | done |
| `liveEvent.keywords` string → array (schema + migration script + metadata handlers) | committed 39602d7 |
| `seoObject` override wiring for all dynamic routes (music, event, category) | committed 39602d7 |
| `SeoOverride` interface + `seo?` field on `LiveEvent`, `Category`, `MusicArtist`, `Album`, `Song` | committed 39602d7 |
| Static metadata — about, staff, donate, support | merged |
| Static metadata — secure-contact, whistleblower, join | `layout.tsx` pattern in each route |
| Static metadata — lyrics index, music-artists index | merged |
| Suspense on homepage (`FeaturedStoriesGrid`) | merged |
