# Audit 02: SEO & AEO

> Status: RE-AUDITED — 2026-03-13
> All prior open items resolved. No new open items.

---

## ✅ COMPLETED

| Item | Notes |
|------|-------|
| `generateMetadata()` on all dynamic routes | articles, live-event, category, author, timeline, timeline-event, timeline-category, lyrics, music-artists, albums |
| Static page metadata — about, staff, donate, support | `export const metadata` in each page |
| Static page metadata — secure-contact, whistleblower, join | `layout.tsx` pattern in each route (client component pages) |
| Static page metadata — lyrics index, music-artists index | `export const metadata` in each page |
| OG image — `og-default.png` | `DEFAULT_OG_IMAGE` in `src/util/metadata.ts` uses `.png`; all dynamic routes use it as fallback |
| `alternates.canonical` on all dynamic routes | Set via `getCanonicalUrl()` helper in all `buildXxxMetadata` functions |
| `dateModified` from `updatedAt` | `NewsArticleStructuredData` uses `article.updatedAt ?? article._updatedAt ?? article.publishedAt` |
| Trailing slashes on structured data URLs | `NewsArticleStructuredData` and `GlobalStructuredData` verified |
| `FAQPage` structured data | Emitted in `NewsArticleStructuredData` when `article.faqs?.length > 0` |
| `Person` structured data on author pages | `author/[slug]/page.tsx` — JSON-LD with `@type: 'Person'`, `worksFor`, `sameAs`, `knowsAbout`, `hasCredential` |
| `NewsArticle` + `BreadcrumbList` structured data | `NewsArticleStructuredData` component on all article pages |
| `NewsMediaOrganization` + `WebSite` + `SearchAction` | `GlobalStructuredData` in `(user)/layout.tsx` |
| Event structured data on live-event pages | `eventStatus`, `location`, `organizer`, `image` included |
| sitemap.ts | Homepage priority `1.0`; articles recency-based (`0.8/0.6/0.4`); live events `0.9`; all URLs with trailing slashes; missing static pages added |
| robots.ts | `Disallow: /api/`; AI crawlers allowed: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, anthropic-ai, cohere-ai |
| `keywords` array in article metadata | `buildArticleMetadata` passes `article.keywords` array directly (no `.split(',')`) |
| `keywords` array in liveEvent metadata | `buildLiveEventMetadata` uses `liveEvent.keywords` array (no `.split(',')`) |
| `seoObject` overrides in all dynamic routes | `seo.metaTitle`, `seo.metaDescription`, `seo.canonicalUrl`, `seo.ogImage` applied as fallbacks in: articles, live-event, category, lyrics, music-artists, albums |
| EEAT fields — article | `location`, `updatedAt`, `corrections`, `sources[]` in schema + GROQ |
| EEAT fields — author | `credentials[]`, `expertise[]`, `sameAs[]`, `location`, `isActive` in schema + Person structured data |
| `leadParagraph` field | Added to article schema; included in `queryArticleBySlug` |
| Related articles section | `relatedArticles[]->` in GROQ; rendered at end of article page |

---

## ❌ OPEN

> Re-audited 2026-03-13 (second pass). New findings added.

| Item | Priority | Notes |
|------|----------|-------|
| JSON-LD `MusicAlbum` schema on `albums/[slug]` | P2 | No structured data at all — Google can't understand album content type; add `@type: 'MusicAlbum'` with `byArtist`, `numTracks`, `datePublished`, `genre` |
| JSON-LD `MusicComposition` (or `CreativeWork`) schema on `lyrics/[slug]` | P2 | No structured data — add `@type: 'MusicComposition'` with `composer`, `lyricist`, `inAlbum`, `lyrics` fields |
| JSON-LD `MusicGroup` (or `Person`) schema on `music-artists/[slug]` | P2 | No structured data — add `@type: 'MusicGroup'` or `'Person'` with `genre`, `sameAs`, `url`, `image` |
| JSON-LD schema on `timeline/[slug]` | P3 | No structured data — consider `@type: 'ItemList'` or `'CollectionPage'` to describe timeline events |
| JSON-LD `CollectionPage` on `category/[slug]` | P3 | No structured data — add `@type: 'CollectionPage'` with `name`, `description`, `url` |
| `albums/[slug]` `keywords` metadata is a string not an array | P2 | Line 58: `keywords: \`\${album.title}, \${artistNames}...\`` — should be `string[]` to match Next.js `Metadata` type and article/liveEvent pattern. Change to `keywords: [album.title, artistNames, 'album', ...(album.genres ?? [])]` |
