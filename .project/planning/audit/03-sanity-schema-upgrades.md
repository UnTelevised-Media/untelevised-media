# Plan: Sanity Schema Upgrades

> Status: RE-AUDITED — 2026-03-13
> Core schema upgrades complete. Remaining items: liveEvent keywords migration, seo field wire-up.

---

## ✅ COMPLETED

| Item | Notes |
|------|-------|
| Article `leadParagraph` field | Added with `type: 'text'`, rows: 3 |
| Article `faqs[]` field | Array of `{ question, answer }` objects with FAQPage structured data |
| Article `relatedArticles[]->` | References to articles; rendered on article page |
| Article `reviewedBy` field | Reference to author type |
| Article `keywords` → array | Schema + tags layout + migration script in `migrations/keywords-string-to-array/` |
| LiveEvent `endDate` | `datetime` field added |
| LiveEvent `eventStatus` | String with EventScheduled/Cancelled/Postponed/MovedOnline options |
| LiveEvent `seo` field | `seoObject` type added |
| `seoObject` on all content types | Added to: liveEvent, category, musicArtist, album, song |
| TypeGen setup | `sanity.config.ts` at root + `sanity.cli.ts` at root; `sanity.types.ts` generated |
| Duplicate GROQ query names | All 9 files with generic `query` variable names renamed; 0 TypeGen warnings |

---

## ❌ OPEN — Still Pending

### 1. `liveEvent.keywords` still a plain `string`

**File:** `src/models/schema/liveEvent.ts` line 80–83
**Current state:** `keywords` is `type: 'string'` — inconsistent with article.
**Fix:**
1. Change field to `type: 'array'`, `of: [{ type: 'string' }]`, `options: { layout: 'tags' }`
2. Create `migrations/liveEvent-keywords-string-to-array/index.ts`
3. Update `buildLiveEventMetadata` in `src/util/metadata.ts` to drop `.split(',')`

---

### 2. Keywords migration not run against production content

**Migration file:** `migrations/keywords-string-to-array/index.ts` — exists but may not have been executed.
**Steps:**
```bash
pnpm sanity migration run keywords-string-to-array --dry-run
pnpm sanity migration run keywords-string-to-array
```
**Note:** Run `--dry-run` first to verify no data loss.

---

### 3. Studio Structure — `siteSettings` singleton

**Status:** Not verified. The `siteSettings` singleton may not be added to `structure.ts`.
**Fix:**
```ts
S.listItem()
  .title('Site Settings')
  .child(S.document().schemaType('siteSettings').documentId('siteSettings'))
```

---

### 4. `seoObject` field values not wired into `generateMetadata`

**Status:** `seoObject` exists on all schemas but `generateMetadata` for music/event pages likely doesn't read `seo.title`/`seo.description` overrides yet.
**Fix:** Update `generateMetadata` in each dynamic route to prefer `seo.title` / `seo.description` if present.

---

## Migration Notes

- All schema fields are optional — no existing documents break
- `liveEvent.keywords` → array requires migration before removing the string field
- `seoObject` additions are purely additive
