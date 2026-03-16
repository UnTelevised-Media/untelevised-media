<!-- GitHub Issue: #24 -->

## Problem

Investigative and news articles on UnTelevised Media currently have no structured way to expose sources, methodology, or research process to readers. Independent journalism lives or dies on source transparency — without it, readers have no mechanism to evaluate whether claims are supported by documents, interviews, or data, versus being unverified assertions.

This matters doubly for an outlet covering contentious topics. Readers, other journalists, and potential sources all evaluate whether an outlet practices open-source journalism. The absence of a `SourcesPanel` forces readers to either accept claims on faith or dismiss them — there is no middle path. Transparency reduces both bad-faith dismissal and unfounded credulity.

The existing `article` schema already has a rudimentary `sources` array (label + url only, no type or anonymity flag) added in an earlier EEAT pass. This must be upgraded to a richer object and a proper collapsible UI component built to display it. The `methodology` note field is entirely absent.

## Background & Context

The existing `sources` array in `src/models/schema/article.ts` (lines 113–128) only stores `label` (string) and `url` (url). There is no `type` classification, no `description`/note field, no `isAnonymous` flag, and no `methodology` text field. The GROQ query `queryArticleBySlug` does include `sources` in its projection but only returns the minimal fields. No UI component exists for sources — the data is collected but never displayed to readers.

The component should use a native HTML `<details>`/`<summary>` element for SSR-safe collapse with zero JavaScript dependency, ensuring it works even if client JS fails to load.

## Architecture

```
Sanity Studio
  └── article document
        ├── sources[] { label, url, description, type, isAnonymous }
        └── methodology (text)
                │
                ▼
     GROQ query (queryArticleBySlug)
          │ projects sources + methodology
          ▼
  /articles/[slug]/page.tsx
          │
          └── Article body
                └── <SourcesPanel sources={...} methodology={...} />
                      │ position: after body, before related/ads
                      │
                      ├── <details> (collapsed by default)
                      │     <summary> Sources & Methodology (N sources)
                      │     └── source list
                      │           ├── [document icon] Court Filing — linked
                      │           ├── [mic icon] Interview — linked/unlisted
                      │           ├── [shield icon] Anonymous Source
                      │           └── ...
                      └── methodology blockquote (if set)
```

## Proposed Solution

### Step 1 — Upgrade the Sanity Schema

Replace the minimal `sources` array and add `methodology` to `src/models/schema/article.ts`.

```typescript
// src/models/schema/article.ts — replace existing sources array

defineField({
  name: 'sources',
  title: 'Sources & Methodology',
  type: 'array',
  description: 'List every source used in this article. Anonymous sources are displayed as "Anonymous [type]".',
  of: [
    {
      type: 'object',
      name: 'source',
      title: 'Source',
      fields: [
        defineField({
          name: 'label',
          title: 'Source Label',
          type: 'string',
          description: 'E.g. "Court Filing — Fulton County Superior Court", "Interview with city official"',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'type',
          title: 'Source Type',
          type: 'string',
          options: {
            list: [
              { title: 'Document / Filing', value: 'document' },
              { title: 'Interview', value: 'interview' },
              { title: 'Official Statement', value: 'statement' },
              { title: 'Data / Dataset', value: 'data' },
              { title: 'Video / Audio', value: 'media' },
              { title: 'On-Scene Reporting', value: 'onscene' },
              { title: 'Other', value: 'other' },
            ],
            layout: 'dropdown',
          },
        }),
        defineField({
          name: 'url',
          title: 'URL (optional)',
          type: 'url',
          description: 'Link to primary source document, recording, or statement if publicly available.',
        }),
        defineField({
          name: 'description',
          title: 'Note',
          type: 'text',
          rows: 2,
          description: 'Any additional context about this source. Not shown if anonymous.',
        }),
        defineField({
          name: 'isAnonymous',
          title: 'Anonymous Source',
          type: 'boolean',
          initialValue: false,
          description: 'If true, label and description are hidden from readers — only the type is shown.',
        }),
      ],
      preview: {
        select: {
          title: 'label',
          subtitle: 'type',
          isAnonymous: 'isAnonymous',
        },
        prepare({ title, subtitle, isAnonymous }) {
          return {
            title: isAnonymous ? '🔒 Anonymous Source' : title,
            subtitle: subtitle ?? 'No type set',
          };
        },
      },
    },
  ],
}),

defineField({
  name: 'methodology',
  title: 'Methodology Note',
  type: 'text',
  rows: 4,
  description:
    'Optional editorial note on how this story was reported — shown in the Sources panel as an editorial note. E.g. "This story was reported over three weeks. Documents were obtained via FOIA request #2024-1234."',
}),
```

### Step 2 — Update GROQ Queries

```typescript
// src/lib/sanity/lib/queries.ts

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
    seo,
    correction { type, issuedAt, summary, detail },
    // Upgraded sources projection
    sources[] {
      label,
      type,
      url,
      description,
      isAnonymous
    },
    methodology,
    relatedArticles[]-> { _id, title, slug, mainImage, publishedAt, description }
  }
`;
```

### Step 3 — TypeScript Types

```typescript
// src/models/types/article.ts

export type SourceType =
  | 'document'
  | 'interview'
  | 'statement'
  | 'data'
  | 'media'
  | 'onscene'
  | 'other';

export interface ArticleSource {
  label: string;
  type?: SourceType;
  url?: string;
  description?: string;
  isAnonymous?: boolean;
}
```

### Step 4 — SourcesPanel Component

```tsx
// src/components/post/SourcesPanel.tsx
import {
  FileText,
  Mic,
  MessageSquare,
  Database,
  Video,
  Eye,
  HelpCircle,
  Shield,
  ExternalLink,
} from 'lucide-react';
import type { ArticleSource, SourceType } from '@/models/types/article';

const SOURCE_CONFIG: Record<
  SourceType,
  { label: string; Icon: React.ElementType }
> = {
  document: { label: 'Document', Icon: FileText },
  interview: { label: 'Interview', Icon: Mic },
  statement: { label: 'Statement', Icon: MessageSquare },
  data: { label: 'Data', Icon: Database },
  media: { label: 'Video / Audio', Icon: Video },
  onscene: { label: 'On-Scene', Icon: Eye },
  other: { label: 'Source', Icon: HelpCircle },
};

interface SourcesPanelProps {
  sources?: ArticleSource[];
  methodology?: string;
}

export function SourcesPanel({ sources, methodology }: SourcesPanelProps) {
  const hasSources = sources && sources.length > 0;
  if (!hasSources && !methodology) return null;

  const count = sources?.length ?? 0;

  return (
    <section
      className="my-8 border border-neutral-200 dark:border-neutral-700"
      aria-label="Sources and methodology"
    >
      <details>
        <summary className="flex cursor-pointer select-none items-center justify-between bg-neutral-100 px-4 py-3 text-xs font-black uppercase tracking-widest text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">
          <span>
            Sources &amp; Methodology
            {count > 0 && (
              <span className="ml-2 font-normal normal-case tracking-normal">
                ({count} source{count !== 1 ? 's' : ''})
              </span>
            )}
          </span>
          <span className="text-neutral-400 dark:text-neutral-500" aria-hidden="true">
            ▾
          </span>
        </summary>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {hasSources && (
            <ul className="px-4 py-3 space-y-3">
              {sources.map((source, idx) => {
                const config =
                  SOURCE_CONFIG[source.type as SourceType] ?? SOURCE_CONFIG.other;
                const { Icon } = config;

                if (source.isAnonymous) {
                  return (
                    <li key={idx} className="flex items-start gap-3">
                      <Shield
                        className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
                        aria-hidden="true"
                      />
                      <div>
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Anonymous {config.label}
                        </span>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">
                          Identity protected per editorial policy
                        </p>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={idx} className="flex items-start gap-3">
                    <Icon
                      className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {source.url ? (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[#D70606] hover:underline inline-flex items-center gap-1"
                          >
                            {source.label}
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        ) : (
                          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                            {source.label}
                          </span>
                        )}
                        {source.type && (
                          <span className="text-[10px] font-black uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-neutral-500 dark:text-neutral-400">
                            {config.label}
                          </span>
                        )}
                      </div>
                      {source.description && (
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                          {source.description}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {methodology && (
            <blockquote className="px-4 py-3 border-l-2 border-neutral-300 dark:border-neutral-600 mx-4 my-3">
              <p className="text-xs font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">
                Methodology
              </p>
              <p className="text-sm italic text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {methodology}
              </p>
            </blockquote>
          )}
        </div>
      </details>
    </section>
  );
}
```

### Step 5 — Article Page Integration

```tsx
// src/app/(user)/articles/[slug]/page.tsx

import { SourcesPanel } from '@/components/post/SourcesPanel';

// After the article body PortableText, before related articles:
<SourcesPanel
  sources={article.sources}
  methodology={article.methodology}
/>
```

## Implementation Plan

1. **Schema upgrade** — Replace the existing minimal `sources` array in `src/models/schema/article.ts` with the enriched object schema; add the new `methodology` text field.
2. **GROQ update** — Update `queryArticleBySlug` in `src/lib/sanity/lib/queries.ts` to project all new source fields including `isAnonymous`, `description`, and `type`.
3. **TypeScript types** — Add `ArticleSource` and `SourceType` to the article types file.
4. **SourcesPanel component** — Create `src/components/post/SourcesPanel.tsx` per Step 4.
5. **Article page** — Import and render `SourcesPanel` after body content.
6. **Studio QA** — Verify all source fields render in Studio; test anonymous source preview.
7. **UI QA** — Test panel in light and dark mode with various combinations (0 sources, anonymous sources, linked sources, methodology only, both).

## Files Affected

- `src/models/schema/article.ts` — replace `sources` array, add `methodology` field
- `src/lib/sanity/lib/queries.ts` — update `queryArticleBySlug` projection
- `src/models/types/article.ts` — add `ArticleSource`, `SourceType` types
- `src/components/post/SourcesPanel.tsx` — **new file**
- `src/app/(user)/articles/[slug]/page.tsx` — render SourcesPanel after body

## Deliverables Checklist

### Schema
- [ ] `sources` array upgraded: adds `type` (dropdown), `description` (text), `isAnonymous` (boolean) fields
- [ ] `methodology` text field added to article schema
- [ ] Source preview in Sanity Studio shows "Anonymous Source" label for anonymous entries
- [ ] Existing source data (label + url) preserved

### GROQ Queries
- [ ] `queryArticleBySlug` projects `sources[] { label, type, url, description, isAnonymous }`
- [ ] `queryArticleBySlug` projects `methodology`

### Components
- [ ] `SourcesPanel` created and renders only when sources or methodology present
- [ ] Uses native `<details>`/`<summary>` — works without JavaScript
- [ ] Anonymous sources show Shield icon and "Anonymous [type]" label without exposing identity
- [ ] Linked sources open in new tab with `rel="noopener noreferrer"`
- [ ] Source type badge displayed for each source
- [ ] Methodology rendered in distinct blockquote style
- [ ] Correct icon for each source type (FileText, Mic, MessageSquare, Database, Video, Eye)
- [ ] Panel is fully accessible: section has `aria-label`

### Article Page
- [ ] SourcesPanel rendered after article body, before related articles and ads
- [ ] Component does not render if `sources` is empty and `methodology` is not set
- [ ] Collapsed by default on page load

### QA
- [ ] Renders correctly with 0 sources + methodology
- [ ] Renders correctly with only anonymous sources
- [ ] Renders correctly with mix of anonymous and named sources
- [ ] Renders correctly with only linked sources
- [ ] Dark mode verified
- [ ] No TypeScript errors
- [ ] No hydration mismatch (`<details>` is SSR-safe)
