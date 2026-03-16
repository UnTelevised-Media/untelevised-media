<!-- GitHub Issue: #23 -->

## Problem

UnTelevised Media has no formal mechanism for issuing corrections, clarifications, or retractions on published articles. Real newsrooms surface corrections prominently and permanently — the absence of this infrastructure signals that the outlet treats published content as immutable marketing copy rather than accountable journalism.

Beyond trust perception, corrections workflows are a direct EEAT (Experience, Expertise, Authoritativeness, Trustworthiness) signal in Google's Quality Rater Guidelines. Outlets without a visible correction mechanism rank lower for news-related queries. Independent journalism depends on this credibility layer more than corporate outlets because it cannot rely on institutional brand recognition as a trust proxy.

The current `article` schema has a single `corrections` text field — a plain string. This is insufficient: it cannot distinguish between a minor factual clarification, a material correction, and a full retraction, it has no issuance date, it has no summary for article list cards, and it cannot trigger visual differentiation on the article page.

## Background & Context

The existing article schema at `src/models/schema/article.ts` already has a rudimentary `corrections` field (plain `text` type, lines 106–112). This needs to be replaced with a structured object that supports multiple correction types with dates and summaries. The article page at `src/app/(user)/articles/[slug]/page.tsx` currently has no CorrectionNotice component. Article cards at `src/components/cards/ArticleCards.tsx` and `ArticleCardLg.tsx` show no correction badge. The GROQ query for article by slug will need to include the new structured correction fields.

## Architecture

```
Sanity Studio
  └── article document
        └── correction { type, issuedAt, summary, detail }
                │
                ▼
     GROQ query (queryArticleBySlug)
          │ returns correction object
          ▼
  /articles/[slug]/page.tsx
          │
          ├── <CorrectionNotice /> (top of body, amber banner)
          │       type badge + date + full detail text
          │
          └── article body content

  ArticleCards.tsx / ArticleCardLg.tsx
          └── {correction?.summary && <CorrectedBadge />}
```

## Proposed Solution

### Step 1 — Upgrade the Sanity Schema

Replace the existing plain `corrections` text field with a structured object that supports type, date, summary, and full detail. The existing field name `corrections` (plural) is changed to `correction` (singular object) to reflect that each article carries one active correction notice — additional historical corrections are stored in the `detail` text.

```typescript
// src/models/schema/article.ts — replace the existing `corrections` field

import { defineField, defineType } from 'sanity';
import { AlertTriangle } from 'lucide-react';

// Replace:
// defineField({ name: 'corrections', type: 'text', ... })
// With:
defineField({
  name: 'correction',
  title: 'Correction / Retraction',
  type: 'object',
  description: 'Fill this out only when issuing a formal correction, clarification, update, or retraction.',
  fields: [
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Correction — factual error fixed', value: 'correction' },
          { title: 'Clarification — added context, no error', value: 'clarification' },
          { title: 'Update — new developments added', value: 'update' },
          { title: 'Retraction — article withdrawn', value: 'retraction' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'issuedAt',
      title: 'Correction Date',
      type: 'datetime',
      description: 'When this correction was issued (not when the article was edited)',
    }),
    defineField({
      name: 'summary',
      title: 'One-Line Summary',
      type: 'string',
      description: 'Shown on article cards and in meta. Max ~80 chars. E.g. "An earlier version misstated the vote count."',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'detail',
      title: 'Full Correction Text',
      type: 'text',
      rows: 4,
      description: 'Full editorial correction notice displayed at top of the article.',
    }),
  ],
}),
```

### Step 2 — Update the GROQ Query

The `queryArticleBySlug` query must project the new `correction` object. Also update `queryAllArticles` to include `correction.summary` and `correction.type` for card badges.

```typescript
// src/lib/sanity/lib/queries.ts

// In queryArticleBySlug, add to the projection:
export const queryArticleBySlug = groq`
  *[_type == 'article' && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    updatedAt,
    body,
    description,
    leadParagraph,
    author->,
    reviewedBy->,
    mainImage,
    categories[]->,
    keywords,
    location,
    faqs,
    sources,
    relatedArticles[]-> { _id, title, slug, mainImage, publishedAt, description },
    seo,
    // Structured correction object
    correction {
      type,
      issuedAt,
      summary,
      detail
    }
  }
`;

// In queryAllArticles (for cards), add:
// correction { type, summary }
export const queryAllArticles = groq`
  *[_type == 'article'] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    description,
    mainImage,
    author-> { name, slug },
    categories[]-> { title, slug },
    correction { type, summary }
  }
`;
```

### Step 3 — CorrectionNotice Component

```tsx
// src/components/post/CorrectionNotice.tsx
'use client';

import { AlertTriangle, Info, RefreshCw, XCircle } from 'lucide-react';
import { formatDate } from '@/util/formatDate';

type CorrectionType = 'correction' | 'clarification' | 'update' | 'retraction';

interface CorrectionData {
  type: CorrectionType;
  issuedAt: string;
  summary: string;
  detail: string;
}

interface CorrectionNoticeProps {
  correction: CorrectionData;
}

const CONFIG: Record<
  CorrectionType,
  {
    label: string;
    Icon: React.ElementType;
    borderClass: string;
    bgClass: string;
    labelClass: string;
    iconClass: string;
  }
> = {
  correction: {
    label: 'CORRECTION',
    Icon: AlertTriangle,
    borderClass: 'border-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    labelClass: 'bg-amber-400 text-black',
    iconClass: 'text-amber-500',
  },
  clarification: {
    label: 'CLARIFICATION',
    Icon: Info,
    borderClass: 'border-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    labelClass: 'bg-blue-400 text-white',
    iconClass: 'text-blue-500',
  },
  update: {
    label: 'UPDATE',
    Icon: RefreshCw,
    borderClass: 'border-green-400',
    bgClass: 'bg-green-50 dark:bg-green-950/40',
    labelClass: 'bg-green-500 text-white',
    iconClass: 'text-green-500',
  },
  retraction: {
    label: 'RETRACTION',
    Icon: XCircle,
    borderClass: 'border-red-600',
    bgClass: 'bg-red-50 dark:bg-red-950/40',
    labelClass: 'bg-[#D70606] text-white',
    iconClass: 'text-[#D70606]',
  },
};

export function CorrectionNotice({ correction }: CorrectionNoticeProps) {
  const { type, issuedAt, detail } = correction;
  const config = CONFIG[type] ?? CONFIG.correction;
  const { label, Icon, borderClass, bgClass, labelClass, iconClass } = config;

  return (
    <aside
      className={`my-6 border-l-4 ${borderClass} ${bgClass} px-4 py-4`}
      role="note"
      aria-label={`${label}: ${detail}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconClass}`} aria-hidden="true" />
        <span
          className={`px-2 py-0.5 text-xs font-black uppercase tracking-widest ${labelClass}`}
        >
          {label}
        </span>
        {issuedAt && (
          <time
            dateTime={issuedAt}
            className="text-xs text-neutral-500 dark:text-neutral-400"
          >
            {formatDate(issuedAt)}
          </time>
        )}
      </div>
      <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {detail}
      </p>
    </aside>
  );
}
```

### Step 4 — Article Page Integration

```tsx
// src/app/(user)/articles/[slug]/page.tsx — add CorrectionNotice

import { CorrectionNotice } from '@/components/post/CorrectionNotice';

// Inside the article body JSX, directly after the headline/byline block:
{article.correction?.detail && (
  <CorrectionNotice correction={article.correction} />
)}

// For retraction: add strikethrough to the title
<h1
  className={cn(
    'text-3xl font-black uppercase tracking-tight',
    article.correction?.type === 'retraction' && 'line-through opacity-60'
  )}
>
  {article.title}
</h1>
```

### Step 5 — Article Card Badge

```tsx
// src/components/cards/ArticleCards.tsx — add badge when correction present

import { AlertTriangle } from 'lucide-react';

// Inside the card JSX, near the title:
{article.correction?.summary && (
  <span className="inline-flex items-center gap-1 bg-amber-400 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-black">
    <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
    Corrected
  </span>
)}
```

Apply the same badge to `ArticleCardLg.tsx`.

### Step 6 — TypeScript Types

```typescript
// src/models/types/article.ts (or wherever article type lives)

export interface ArticleCorrection {
  type: 'correction' | 'clarification' | 'update' | 'retraction';
  issuedAt: string;
  summary: string;
  detail: string;
}

export interface Article {
  // ... existing fields
  correction?: ArticleCorrection;
}
```

## Implementation Plan

1. **Schema upgrade** — Replace the plain `corrections` text field in `src/models/schema/article.ts` with the structured `correction` object definition from Step 1.
2. **GROQ queries** — Update `queryArticleBySlug` and `queryAllArticles` in `src/lib/sanity/lib/queries.ts` to project the `correction` object.
3. **TypeScript type** — Add `ArticleCorrection` interface to the article type model.
4. **CorrectionNotice component** — Create `src/components/post/CorrectionNotice.tsx` per Step 3.
5. **Article page** — Import and render `CorrectionNotice` in the article slug page; add retraction strikethrough to title.
6. **Card badges** — Add the corrected badge to `ArticleCards.tsx` and `ArticleCardLg.tsx`.
7. **Studio verify** — Open Sanity Studio and confirm the `correction` object group renders correctly below the article body fields.
8. **QA** — Test with a correction, clarification, update, and retraction. Verify dark mode. Verify cards show badge. Verify retraction strikethrough.

## Files Affected

- `src/models/schema/article.ts` — replace plain `corrections` text field with structured `correction` object
- `src/lib/sanity/lib/queries.ts` — update `queryArticleBySlug` and `queryAllArticles` projections
- `src/models/types/article.ts` (or equivalent) — add `ArticleCorrection` interface
- `src/components/post/CorrectionNotice.tsx` — **new file**
- `src/app/(user)/articles/[slug]/page.tsx` — render CorrectionNotice + retraction strikethrough
- `src/components/cards/ArticleCards.tsx` — add corrected badge
- `src/components/cards/ArticleCardLg.tsx` — add corrected badge

## Deliverables Checklist

### Schema
- [ ] `correction` object field replaces plain `corrections` text in `article` schema
- [ ] Object contains: `type` (radio list), `issuedAt` (datetime), `summary` (string, max 120), `detail` (text)
- [ ] Sanity Studio renders correction fields in a logical group
- [ ] Existing articles with old `corrections` text field data remain accessible during migration

### GROQ Queries
- [ ] `queryArticleBySlug` projects `correction { type, issuedAt, summary, detail }`
- [ ] `queryAllArticles` projects `correction { type, summary }` for card badges

### Components
- [ ] `CorrectionNotice` component created with amber (correction), blue (clarification), green (update), red (retraction) variants
- [ ] Each variant uses distinct border color, background, label badge, and icon
- [ ] Retraction variant uses `#D70606` brand red label
- [ ] Component is accessible: `role="note"`, `aria-label` set
- [ ] Component renders correctly in dark mode

### Article Page
- [ ] `CorrectionNotice` renders directly below headline/byline, above lede, when `correction.detail` is set
- [ ] Retraction type adds `line-through` and `opacity-60` to article title
- [ ] Component does not render when `correction` field is empty/absent

### Cards
- [ ] `ArticleCards.tsx` shows amber "Corrected" badge with triangle icon when `correction.summary` is set
- [ ] `ArticleCardLg.tsx` shows same badge
- [ ] Badge does not appear on articles without corrections

### QA
- [ ] All 4 correction types render correctly in light mode
- [ ] All 4 correction types render correctly in dark mode
- [ ] Card badge appears only when correction is set
- [ ] Retraction strikethrough visible on article page title
- [ ] No TypeScript errors
- [ ] No hydration mismatch (component is client-side for future interactivity but SSR-safe)
