# Audit 03: Sanity Schema Upgrades

> Status: RE-AUDITED — 2026-03-13
> All items complete, including production data migrations. No open items.

---

## ✅ COMPLETED

| Item | Notes |
|------|-------|
| Article `leadParagraph` field | `type: 'text'`, rows: 3 — plain-text summary for AI extraction and featured snippets |
| Article `faqs[]` field | Array of `{ question, answer }` objects; drives `FAQPage` structured data |
| Article `relatedArticles[]->` | Reference array (max 5); rendered on article page |
| Article `reviewedBy` field | Reference to `author` type |
| Article `keywords` → array | `type: 'array'` with tags layout; `migrations/keywords-string-to-array/` created |
| Article `keywords` migration — production | Run 2026-03-13: 41 docs scanned, 25 patched |
| Article `seo` field | `seoObject` type with `metaTitle`, `metaDescription`, `ogImage`, `noIndex`, `canonicalUrl` |
| LiveEvent `endDate` | `datetime` field added |
| LiveEvent `eventStatus` | String enum: EventScheduled / EventCancelled / EventPostponed / EventMovedOnline |
| LiveEvent `keywords` → array | `type: 'array'` with tags layout; `migrations/liveEvent-keywords-string-to-array/` created |
| LiveEvent `keywords` migration — production | Run 2026-03-13: 5 docs scanned, 5 patched |
| LiveEvent `seo` field | `seoObject` type added |
| `seoObject` on all content types | Added to: liveEvent, category, musicArtist, album, song |
| `siteSettings` singleton | Added to Studio desk structure via `S.listItem()` in `src/lib/sanity/structure.ts` |
| TypeGen setup | `sanity.config.ts` + `sanity.cli.ts` at project root; `sanity.types.ts` generated (59 queries, 50 types) |
| Duplicate GROQ query names | All 9 files with generic `query` variable renamed; 0 TypeGen warnings |
| Global `types.d.ts` — `SeoOverride` interface | `metaTitle?`, `metaDescription?`, `ogImage?`, `noIndex?`, `canonicalUrl?` |
| Global `types.d.ts` — `seo?` field | Added to `LiveEvent`, `Category`, `MusicArtist`, `Album`, `Song` |
| Global `types.d.ts` — keyword types | `Article.keywords: string[]`, `LiveEvent.keywords: string[]` (both corrected from `string`) |

---

## ❌ OPEN

No open items. All schema upgrades and data migrations are complete.

---

## Migration Reference

| Script | Dataset | Result |
|--------|---------|--------|
| `migrations/keywords-string-to-array` | `articles` | 25 articles patched — 2026-03-13 |
| `migrations/liveEvent-keywords-string-to-array` | `articles` | 5 liveEvents patched — 2026-03-13 |
