<!-- GitHub Issue: #18 -->

## Problem

UnTelevised Media publishes investigative journalism and live coverage that generates genuine reader opinions, yet there is currently zero mechanism for audience discussion on the site. Reader comments are a core engagement driver for news outlets — they increase time-on-site, signal content quality to search engines, and build a loyal community around the publication. Without comments, readers consume content passively and leave without any connection to the platform or other readers.

The `comments` Sanity schema exists in the codebase and a `Comments` component was stubbed out, but both remain disabled. Rather than building a full self-hosted moderated comment system (which requires active spam moderation, database queries on every page load, and editorial overhead), integrating Giscus — which maps article discussions to GitHub Discussions — gives UnTelevised Media a production-grade comment system in a few hours with zero ongoing infrastructure cost.

GDPR compliance requires that third-party embeds like Giscus (which loads from `giscus.app` and sets cookies) only initialize after the reader has granted functional cookie consent. The existing `useConsent()` context in `src/lib/consent/context.ts` must gate the Giscus widget initialization to avoid consent violations and potential regulatory exposure.

## Background & Context

The codebase already has `@giscus/react` available as a candidate dependency. The Sanity `article` schema at `src/lib/sanity/schemas/article.ts` does not currently have an `allowComments` boolean field — this needs to be added so individual articles (e.g., breaking news with sensitive content) can have comments disabled per the editorial team's discretion. The consent system at `src/lib/consent/context.ts` exposes `useConsent()` which returns consent state by category (`functional`, `analytics`, `advertising`). Dark/light mode is controlled by `next-themes` via `useTheme()`.

The Giscus GitHub App must be installed on the repo and Discussions must be enabled before the component will work. The `mapping="specific"` + `term={slug}` approach maps each article to its own Discussion thread by slug, which is more reliable than URL-based mapping (which breaks if the article slug changes).

## Architecture

```
Article Page (Server Component)
│
├── Fetches article from Sanity (includes allowComments flag)
│
└── Renders <CommentsSection allowComments={article.allowComments} slug={article.slug.current} />
         │
         └── Client Component ('use client')
              ├── useConsent() → checks functionalConsent
              ├── useTheme() → resolves dark/light
              │
              ├── [No consent] → renders ConsentPrompt CTA
              ├── [allowComments === false] → renders "Comments disabled" message
              └── [Consent granted + allowed] → renders <Giscus ... />
                        │
                        └── Loads from giscus.app (iframe)
                              Maps to GitHub Discussions thread
                              by article slug as term
```

## Proposed Solution

### Step 1 — Install the Giscus React package

```bash
pnpm add @giscus/react
```

### Step 2 — Add `allowComments` to the Sanity article schema

```typescript
// src/lib/sanity/schemas/article.ts
// Add inside the fields array, after the existing body/content fields:

defineField({
  name: 'allowComments',
  title: 'Allow Comments',
  type: 'boolean',
  description: 'Enable the Giscus comment section for this article. Defaults to true.',
  initialValue: true,
  group: 'settings', // Add to existing settings group if present
}),
```

### Step 3 — Update the article GROQ query to include `allowComments`

```typescript
// src/lib/sanity/queries.ts
// In queryArticleBySlug or equivalent, add to projection:

export const queryArticleBySlug = groq`
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    _updatedAt,
    description,
    body,
    mainImage,
    allowComments,   // <-- add this field
    "author": author->{ name, slug, image, bio },
    "categories": categories[]->{ title, slug },
  }
`;
```

### Step 4 — Build the Comments client component

```typescript
// src/components/post/CommentsSection.tsx
'use client';

import { useEffect, useState } from 'react';
import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';
import { useConsent } from '@/lib/consent/context';
import { MessageSquare, Lock } from 'lucide-react';

interface CommentsSectionProps {
  slug: string;
  allowComments?: boolean;
}

export default function CommentsSection({
  slug,
  allowComments = true,
}: CommentsSectionProps) {
  const { resolvedTheme } = useTheme();
  const { functionalConsent } = useConsent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!allowComments) {
    return (
      <div className="border border-border py-8 px-6 flex items-center gap-3 text-muted-foreground">
        <Lock className="h-4 w-4 shrink-0" />
        <span className="text-xs uppercase tracking-widest font-semibold">
          Comments are disabled for this article.
        </span>
      </div>
    );
  }

  if (!mounted) return null;

  if (!functionalConsent) {
    return (
      <div className="border border-border py-8 px-6 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-untele shrink-0" />
          <span className="text-xs uppercase tracking-widest font-black">
            Join the Discussion
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Comments require functional cookies to load. Update your cookie
          preferences to participate in the discussion.
        </p>
        <a
          href="/privacy-settings"
          className="inline-block bg-untele py-3 px-4 text-xs font-black uppercase tracking-widest text-white"
        >
          Update Cookie Preferences
        </a>
      </div>
    );
  }

  return (
    <section className="space-y-4" aria-label="Article comments">
      <div className="bg-untele px-4 py-2">
        <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Discussion
        </h2>
      </div>
      <Giscus
        repo={process.env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}`}
        repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID!}
        category="Comments"
        categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!}
        mapping="specific"
        term={slug}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        lang="en"
        loading="lazy"
      />
    </section>
  );
}
```

### Step 5 — Add Giscus environment variables

```bash
# .env.local (and Vercel environment variables)
NEXT_PUBLIC_GISCUS_REPO=your-org/untelevised-media
NEXT_PUBLIC_GISCUS_REPO_ID=R_xxxxxxxxxx        # from giscus.app configurator
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxxxxxxxxx  # from giscus.app configurator
```

### Step 6 — Integrate CommentsSection into the article page

```typescript
// src/app/(user)/articles/[slug]/page.tsx
// Add CommentsSection below the article body, above related articles:

import CommentsSection from '@/components/post/CommentsSection';

// In the JSX, after </article> or after the portable text renderer:
<CommentsSection
  slug={article.slug.current}
  allowComments={article.allowComments}
/>
```

### Step 7 — Update `.env.example` with Giscus variables

```bash
# src/.env.example — add:
NEXT_PUBLIC_GISCUS_REPO=           # e.g. your-org/untelevised-media
NEXT_PUBLIC_GISCUS_REPO_ID=        # Get from giscus.app
NEXT_PUBLIC_GISCUS_CATEGORY_ID=    # Get from giscus.app
```

### Step 8 — GitHub repo setup (manual prerequisite)

1. Go to the GitHub repo Settings → Features → check "Discussions"
2. Go to https://github.com/apps/giscus → Install → select the repo
3. Go to https://giscus.app → configure → copy `repoId` and `categoryId`
4. Create a "Comments" Discussion category in the repo (type: Announcement, so only maintainers can create threads but anyone can reply)

## Implementation Plan

1. `pnpm add @giscus/react`
2. Enable GitHub Discussions on the repo and install the Giscus GitHub App
3. Generate `repoId` and `categoryId` via giscus.app configurator
4. Add `allowComments` field to `src/lib/sanity/schemas/article.ts`
5. Update `queryArticleBySlug` in `src/lib/sanity/queries.ts` to include `allowComments`
6. Build `src/components/post/CommentsSection.tsx`
7. Add Giscus env vars to `.env.local`, Vercel dashboard, and `.env.example`
8. Integrate `<CommentsSection>` into `src/app/(user)/articles/[slug]/page.tsx`
9. Test: dark/light mode sync, consent gate, `allowComments=false` path, GitHub login flow
10. Deploy and verify Giscus discussions are created correctly per article

## Files Affected

- `src/lib/sanity/schemas/article.ts` — add `allowComments` boolean field with `initialValue: true`
- `src/lib/sanity/queries.ts` — add `allowComments` to article-by-slug GROQ projection
- `src/components/post/CommentsSection.tsx` — new component (replaces/supersedes old disabled Comments.tsx)
- `src/app/(user)/articles/[slug]/page.tsx` — import and render `<CommentsSection>`
- `src/lib/consent/context.ts` — verify `functionalConsent` is exported (no change if already present)
- `.env.example` — add three NEXT_PUBLIC_GISCUS_* variables
- `package.json` / `pnpm-lock.yaml` — `@giscus/react` dependency added

## Deliverables Checklist

### GitHub & Giscus Setup
- [ ] Discussions feature enabled on the GitHub repository
- [ ] Giscus GitHub App installed on the repository
- [ ] "Comments" Discussion category created (Announcement type)
- [ ] `repoId` and `categoryId` retrieved from giscus.app configurator
- [ ] Giscus env vars added to Vercel project settings (production + preview)

### Dependency
- [ ] `@giscus/react` added via `pnpm add @giscus/react`
- [ ] Package appears in `package.json` dependencies

### Sanity Schema
- [ ] `allowComments` boolean field added to article schema
- [ ] Field has `initialValue: true` (comments on by default)
- [ ] Field description explains it controls the Giscus section
- [ ] `allowComments` included in `queryArticleBySlug` GROQ projection

### Component: CommentsSection
- [ ] Component is a `'use client'` component
- [ ] Reads `functionalConsent` from `useConsent()` context
- [ ] Reads `resolvedTheme` from `useTheme()`
- [ ] Uses `mounted` state to avoid hydration mismatch with localStorage/theme
- [ ] When `allowComments === false`: renders locked message, no Giscus iframe
- [ ] When no functional consent: renders consent CTA linking to `/privacy-settings`
- [ ] When consent granted: renders `<Giscus>` with correct props
- [ ] Giscus `mapping="specific"` with `term={slug}` (not URL-based)
- [ ] Theme prop dynamically set to `'dark'` or `'light'` based on `resolvedTheme`
- [ ] Header bar styled with `bg-untele` and white uppercase tracking-widest text
- [ ] Consent prompt styled consistently with site CTA pattern

### Article Page Integration
- [ ] `<CommentsSection>` imported and rendered on article page
- [ ] Positioned below article body, above related articles section
- [ ] `slug` and `allowComments` props correctly passed from article data

### Environment & Config
- [ ] `.env.example` updated with three Giscus variables and comments
- [ ] `.env.local` has real values (not committed to git)

### QA
- [ ] Comments render correctly on a test article in dark mode
- [ ] Comments render correctly in light mode
- [ ] Theme toggles update Giscus theme without page reload
- [ ] Consent gate blocks Giscus when functional cookies declined
- [ ] Setting `allowComments: false` on an article in Sanity Studio hides comments
- [ ] GitHub login flow works for posting a comment
- [ ] Reactions (👍 ❤️ 🚀) are visible and functional
- [ ] No hydration errors in browser console
- [ ] Works on mobile (Giscus iframe is responsive)
