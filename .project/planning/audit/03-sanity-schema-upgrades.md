# Plan: Sanity Schema Upgrades

> Status: IN PROGRESS — Core SEO/EEAT schemas shipped in Issue #2. Content modeling improvements still pending.
> Last audited: 2026-03-13

---

---

## OPEN — Still Pending

### Article Schema — Remaining content modeling fields

These fields were planned but not yet added to `src/models/schema/article.ts`:

```ts
// Add to article.ts:

defineField({
  name: 'leadParagraph',
  title: 'Lead / Summary',
  type: 'text',
  rows: 3,
  description: '2–3 sentence plain text summary. Used for AI extraction and featured snippets.'
}),
defineField({
  name: 'faqs',
  title: 'FAQ (for structured data)',
  type: 'array',
  of: [{
    type: 'object',
    name: 'faqItem',
    fields: [
      defineField({ name: 'question', type: 'string', title: 'Question' }),
      defineField({ name: 'answer', type: 'text', title: 'Answer' })
    ],
    preview: { select: { title: 'question' } }
  }],
  description: 'Q&A for FAQPage schema.org structured data — increases AI citation chance'
}),
defineField({
  name: 'relatedArticles',
  title: 'Related Articles',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'article' }] }],
  validation: Rule => Rule.max(5),
}),
defineField({
  name: 'reviewedBy',
  title: 'Reviewed By',
  type: 'reference',
  to: [{ type: 'author' }],
  description: 'Editorial reviewer or fact-checker'
}),
```

### Article Schema — `keywords` migration (string → array)

**Current state:** `keywords` is a plain `string`. Should be `string[]` for proper metadata.
**Migration required:**
```bash
pnpm sanity migration create keywords-string-to-array
# Split existing string on commas → populate array
```
**Schema target:**
```ts
defineField({
  name: 'keywords',
  title: 'Keywords',
  type: 'array',
  of: [{ type: 'string' }],
  options: { layout: 'tags' },
})
```

---

### Live Event Schema — Structured data fields

Not yet added to `src/models/schema/liveEvent.ts`:
```ts
defineField({ name: 'endDate', title: 'Event End Date', type: 'datetime' }),
defineField({
  name: 'eventStatus',
  title: 'Event Status',
  type: 'string',
  options: {
    list: [
      { title: 'Scheduled', value: 'EventScheduled' },
      { title: 'Cancelled', value: 'EventCancelled' },
      { title: 'Postponed', value: 'EventPostponed' },
      { title: 'Moved Online', value: 'EventMovedOnline' },
    ]
  },
  initialValue: 'EventScheduled'
}),
defineField({ name: 'seo', type: 'seoObject' }),
```

---

### `seoObject` — Add to remaining content types

Currently only on `article`. Should also be added to:
- `liveEvent`
- `category`
- `musicArtist`
- `album`
- `song`

---

### TypeGen Setup

**Current state:** Types (`Article`, `LiveEvent`, etc.) are manual TypeScript interfaces — not auto-generated from schemas. Drift risk grows as schemas expand.

**Fix:**
```bash
pnpm sanity typegen generate
```
Generates `sanity.types.ts`. Replace manual type interfaces with generated types across all pages and queries.

---

### Studio Structure Updates

Add `siteSettings` singleton to `structure.ts` (if not already done):
```ts
S.listItem()
  .title('Site Settings')
  .child(S.document().schemaType('siteSettings').documentId('siteSettings'))
```

---

## Migration Notes

- All new fields are optional by default — no existing documents break
- `keywords` string → array **requires** a migration script before removing the old string field
- `seoObject` additions are purely additive
