# Plan: Sanity Schema Upgrades

> Status: APPROVED — Implement all fixes across the entire app.
> Skill reference: `.claude/skills/sanity-best-practices/`, `.claude/skills/seo-aeo-best-practices/resources/eeat-principles.md`

---

## Overview

Schema upgrades fall into three categories:
1. **SEO fields** — enabling `generateMetadata` to use CMS-controlled SEO data
2. **EEAT fields** — author authority signals for Google's quality evaluation
3. **Content modeling improvements** — structural fixes and missing fields

All schema changes must be coordinated with content migration if existing documents are affected.

---

## 1. SEO Object — Add to `article`, `liveEvent`, `policies`, `category`

Create a reusable `seoObject` type and add it to key content types. This gives editors control over SEO from within the Studio.

### New: `seoObject` (shared object type)

```ts
// src/models/schema/seoObject.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'seoObject',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Override for <title> tag. 50–60 characters ideal.',
      validation: Rule => Rule.max(60).warning('Titles over 60 characters may be truncated in search results')
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: '150–160 characters. Appears in search results.',
      validation: Rule => Rule.max(160).warning('Descriptions over 160 characters are truncated')
    }),
    defineField({
      name: 'ogImage',
      title: 'Social Share Image',
      type: 'image',
      description: '1200×630px recommended. Falls back to article mainImage.',
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from Search Engines',
      type: 'boolean',
      initialValue: false,
      description: 'Set to true for draft/internal pages'
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL Override',
      type: 'url',
      description: 'Only set if this content is duplicated from another URL'
    }),
  ]
})
```

### Add to `article` schema:
```ts
defineField({ name: 'seo', title: 'SEO', type: 'seoObject' })
```

### Add to `liveEvent`, `policies`, `category`, `musicArtist`, `album`, `song` schemas similarly.

---

## 2. Article Schema Additions

### 2.1 Missing and needed fields

```ts
// Add to article.ts defineType fields:

defineField({
  name: 'updatedAt',
  title: 'Last Updated',
  type: 'datetime',
  description: 'Set when content is substantively updated (not minor edits)'
}),
defineField({
  name: 'reviewedBy',
  title: 'Reviewed By',
  type: 'reference',
  to: [{ type: 'author' }],
  description: 'Editorial reviewer or fact-checker'
}),
defineField({
  name: 'sources',
  title: 'Sources & Citations',
  type: 'array',
  of: [{
    type: 'object',
    fields: [
      defineField({ name: 'label', type: 'string', title: 'Source Name' }),
      defineField({ name: 'url', type: 'url', title: 'URL' }),
    ]
  }],
  description: 'Primary sources cited in this article'
}),
defineField({
  name: 'corrections',
  title: 'Corrections',
  type: 'text',
  description: 'Public corrections log. Displayed on article page if populated.'
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
      defineField({ name: 'answer', type: 'text', title: 'Answer',
        description: 'Plain text only — used for FAQPage schema.org structured data' })
    ],
    preview: { select: { title: 'question' } }
  }],
  description: 'Q&A pairs that appear in FAQ structured data (increases AI citation chance)'
}),
defineField({
  name: 'leadParagraph',
  title: 'Lead / Summary',
  type: 'text',
  rows: 3,
  description: '2–3 sentence plain text summary. Used for AI extraction and featured snippets. Falls back to description field.'
}),
defineField({
  name: 'relatedArticles',
  title: 'Related Articles',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'article' }] }],
  validation: Rule => Rule.max(5),
  description: 'Up to 5 related articles. Displayed at end of article.'
}),
// Fix: keywords as array instead of string
defineField({
  name: 'keywords',
  title: 'Keywords',
  type: 'array',
  of: [{ type: 'string' }],
  options: { layout: 'tags' },
  description: 'Used in meta keywords and for content tagging'
}),
defineField({ name: 'seo', title: 'SEO', type: 'seoObject' }),
```

---

## 3. Author Schema Additions

These fields establish EEAT signals for Google's quality evaluation of journalism.

```ts
// Add to author.ts:

defineField({
  name: 'credentials',
  title: 'Credentials & Affiliations',
  type: 'array',
  of: [{ type: 'string' }],
  options: { layout: 'tags' },
  description: 'e.g. "Associated Press", "Press Freedom Foundation", "10 years investigative reporting"'
}),
defineField({
  name: 'expertise',
  title: 'Areas of Expertise',
  type: 'array',
  of: [{ type: 'string' }],
  options: { layout: 'tags' },
  description: 'e.g. "Government Accountability", "Civil Rights", "Economic Justice"'
}),
defineField({
  name: 'sameAs',
  title: 'Schema.org sameAs URLs',
  type: 'array',
  of: [{ type: 'url' }],
  description: 'Canonical profile URLs for structured data: LinkedIn, Wikipedia, official press page, etc.'
}),
defineField({
  name: 'location',
  title: 'Location / Beat',
  type: 'string',
  description: 'Geographic region or beat covered'
}),
defineField({
  name: 'isActive',
  title: 'Active Contributor',
  type: 'boolean',
  initialValue: true,
  description: 'Uncheck for former staff'
}),
```

---

## 4. Live Event Schema Additions

```ts
// Additions to liveEvent.ts:

defineField({
  name: 'updatedAt',
  title: 'Last Updated',
  type: 'datetime',
}),
defineField({
  name: 'endDate',
  title: 'Event End Date',
  type: 'datetime',
  description: 'For Event schema.org structured data'
}),
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

## 5. New: `siteSettings` Singleton

Create a site-wide settings document for global SEO/brand configuration rather than hardcoding in code.

```ts
// src/models/schema/siteSettings.ts
defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', title: 'Site Name' }),
    defineField({ name: 'description', type: 'text', title: 'Default Meta Description' }),
    defineField({ name: 'ogImage', type: 'image', title: 'Default OG Image' }),
    defineField({ name: 'logo', type: 'image', title: 'Logo' }),
    defineField({ name: 'twitterHandle', type: 'string' }),
    defineField({ name: 'foundingDate', type: 'date' }),
    defineField({
      name: 'socialLinks',
      type: 'array',
      of: [{ type: 'object', fields: [
        defineField({ name: 'platform', type: 'string' }),
        defineField({ name: 'url', type: 'url' }),
      ]}]
    }),
  ]
})
```

Used to power Organization structured data and root layout metadata dynamically.

---

## 6. TypeGen Setup

**Current state:** TypeGen is NOT configured (no `sanity.config.ts` schema type exports to TypeScript).

**Issue:** Types like `Article`, `LiveEvent`, `Song` are defined somewhere as manual TypeScript interfaces (`types.d.ts`) — not auto-generated from schemas. This creates drift risk.

**Fix:** Set up Sanity TypeGen:
```bash
pnpm sanity typegen generate
```

This generates `sanity.types.ts` with fully typed GROQ query results.

Update all manual type usages (`Article`, `LiveEvent`, etc.) to use generated types.

---

## 7. Studio Structure Updates

Add the new `siteSettings` singleton to `structure.ts`:
```ts
S.listItem()
  .title('Site Settings')
  .child(S.document().schemaType('siteSettings').documentId('siteSettings'))
```

Group SEO-related schema navigation in Studio desk structure.

---

## Migration Notes

When adding new fields to existing schemas:
- New fields are optional by default — existing documents are not broken
- `keywords` changing from `string` → `array`: requires a content migration script
  - Use Sanity CLI migration tool: `pnpm sanity migration create`
  - Migration: split existing string on commas → populate array
- `seoObject` addition: purely additive, no migration needed
