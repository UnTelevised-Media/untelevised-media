<!-- GitHub Issue: #12 -->
## Problem

UnTelevised Media has no mechanism for editors to surface a breaking news alert across the entire site without a code deployment. During live events — a police shooting, a verdict, an emergency press conference — editors need to activate a site-wide "BREAKING" banner within seconds from Sanity Studio. Currently they cannot do this at all.

This is a core editorial tool gap. Every major news outlet (CNN, BBC, local TV station websites, independent news sites) has this capability. The absence of it means breaking news readers see nothing different about the site until they navigate to the specific article — if they find it at all.

The banner must be:
- Toggleable by non-technical editors with zero code changes
- Active within 30–60 seconds of toggling in Sanity Studio
- Dismissible by readers (per-session only — reappears on new visits or new tabs)
- Automatically expiring (editors can set a time after which the banner disappears without manual intervention)
- Accessible (keyboard dismissible, ARIA roles for screen readers)

## Background & Context

- The `siteSettings` singleton document already exists in the Sanity schema — it's the correct home for the breaking news banner configuration
- Tag-based ISR revalidation (`sanityFetch` with `tags: ['siteSettings']`) means updates in Sanity Studio can propagate to the live site in under 60 seconds without requiring a full rebuild
- The component must split server/client responsibilities: data fetching is a server concern (avoids hydration mismatch), dismiss state is a client concern (sessionStorage)
- `sessionStorage` (not `localStorage`) is appropriate for the dismiss flag — it resets when the browser tab closes, so returning visitors see the banner on new sessions

## Architecture

```
Sanity Studio
  └── siteSettings document
        └── breakingNewsBanner: {
              isActive: boolean,
              headline: string,
              linkUrl: string,
              linkLabel: string,
              expiresAt: datetime (optional)
            }

ISR Cache (Vercel CDN)
  └── siteSettings tagged content revalidates within 30–60s of Studio edit

Server Component Tree
  └── src/app/(user)/layout.tsx
        ├── <BreakingNewsBanner />   ← fetches siteSettings, decides to render
        │     └── If isActive && not expired → renders <BreakingNewsBannerClient />
        └── <Header />

BreakingNewsBanner (server component)
  └── Fetches siteSettings.breakingNewsBanner
  └── Checks: isActive === true
  └── Checks: expiresAt is null OR expiresAt > new Date()
  └── Returns null or <BreakingNewsBannerClient banner={...} />

BreakingNewsBannerClient (client component)
  └── On mount: checks sessionStorage for dismiss flag
  └── If dismissed flag present → renders null
  └── Renders banner UI
  └── Dismiss button → sets sessionStorage flag → hides banner
```

## Proposed Solution

### Step 1 — Update `siteSettings` Schema

```typescript
// src/lib/sanity/schemas/siteSettings.ts
// Add to the fields array, at the top of the form for visibility:

defineField({
  name: 'breakingNewsBanner',
  title: 'Breaking News Banner',
  type: 'object',
  group: 'breaking',
  description: 'Configure the site-wide breaking news banner. Toggle on/off instantly.',
  fields: [
    defineField({
      name: 'isActive',
      title: 'Show Banner',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle ON to show the breaking news banner across the entire site. Toggle OFF to hide it.',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Short breaking news headline. Keep under 80 characters.',
      validation: (Rule) => Rule.max(100).warning('Aim for 80 characters or fewer.'),
    }),
    defineField({
      name: 'linkUrl',
      title: 'Link URL',
      type: 'string',
      description: 'Internal path (e.g. /articles/my-article) or full external URL.',
    }),
    defineField({
      name: 'linkLabel',
      title: 'Link Label',
      type: 'string',
      initialValue: 'Read More',
      description: 'Text for the CTA link. e.g. "Read More", "Watch Live", "Follow Coverage".',
    }),
    defineField({
      name: 'expiresAt',
      title: 'Auto-Expire At',
      type: 'datetime',
      description: 'Optional: banner automatically hides after this time without manual toggle.',
    }),
  ],
  preview: {
    select: { isActive: 'isActive', headline: 'headline' },
    prepare({ isActive, headline }) {
      return {
        title: isActive ? '🔴 ACTIVE' : '⚫ Inactive',
        subtitle: headline ?? 'No headline set',
      }
    },
  },
}),
```

Also add a fieldGroup to surface the banner at the top of the siteSettings Studio form:

```typescript
groups: [
  {
    name: 'breaking',
    title: '🔴 Breaking News Banner',
    default: true, // Opens this group first in Studio
  },
  // ... other groups
],
```

### Step 2 — Update `querySiteSettings` GROQ Query

```typescript
// src/lib/sanity/queries.ts — update querySiteSettings:

export const querySiteSettings = groq`
  *[_type == "siteSettings"][0] {
    siteName,
    siteDescription,
    siteUrl,
    logo { asset-> },
    socialLinks,
    "breakingBanner": breakingNewsBanner {
      isActive,
      headline,
      linkUrl,
      linkLabel,
      expiresAt
    }
  }
`
```

### Step 3 — Server Component (Data Fetch + Gating)

```typescript
// src/components/global/BreakingNewsBanner.tsx
import { sanityFetch } from '@/lib/sanity/fetch'
import { querySiteSettings } from '@/lib/sanity/queries'
import { BreakingNewsBannerClient } from './BreakingNewsBannerClient'

export async function BreakingNewsBanner() {
  const { data: settings } = await sanityFetch({
    query: querySiteSettings,
    tags: ['siteSettings'],
  })

  const banner = settings?.breakingBanner
  if (!banner?.isActive || !banner.headline) return null
  if (banner.expiresAt && new Date(banner.expiresAt) < new Date()) return null

  return (
    <BreakingNewsBannerClient
      headline={banner.headline}
      linkUrl={banner.linkUrl}
      linkLabel={banner.linkLabel ?? 'Read More'}
      expiresAt={banner.expiresAt}
    />
  )
}
```

### Step 4 — Client Component (Dismiss Logic + UI)

```typescript
// src/components/global/BreakingNewsBannerClient.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Props {
  headline: string
  linkUrl: string
  linkLabel: string
  expiresAt?: string
}

export function BreakingNewsBannerClient({ headline, linkUrl, linkLabel, expiresAt }: Props) {
  const [dismissed, setDismissed] = useState(true) // Start hidden to avoid flash
  const sessionKey = `untele_banner_${btoa(headline).slice(0, 16)}`

  useEffect(() => {
    if (!sessionStorage.getItem(sessionKey)) {
      if (expiresAt && new Date(expiresAt) < new Date()) return
      setDismissed(false)
    }
  }, [sessionKey, expiresAt])

  function handleDismiss() {
    sessionStorage.setItem(sessionKey, '1')
    setDismissed(true)
  }

  if (dismissed) return null

  const isExternal = linkUrl?.startsWith('http')

  return (
    <div
      role="banner"
      aria-label="Breaking news alert"
      className="relative flex items-center justify-between gap-4 bg-untele px-4 py-2 text-white"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="h-2 w-2 animate-pulse bg-white" aria-hidden="true" />
          <span className="text-xs font-black uppercase tracking-widest">Breaking</span>
        </span>
        <span className="truncate text-sm font-semibold">{headline}</span>
      </div>
      {linkUrl && (
        isExternal ? (
          <a href={linkUrl} target="_blank" rel="noopener noreferrer"
            className="shrink-0 border border-white/40 px-3 py-1 text-xs font-black uppercase tracking-widest hover:bg-white/10">
            {linkLabel} →
          </a>
        ) : (
          <Link href={linkUrl}
            className="shrink-0 border border-white/40 px-3 py-1 text-xs font-black uppercase tracking-widest hover:bg-white/10">
            {linkLabel} →
          </Link>
        )
      )}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss breaking news banner"
        className="shrink-0 p-1 text-white/70 hover:text-white focus:outline-none focus:ring-1 focus:ring-white"
      >
        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
```

### Step 5 — Layout Integration

```typescript
// src/app/(user)/layout.tsx
import { BreakingNewsBanner } from '@/components/global/BreakingNewsBanner'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreakingNewsBanner />
      <Header />
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  )
}
```

## Implementation Plan

1. **Schema** — Add `breakingNewsBanner` object field to `src/lib/sanity/schemas/siteSettings.ts`. Add `groups` array with "Breaking News Banner" as default-open group.
2. **Query** — Update `querySiteSettings` in `src/lib/sanity/queries.ts` to project `breakingBanner` fields.
3. **Server component** — Create `src/components/global/BreakingNewsBanner.tsx` that fetches siteSettings, checks `isActive` and server-side `expiresAt`, and renders the client component.
4. **Client component** — Create `src/components/global/BreakingNewsBannerClient.tsx` with sessionStorage-based dismiss logic and full banner UI.
5. **Layout** — Import and render `<BreakingNewsBanner />` at the top of `src/app/(user)/layout.tsx`.
6. **Revalidation** — Verify `sanityFetch` call uses `tags: ['siteSettings']`.
7. **Studio QA** — Toggle `isActive` on in Studio; verify banner appears on site within 60s.
8. **Expiry QA** — Set `expiresAt` to 2 minutes in the future; verify banner auto-hides.
9. **Dismiss QA** — Click dismiss; reload page; verify banner does NOT reappear. Open new tab; verify it DOES reappear.

## Files Affected

- `src/lib/sanity/schemas/siteSettings.ts` — add `breakingNewsBanner` object field + `groups`
- `src/lib/sanity/queries.ts` — update `querySiteSettings` to project `breakingBanner`
- `src/components/global/BreakingNewsBanner.tsx` — new server component
- `src/components/global/BreakingNewsBannerClient.tsx` — new client component
- `src/app/(user)/layout.tsx` — add `<BreakingNewsBanner />` above header

## Deliverables Checklist

### Sanity Schema
- [ ] `breakingNewsBanner` object field added to `siteSettings` schema
- [ ] `isActive` boolean field, `initialValue: false`
- [ ] `headline` string field with max-100 validation warning
- [ ] `linkUrl` string field accepting both internal paths and external URLs
- [ ] `linkLabel` string field, `initialValue: 'Read More'`
- [ ] `expiresAt` datetime field (optional)
- [ ] `breakingNewsBanner` appears in Sanity Studio siteSettings document
- [ ] Field group named "Breaking News Banner" created and set as default-open group
- [ ] Object preview shows ACTIVE/Inactive status with headline subtitle

### GROQ Query
- [ ] `querySiteSettings` updated to project `breakingBanner` fields: `isActive`, `headline`, `linkUrl`, `linkLabel`, `expiresAt`
- [ ] Query tested in Sanity Vision tool and returns expected fields

### Server Component
- [ ] `src/components/global/BreakingNewsBanner.tsx` created as async server component
- [ ] Fetches siteSettings with `tags: ['siteSettings']` for ISR revalidation
- [ ] Returns `null` when `isActive === false`
- [ ] Returns `null` when `headline` is empty/undefined
- [ ] Returns `null` when `expiresAt` is set and has passed (server-side check)
- [ ] Passes correct props to `BreakingNewsBannerClient`

### Client Component
- [ ] `src/components/global/BreakingNewsBannerClient.tsx` created as `'use client'`
- [ ] Initial `dismissed` state is `true` to prevent flash of banner before sessionStorage check
- [ ] `useEffect` checks `sessionStorage` for dismiss flag on mount
- [ ] `useEffect` performs client-side `expiresAt` check as secondary guard
- [ ] Session key derived from headline (unique per headline, auto-resets on headline change)
- [ ] Dismiss button sets sessionStorage flag and hides banner
- [ ] Banner renders with `role="banner"` and `aria-label="Breaking news alert"`
- [ ] Pulsing `bg-white` dot next to "BREAKING" label
- [ ] Headline text with `truncate` to avoid overflow on narrow screens
- [ ] CTA link works for internal paths (uses `<Link>`) and external URLs (uses `<a target="_blank">`)
- [ ] Dismiss button (×) with `aria-label="Dismiss breaking news banner"`
- [ ] Dismiss button has visible focus ring (`focus:ring-1 focus:ring-white`)
- [ ] Full `bg-untele` red background, white text, sharp edges (no border-radius)

### Layout Integration
- [ ] `<BreakingNewsBanner />` imported and rendered in `src/app/(user)/layout.tsx`
- [ ] Component renders above `<Header />` and `<Nav />`
- [ ] Banner does not affect layout when not active (renders null — no empty space)

### ISR & Revalidation
- [ ] `sanityFetch` in server component uses `tags: ['siteSettings']`
- [ ] Verified: toggling `isActive` in Studio revalidates banner within 60 seconds on Vercel
- [ ] Verified: revalidation works via `next/cache` tag invalidation webhook from Sanity

### QA
- [ ] Banner appears site-wide when `isActive` toggled on in Studio
- [ ] Banner disappears within 60s when `isActive` toggled off
- [ ] Banner is correctly styled: full-width, `bg-untele`, white text, sharp edges
- [ ] Dismiss button hides banner for the session (persists across page navigations)
- [ ] Banner reappears in a new browser tab / new session after dismiss
- [ ] Banner auto-hides client-side when `expiresAt` passes
- [ ] CTA link navigates correctly (internal and external)
- [ ] Banner is keyboard navigable: Tab to CTA link → Tab to dismiss → Enter to activate
- [ ] Screen reader reads "Breaking news alert" role and headline text
- [ ] Banner does not appear on `/studio/*` routes (admin layout excluded)
- [ ] `pnpm build` passes without TypeScript errors
