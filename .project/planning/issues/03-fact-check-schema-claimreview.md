<!-- GitHub Issue: #25 -->

## Problem

Fact-checking is among the highest-credibility content a news outlet can publish, and Google gives it special treatment in search results. Any publisher implementing the `ClaimReview` schema.org structured data gets a dedicated fact-check badge displayed inline in Google Search results — this is one of the few rich result types explicitly designed for journalism outlets and requires zero paid tools to implement.

UnTelevised Media currently has no fact-check content type, no structured data support for `ClaimReview`, and no `/fact-check` route. The outlet covers contentious political and social topics where fact-checking is directly relevant to its mission. Without this infrastructure, the outlet misses one of the clearest SEO + credibility wins available for a news site.

The impact is compounded: `ClaimReview` data is also ingested by Google's fact-check tools, surfaced in news carousels, and used by news aggregators and AI citation systems. Each published fact-check builds domain authority for the `untelevised.media` fact-check sub-corpus.

## Background & Context

The codebase uses Sanity v3 with schemas in `src/models/schema/`. The `blockContent` type already exists for rich text. The `author` schema exists for reviewer references. The `article` schema already has a `relatedArticles` array. A `StructuredData` component likely exists or needs to be created at `src/components/seo/StructuredData.tsx` for JSON-LD injection. The site uses `generateMetadata` for per-page metadata and ISR via `sanityFetch` with tags.

The schema must be registered in `src/models/schema/index.ts` and imported in the root `sanity.config.ts`. New routes go in `src/app/(user)/` following the existing pattern.

## Architecture

```
Sanity Studio
  └── factCheck document
        ├── claim (text) — the claim being reviewed
        ├── claimSource (string) — who made it
        ├── claimUrl (url) — where it was made
        ├── claimDate (datetime)
        ├── rating (string enum) — true/mostly-true/misleading/mostly-false/false/unverifiable
        ├── ratingExplanation (text) — 1–2 sentence verdict
        ├── body (blockContent) — full analysis
        ├── sources[] (url array)
        ├── author -> author
        ├── publishedAt (datetime)
        └── relatedArticles[] -> article
                │
                ▼
     GROQ queries
       queryAllFactChecks  → /fact-checks index
       queryFactCheckBySlug → /fact-check/[slug]
                │
                ▼
  /fact-checks/page.tsx         /fact-check/[slug]/page.tsx
    FactCheckCard list             VerdictBadge
    (verdict badge on card)        Claim blockquote
                                   Full analysis body
                                   Sources list
                                   Related articles
                                   ClaimReview JSON-LD (injected in <head>)
                │
                ▼
     ClaimReview JSON-LD
       @type: ClaimReview
       claimReviewed: claim text
       itemReviewed: { author, datePublished, url }
       reviewRating: { ratingValue, alternateName }
       author: UnTelevised Media
```

## Proposed Solution

### Step 1 — New Sanity Schema: factCheck

```typescript
// src/models/schema/factCheck.ts
import { defineField, defineType } from 'sanity';
import { CheckSquare } from 'lucide-react';

export default defineType({
  name: 'factCheck',
  title: 'Fact Check',
  type: 'document',
  icon: CheckSquare,
  groups: [
    { name: 'claim', title: 'The Claim', default: true },
    { name: 'verdict', title: 'Verdict' },
    { name: 'analysis', title: 'Analysis' },
    { name: 'meta', title: 'Meta / SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Article Title',
      type: 'string',
      group: 'meta',
      description: 'Headline for the fact-check article (not the claim itself)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'meta',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'meta',
    }),
    defineField({
      name: 'author',
      title: 'Fact-Checker / Author',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'meta',
    }),
    // Claim fields
    defineField({
      name: 'claim',
      title: 'The Claim Being Checked',
      type: 'text',
      rows: 3,
      group: 'claim',
      description: 'Quote the claim verbatim or as close to verbatim as possible.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'claimSource',
      title: 'Who Made This Claim',
      type: 'string',
      group: 'claim',
      description: 'Full name or entity. E.g. "Sen. John Smith", "Facebook post circulating April 2024"',
    }),
    defineField({
      name: 'claimUrl',
      title: 'URL Where Claim Was Made',
      type: 'url',
      group: 'claim',
      description: 'Direct link to original claim (tweet, speech transcript, article, etc.)',
    }),
    defineField({
      name: 'claimDate',
      title: 'Date Claim Was Made',
      type: 'datetime',
      group: 'claim',
    }),
    // Verdict fields
    defineField({
      name: 'rating',
      title: 'Verdict',
      type: 'string',
      group: 'verdict',
      options: {
        list: [
          { title: '✅ True', value: 'true' },
          { title: '🟢 Mostly True', value: 'mostly-true' },
          { title: '🟡 Misleading', value: 'misleading' },
          { title: '🟠 Mostly False', value: 'mostly-false' },
          { title: '🔴 False', value: 'false' },
          { title: '⬜ Unverifiable', value: 'unverifiable' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ratingExplanation',
      title: 'Verdict Explanation',
      type: 'text',
      rows: 3,
      group: 'verdict',
      description: '1–2 sentence plain-language explanation of the verdict. Used in search snippets.',
      validation: (Rule) => Rule.required().max(300),
    }),
    // Analysis
    defineField({
      name: 'body',
      title: 'Full Analysis',
      type: 'blockContent',
      group: 'analysis',
    }),
    defineField({
      name: 'sources',
      title: 'Sources',
      type: 'array',
      group: 'analysis',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Source Label' }),
            defineField({ name: 'url', type: 'url', title: 'URL' }),
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        },
      ],
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      group: 'analysis',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
      validation: (Rule) => Rule.max(5),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      rating: 'rating',
      publishedAt: 'publishedAt',
    },
    prepare({ title, rating, publishedAt }) {
      const ratingEmoji: Record<string, string> = {
        true: '✅',
        'mostly-true': '🟢',
        misleading: '🟡',
        'mostly-false': '🟠',
        false: '🔴',
        unverifiable: '⬜',
      };
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString()
        : 'No date';
      return {
        title: `${ratingEmoji[rating] ?? '?'} ${title}`,
        subtitle: date,
      };
    },
  },
});
```

### Step 2 — Register Schema

```typescript
// src/models/schema/index.ts — add factCheck to schemaTypes array
import factCheck from './factCheck';

export const schemaTypes = [
  // ... existing types
  factCheck,
];
```

### Step 3 — GROQ Queries

```typescript
// src/lib/sanity/lib/queries.ts

export const queryAllFactChecks = groq`
  *[_type == 'factCheck'] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    claim,
    claimSource,
    rating,
    ratingExplanation,
    author-> { name, slug }
  }
`;

export const queryFactCheckBySlug = groq`
  *[_type == 'factCheck' && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    claim,
    claimSource,
    claimUrl,
    claimDate,
    rating,
    ratingExplanation,
    body,
    sources[] { label, url },
    author-> { name, slug, image },
    relatedArticles[]-> {
      _id, title, slug, mainImage, publishedAt, description
    }
  }
`;
```

### Step 4 — Verdict Configuration

```typescript
// src/lib/factCheck/verdictConfig.ts

export type FactCheckRating =
  | 'true'
  | 'mostly-true'
  | 'misleading'
  | 'mostly-false'
  | 'false'
  | 'unverifiable';

export interface VerdictConfig {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  ratingValue: number; // schema.org 1-5 scale
  bestRating: number;
  worstRating: number;
}

export const VERDICT_CONFIG: Record<FactCheckRating, VerdictConfig> = {
  true: {
    label: 'TRUE',
    bgClass: 'bg-green-600',
    textClass: 'text-white',
    borderClass: 'border-green-600',
    ratingValue: 5,
    bestRating: 5,
    worstRating: 1,
  },
  'mostly-true': {
    label: 'MOSTLY TRUE',
    bgClass: 'bg-green-400',
    textClass: 'text-black',
    borderClass: 'border-green-400',
    ratingValue: 4,
    bestRating: 5,
    worstRating: 1,
  },
  misleading: {
    label: 'MISLEADING',
    bgClass: 'bg-amber-400',
    textClass: 'text-black',
    borderClass: 'border-amber-400',
    ratingValue: 3,
    bestRating: 5,
    worstRating: 1,
  },
  'mostly-false': {
    label: 'MOSTLY FALSE',
    bgClass: 'bg-orange-500',
    textClass: 'text-white',
    borderClass: 'border-orange-500',
    ratingValue: 2,
    bestRating: 5,
    worstRating: 1,
  },
  false: {
    label: 'FALSE',
    bgClass: 'bg-[#D70606]',
    textClass: 'text-white',
    borderClass: 'border-[#D70606]',
    ratingValue: 1,
    bestRating: 5,
    worstRating: 1,
  },
  unverifiable: {
    label: 'UNVERIFIABLE',
    bgClass: 'bg-neutral-500',
    textClass: 'text-white',
    borderClass: 'border-neutral-500',
    ratingValue: 0,
    bestRating: 5,
    worstRating: 1,
  },
};
```

### Step 5 — VerdictBadge Component

```tsx
// src/components/fact-check/VerdictBadge.tsx
import { VERDICT_CONFIG, type FactCheckRating } from '@/lib/factCheck/verdictConfig';

interface VerdictBadgeProps {
  rating: FactCheckRating;
  size?: 'sm' | 'lg';
}

export function VerdictBadge({ rating, size = 'sm' }: VerdictBadgeProps) {
  const config = VERDICT_CONFIG[rating];
  if (!config) return null;

  const sizeClass =
    size === 'lg'
      ? 'px-4 py-2 text-sm font-black'
      : 'px-2 py-0.5 text-xs font-black';

  return (
    <span
      className={`inline-block uppercase tracking-widest ${sizeClass} ${config.bgClass} ${config.textClass}`}
    >
      {config.label}
    </span>
  );
}
```

### Step 6 — ClaimReview JSON-LD

```typescript
// src/lib/factCheck/claimReviewJsonLd.ts
import { VERDICT_CONFIG, type FactCheckRating } from './verdictConfig';

interface FactCheckDoc {
  title: string;
  slug: { current: string };
  publishedAt: string;
  claim: string;
  claimSource?: string;
  claimUrl?: string;
  claimDate?: string;
  rating: FactCheckRating;
  ratingExplanation: string;
}

const SITE_URL = 'https://untelevised.media';

export function buildClaimReviewJsonLd(fc: FactCheckDoc): object {
  const config = VERDICT_CONFIG[fc.rating];
  const pageUrl = `${SITE_URL}/fact-check/${fc.slug.current}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ClaimReview',
    url: pageUrl,
    datePublished: fc.publishedAt,
    claimReviewed: fc.claim,
    itemReviewed: {
      '@type': 'Claim',
      ...(fc.claimSource && {
        author: { '@type': 'Person', name: fc.claimSource },
      }),
      ...(fc.claimDate && { datePublished: fc.claimDate }),
      ...(fc.claimUrl && {
        appearance: { '@type': 'OpinionNewsArticle', url: fc.claimUrl },
      }),
    },
    author: {
      '@type': 'Organization',
      name: 'UnTelevised Media',
      url: SITE_URL,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: config.ratingValue,
      bestRating: config.bestRating,
      worstRating: config.worstRating,
      alternateName: config.label,
    },
  };
}
```

### Step 7 — Fact-Check Detail Page

```tsx
// src/app/(user)/fact-check/[slug]/page.tsx
import { sanityFetch } from '@/lib/sanity/lib/fetch';
import { queryFactCheckBySlug, queryAllFactChecks } from '@/lib/sanity/lib/queries';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import { VerdictBadge } from '@/components/fact-check/VerdictBadge';
import { buildClaimReviewJsonLd } from '@/lib/factCheck/claimReviewJsonLd';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const factChecks = await sanityFetch({ query: queryAllFactChecks });
  return factChecks.map((fc: { slug: { current: string } }) => ({
    slug: fc.slug.current,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fc = await sanityFetch({ query: queryFactCheckBySlug, params: { slug } });
  if (!fc) return {};
  return {
    title: `Fact Check: ${fc.title} | UnTelevised Media`,
    description: fc.ratingExplanation,
    openGraph: {
      title: fc.title,
      description: fc.ratingExplanation,
    },
  };
}

export default async function FactCheckPage({ params }: Props) {
  const { slug } = await params;
  const fc = await sanityFetch({
    query: queryFactCheckBySlug,
    params: { slug },
    tags: ['factCheck'],
  });

  if (!fc) notFound();

  const jsonLd = buildClaimReviewJsonLd(fc);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-2">
          <VerdictBadge rating={fc.rating} size="lg" />
        </div>
        <h1 className="mt-4 text-3xl font-black uppercase tracking-tight">
          {fc.title}
        </h1>
        <blockquote className="my-6 border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 italic text-neutral-600 dark:text-neutral-300">
          <p className="text-xs font-black uppercase tracking-widest not-italic text-neutral-400 mb-1">
            The Claim
          </p>
          {fc.claim}
          {fc.claimSource && (
            <footer className="mt-2 text-xs not-italic text-neutral-500">
              — {fc.claimSource}
              {fc.claimUrl && (
                <a
                  href={fc.claimUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-[#D70606] hover:underline"
                >
                  [source]
                </a>
              )}
            </footer>
          )}
        </blockquote>

        <div className="my-4 border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">
            Verdict
          </p>
          <p className="text-sm leading-relaxed">{fc.ratingExplanation}</p>
        </div>

        {fc.body && (
          <div className="prose prose-neutral dark:prose-invert max-w-none mt-6">
            <PortableText value={fc.body} />
          </div>
        )}

        {fc.sources && fc.sources.length > 0 && (
          <section className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <h2 className="text-xs font-black uppercase tracking-widest mb-3">Sources</h2>
            <ul className="space-y-1">
              {fc.sources.map((s: { label: string; url?: string }, i: number) => (
                <li key={i} className="text-sm">
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#D70606] hover:underline"
                    >
                      {s.label}
                    </a>
                  ) : (
                    s.label
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
```

### Step 8 — Fact-Checks Index Page

```tsx
// src/app/(user)/fact-checks/page.tsx
import { sanityFetch } from '@/lib/sanity/lib/fetch';
import { queryAllFactChecks } from '@/lib/sanity/lib/queries';
import { VerdictBadge } from '@/components/fact-check/VerdictBadge';
import Link from 'next/link';
import { formatDate } from '@/util/formatDate';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fact Checks | UnTelevised Media',
  description:
    'UnTelevised Media fact-checks viral claims, political statements, and misinformation with original reporting.',
};

export default async function FactChecksPage() {
  const factChecks = await sanityFetch({
    query: queryAllFactChecks,
    tags: ['factCheck'],
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 bg-[#D70606] px-4 py-3">
        <h1 className="text-xs font-black uppercase tracking-widest text-white">
          Fact Checks
        </h1>
      </div>
      <div className="space-y-px">
        {factChecks.map((fc: {
          _id: string;
          title: string;
          slug: { current: string };
          publishedAt: string;
          claim: string;
          rating: string;
          ratingExplanation: string;
        }) => (
          <Link
            key={fc._id}
            href={`/fact-check/${fc.slug.current}`}
            className="flex items-start gap-4 border border-neutral-200 dark:border-neutral-700 p-4 hover:border-[#D70606] transition-colors"
          >
            <div className="shrink-0 mt-0.5">
              <VerdictBadge rating={fc.rating as any} />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                {fc.title}
              </h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                {fc.claim}
              </p>
              {fc.publishedAt && (
                <time className="text-xs text-neutral-400 mt-1 block">
                  {formatDate(fc.publishedAt)}
                </time>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

### Step 9 — Sitemap Integration

```typescript
// src/app/sitemap.ts — add fact-check routes

const factChecks = await sanityFetch({ query: queryAllFactChecks });
const factCheckUrls = factChecks.map((fc: { slug: { current: string }; publishedAt: string }) => ({
  url: `${SITE_URL}/fact-check/${fc.slug.current}`,
  lastModified: new Date(fc.publishedAt),
  changeFrequency: 'weekly' as const,
  priority: 0.7,
}));

// Add factCheckUrls to the returned array
```

## Implementation Plan

1. **Create schema** — Write `src/models/schema/factCheck.ts` per Step 1.
2. **Register schema** — Add `factCheck` to `src/models/schema/index.ts`.
3. **GROQ queries** — Add `queryAllFactChecks` and `queryFactCheckBySlug` to `src/lib/sanity/lib/queries.ts`.
4. **Verdict config** — Create `src/lib/factCheck/verdictConfig.ts` with the 6-verdict mapping.
5. **ClaimReview builder** — Create `src/lib/factCheck/claimReviewJsonLd.ts`.
6. **VerdictBadge component** — Create `src/components/fact-check/VerdictBadge.tsx`.
7. **Detail page** — Create `src/app/(user)/fact-check/[slug]/page.tsx` with `generateMetadata`, `generateStaticParams`, and JSON-LD injection.
8. **Index page** — Create `src/app/(user)/fact-checks/page.tsx`.
9. **Sitemap** — Update `src/app/sitemap.ts` to include fact-check URLs.
10. **QA** — Create a test fact-check in Sanity Studio; verify ClaimReview JSON-LD renders; validate with Google's Rich Results Test.

## Files Affected

- `src/models/schema/factCheck.ts` — **new file**
- `src/models/schema/index.ts` — register factCheck
- `src/lib/sanity/lib/queries.ts` — add queryAllFactChecks, queryFactCheckBySlug
- `src/lib/factCheck/verdictConfig.ts` — **new file**
- `src/lib/factCheck/claimReviewJsonLd.ts` — **new file**
- `src/components/fact-check/VerdictBadge.tsx` — **new file**
- `src/app/(user)/fact-check/[slug]/page.tsx` — **new file**
- `src/app/(user)/fact-checks/page.tsx` — **new file**
- `src/app/sitemap.ts` — add fact-check URLs

## Deliverables Checklist

### Schema
- [ ] `factCheck` document schema created with all fields
- [ ] Schema registered in `src/models/schema/index.ts`
- [ ] Sanity Studio renders fact-check with grouped tabs (Claim / Verdict / Analysis / Meta)
- [ ] Preview shows verdict emoji + title + date
- [ ] `rating` field uses radio buttons with emoji labels

### GROQ Queries
- [ ] `queryAllFactChecks` returns fields needed for index page cards
- [ ] `queryFactCheckBySlug` returns all fields for detail page

### Verdict System
- [ ] `verdictConfig.ts` created with all 6 rating values and Tailwind classes
- [ ] `VerdictBadge` component renders with correct color per rating
- [ ] False verdict uses `bg-[#D70606]` brand red
- [ ] `sm` and `lg` size variants both work

### JSON-LD
- [ ] `buildClaimReviewJsonLd` generates valid ClaimReview object
- [ ] `ratingValue` maps correctly (true=5, mostly-true=4, misleading=3, mostly-false=2, false=1, unverifiable=0)
- [ ] JSON-LD injected via `<script type="application/ld+json">` on detail page
- [ ] Validates in Google Rich Results Test

### Routes
- [ ] `/fact-check/[slug]` page renders: verdict badge, claim blockquote, verdict explanation, full analysis, sources
- [ ] `/fact-check/[slug]` has `generateMetadata` and `generateStaticParams`
- [ ] `/fact-checks` index lists all fact-checks with verdict badges
- [ ] `notFound()` called when slug not found

### Sitemap
- [ ] Fact-check URLs included in `sitemap.ts`

### QA
- [ ] All 6 verdict variants render correctly in light and dark mode
- [ ] External claim URL opens in new tab
- [ ] Page renders cleanly on mobile
- [ ] No TypeScript errors
- [ ] ClaimReview JSON-LD passes Google validation
