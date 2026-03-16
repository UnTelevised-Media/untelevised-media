<!-- GitHub Issue: #11 -->
## Problem

Live event pages at `/live-event/[slug]` are statically rendered at request time. Once a reader loads the page, it does not update — new key events, updated status fields, or live notes added by editors in Sanity Studio are invisible until the reader manually refreshes. During an active breaking news event (a protest, trial verdict, press conference, police incident), this completely undermines the value of a "live" coverage page.

Readers monitoring breaking events expect:
- New key event entries to appear without full page reload
- A clear visual signal that the page is actively monitored and updated
- Minimal disruption to their reading position when updates arrive

The existing `SanityLive` component (from `next-sanity`) is present in the layout for Sanity's live content preview channel, but this channel is designed for authenticated Studio preview users — it should not be relied upon as the public reader-facing update mechanism. A separate, production-safe polling approach is needed.

## Background & Context

- Next.js 15 App Router pages are server components — they cannot re-render themselves in response to remote state changes
- `router.refresh()` in Next.js 15 re-runs the current route's server component without a full navigation, updating the UI with fresh data while preserving client state (scroll position, focus)
- Sanity's `_updatedAt` field is automatically updated on every document mutation — a lightweight check comparing this timestamp is cheaper than re-fetching the full document
- 60-second polling is appropriate for a live event context: frequent enough to not feel stale, infrequent enough to avoid unnecessary load on Sanity's API and Vercel function compute
- Vercel's Edge Cache means the lightweight poll API route can be cached at the edge for 30 seconds — meaning 10 concurrent readers on a live event generate at most 1 Sanity API call per 30 seconds

## Architecture

```
Live Event Page (/live-event/[slug])
  ├── Server Component (renders initial state)
  │     └── Fetches full event doc: keyEvents, status, updatedAt
  └── LiveEventClientWrapper (client component island)
        ├── Props: { slug, initialUpdatedAt, initialKeyEventCount }
        ├── useLiveEventPolling hook
        │     └── setInterval(60_000)
        │           └── GET /api/live-event-check?slug=[slug]
        │                 └── Returns { updatedAt, keyEventCount }
        │                 └── If updatedAt > initialUpdatedAt → setHasUpdate(true)
        ├── LiveUpdateBanner (conditionally rendered)
        │     └── "New updates available — Refresh"
        │     └── onClick: router.refresh() + setHasUpdate(false)
        │     └── onDismiss: setHasUpdate(false) — no refresh
        └── LiveIndicatorBadge (always rendered on active events)
              └── Pulsing red dot + "LIVE" text

API Route: /api/live-event-check?slug=[slug]
  └── Sanity fetch: *[_type=="liveEvent" && slug.current==$slug][0]{_updatedAt, "count": count(keyEvent)}
  └── Cache-Control: s-maxage=30, stale-while-revalidate=60
  └── Returns: { updatedAt: string, keyEventCount: number }

LiveWidget Cards (on homepage / category pages)
  └── LiveIndicatorBadge added to active event cards
```

## Proposed Solution

### Step 1 — Lightweight Poll API Route

```typescript
// src/app/api/live-event-check/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sanityFetch } from '@/lib/sanity/fetch'
import { queryLiveEventLastUpdated } from '@/lib/sanity/queries'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 })
  }
  try {
    const { data } = await sanityFetch({
      query: queryLiveEventLastUpdated,
      params: { slug },
      tags: [`liveEvent:${slug}`],
    })
    if (!data) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    return NextResponse.json(
      { updatedAt: data._updatedAt, keyEventCount: data.keyEventCount },
      { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' } }
    )
  } catch (error) {
    console.error('[live-event-check] Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

### Step 2 — GROQ Query

```typescript
// src/lib/sanity/queries.ts — add:

export const queryLiveEventLastUpdated = groq`
  *[_type == "liveEvent" && slug.current == $slug][0] {
    _updatedAt,
    "keyEventCount": count(keyEvent)
  }
`
```

### Step 3 — Polling Hook

```typescript
// src/hooks/useLiveEventPolling.ts
'use client'

import { useEffect, useRef } from 'react'

interface PollResult {
  updatedAt: string
  keyEventCount: number
}

interface Options {
  intervalMs?: number
  enabled?: boolean
}

export function useLiveEventPolling(
  slug: string,
  initialUpdatedAt: string,
  onUpdate: (result: PollResult) => void,
  options: Options = {}
) {
  const { intervalMs = 60_000, enabled = true } = options
  const lastSeenRef = useRef(initialUpdatedAt)
  const onUpdateRef = useRef(onUpdate)

  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!enabled) return
    const poll = async () => {
      try {
        const res = await fetch(`/api/live-event-check?slug=${encodeURIComponent(slug)}`, {
          cache: 'no-store',
        })
        if (!res.ok) return
        const data: PollResult = await res.json()
        if (data.updatedAt > lastSeenRef.current) {
          lastSeenRef.current = data.updatedAt
          onUpdateRef.current(data)
        }
      } catch {
        // Silently fail — polling is best-effort
      }
    }
    const interval = setInterval(poll, intervalMs)
    return () => clearInterval(interval)
  }, [slug, intervalMs, enabled])
}
```

### Step 4 — Update Banner Component

```typescript
// src/components/live/LiveUpdateBanner.tsx
'use client'

import { useRouter } from 'next/navigation'

interface Props {
  newEventCount?: number
  onDismiss: () => void
}

export function LiveUpdateBanner({ newEventCount, onDismiss }: Props) {
  const router = useRouter()

  function handleRefresh() {
    onDismiss()
    router.refresh()
    document.getElementById('key-events')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 border border-untele bg-zinc-950 px-6 py-3 shadow-lg shadow-untele/20"
    >
      <span className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse bg-untele" />
        <span className="text-xs font-black uppercase tracking-widest text-white">
          {newEventCount ? `${newEventCount} new update${newEventCount > 1 ? 's' : ''}` : 'Updates available'}
        </span>
      </span>
      <button onClick={handleRefresh} className="bg-untele px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
        Refresh
      </button>
      <button onClick={onDismiss} aria-label="Dismiss update banner" className="text-zinc-500 hover:text-white">
        ×
      </button>
    </div>
  )
}
```

### Step 5 — Live Indicator Badge Component

```typescript
// src/components/live/LiveIndicatorBadge.tsx

interface Props {
  className?: string
}

export function LiveIndicatorBadge({ className = '' }: Props) {
  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      <span className="h-2 w-2 animate-pulse bg-untele" aria-hidden="true" />
      <span className="text-xs font-black uppercase tracking-widest text-untele">Live</span>
    </span>
  )
}
```

### Step 6 — Client Wrapper Island for Live Event Page

```typescript
// src/components/live/LiveEventClientWrapper.tsx
'use client'

import { useState } from 'react'
import { useLiveEventPolling } from '@/hooks/useLiveEventPolling'
import { LiveUpdateBanner } from './LiveUpdateBanner'
import { LiveIndicatorBadge } from './LiveIndicatorBadge'

interface Props {
  slug: string
  initialUpdatedAt: string
  initialKeyEventCount: number
  isActive: boolean
}

export function LiveEventClientWrapper({ slug, initialUpdatedAt, initialKeyEventCount, isActive }: Props) {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [newCount, setNewCount] = useState(0)

  useLiveEventPolling(
    slug, initialUpdatedAt,
    (result) => {
      const diff = result.keyEventCount - initialKeyEventCount
      setNewCount(diff > 0 ? diff : 0)
      setHasUpdate(true)
    },
    { enabled: isActive }
  )

  return (
    <>
      {isActive && <LiveIndicatorBadge className="ml-4" />}
      {hasUpdate && (
        <LiveUpdateBanner newEventCount={newCount} onDismiss={() => setHasUpdate(false)} />
      )}
    </>
  )
}
```

### Step 7 — Integration in Live Event Page

```typescript
// src/app/(user)/live-event/[slug]/page.tsx
import { LiveEventClientWrapper } from '@/components/live/LiveEventClientWrapper'

// In the return JSX:
<div className="flex items-center gap-3">
  <h1 className="text-3xl font-black uppercase tracking-tight">{event.title}</h1>
  <LiveEventClientWrapper
    slug={event.slug.current}
    initialUpdatedAt={event._updatedAt}
    initialKeyEventCount={event.keyEvent?.length ?? 0}
    isActive={event.status === 'live'}
  />
</div>
```

### Step 8 — LiveWidget Card Update

```typescript
// src/components/cards/LiveWidget.tsx
import { LiveIndicatorBadge } from '@/components/live/LiveIndicatorBadge'
// Inside the card JSX:
{event.status === 'live' && <LiveIndicatorBadge />}
```

## Implementation Plan

1. **Query** — Add `queryLiveEventLastUpdated` to `src/lib/sanity/queries.ts`
2. **API route** — Create `src/app/api/live-event-check/route.ts` as an Edge runtime route with 30s cache
3. **Polling hook** — Create `src/hooks/useLiveEventPolling.ts` with ref-stable callback pattern
4. **Banner component** — Create `src/components/live/LiveUpdateBanner.tsx` with router.refresh() on confirm
5. **Live badge** — Create `src/components/live/LiveIndicatorBadge.tsx` with pulsing red dot
6. **Client wrapper** — Create `src/components/live/LiveEventClientWrapper.tsx` to compose polling + banner + badge
7. **Page integration** — Update `src/app/(user)/live-event/[slug]/page.tsx` to render client wrapper
8. **Widget integration** — Update `src/components/cards/LiveWidget.tsx` to show badge on active events
9. **QA** — Manually update a live event in Sanity Studio; confirm banner appears within ~60s

## Files Affected

- `src/lib/sanity/queries.ts` — add `queryLiveEventLastUpdated`
- `src/app/api/live-event-check/route.ts` — new API route
- `src/hooks/useLiveEventPolling.ts` — new polling hook
- `src/components/live/LiveUpdateBanner.tsx` — new update banner
- `src/components/live/LiveIndicatorBadge.tsx` — new live badge
- `src/components/live/LiveEventClientWrapper.tsx` — new client island
- `src/app/(user)/live-event/[slug]/page.tsx` — add client wrapper
- `src/components/cards/LiveWidget.tsx` — add live badge

## Deliverables Checklist

### API Route
- [ ] `src/app/api/live-event-check/route.ts` created
- [ ] Route uses `runtime = 'edge'` for fast cold starts
- [ ] Accepts `?slug=` query parameter, returns 400 if missing
- [ ] Fetches `_updatedAt` and `count(keyEvent)` from Sanity via `queryLiveEventLastUpdated`
- [ ] Returns 404 if event not found
- [ ] Returns `Cache-Control: s-maxage=30, stale-while-revalidate=60`
- [ ] Error handling returns 500 with JSON error body
- [ ] `queryLiveEventLastUpdated` added to `src/lib/sanity/queries.ts`

### Polling Hook
- [ ] `src/hooks/useLiveEventPolling.ts` created
- [ ] Default interval is 60,000ms (60 seconds)
- [ ] `enabled` option stops polling when `false` (for non-live events)
- [ ] Uses `useRef` for `lastSeen` to avoid stale closures
- [ ] Uses `useRef` for callback to avoid triggering effect re-runs
- [ ] `clearInterval` called on component unmount (no memory leak)
- [ ] Fetch errors handled silently (polling is best-effort)
- [ ] Uses `cache: 'no-store'` on fetch to bypass client cache

### Components
- [ ] `src/components/live/LiveUpdateBanner.tsx` created
- [ ] Banner uses `role="status"` and `aria-live="polite"` for accessibility
- [ ] Banner positioned `fixed bottom-4` to avoid covering content
- [ ] Banner has pulsing untele-red dot indicator
- [ ] "Refresh" button calls `router.refresh()` from `useRouter()`
- [ ] After refresh, scrolls to `#key-events` element
- [ ] Dismiss button (×) hides banner without refreshing
- [ ] Banner shows new event count when available
- [ ] `src/components/live/LiveIndicatorBadge.tsx` created
- [ ] Badge shows pulsing `bg-untele` dot + "LIVE" text
- [ ] Badge accepts optional `className` prop for positioning
- [ ] `src/components/live/LiveEventClientWrapper.tsx` created
- [ ] Wrapper composes polling hook, banner, and badge
- [ ] Polling only enabled when `isActive === true` (status === 'live')

### Page Integration
- [ ] Live event page imports and renders `LiveEventClientWrapper`
- [ ] Wrapper receives `slug`, `initialUpdatedAt`, `initialKeyEventCount`, `isActive`
- [ ] `initialUpdatedAt` derived from `event._updatedAt` in server component
- [ ] Live badge appears in event page header alongside title

### LiveWidget Cards
- [ ] `LiveIndicatorBadge` imported and used in `LiveWidget.tsx`
- [ ] Badge only shown when `event.status === 'live'`

### QA
- [ ] In Sanity Studio, update a live event (add key event or edit status)
- [ ] Confirm the `/api/live-event-check` endpoint returns updated `updatedAt` within 30s
- [ ] Confirm banner appears on live event page within ~60s of Sanity update
- [ ] Confirm `router.refresh()` updates the key events list without full page navigation
- [ ] Confirm banner dismisses correctly without refreshing
- [ ] Confirm polling interval cleanup (navigate away → polling stops)
- [ ] Confirm no polling on non-live (ended/scheduled) events
- [ ] Pulsing LIVE badge visible on LiveWidget cards for active events
- [ ] `pnpm build` passes without TypeScript errors
- [ ] No unhandled promise rejections in browser console during polling
