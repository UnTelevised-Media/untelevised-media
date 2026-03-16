<!-- GitHub Issue: #10 -->
## Problem

Readers who visit UnTelevised Media once and leave have no recall mechanism when breaking news drops. Email newsletters have open rates of 20–40% and delivery delays measured in minutes. Social media reach is algorithmically throttled — less than 5% of followers see organic posts. Push notifications are the only channel that can bypass these constraints and deliver a breaking news alert directly to a reader's device within seconds of publication.

For an outlet whose core mission is live coverage of breaking events — protests, court hearings, police incidents, political crises — the inability to push a real-time alert to opted-in readers is a material competitive disadvantage against outlets that have this capability. A reader who installed the PWA and opted into notifications will see "BREAKING: Grand Jury Indicts —" before they open any social app.

Additionally, making the site installable as a Progressive Web App (PWA) enables a home-screen presence on Android and iOS, giving UnTelevised Media an app-like footprint without App Store overhead.

## Background & Context

- **Web Push API**: Browser-native push notification system. Requires: VAPID key pair, a service worker registered on the client, a push subscription stored server-side, and a backend capable of sending push messages via the Web Push Protocol.
- **VAPID**: Voluntary Application Server Identification. A key pair used to authenticate the push server to the browser's push service (FCM for Chrome, APNs for Safari on iOS 17+).
- **`web-push` npm package**: Node.js library that handles the cryptography and HTTP/2 push sending. Well-maintained, used by most Node-based push implementations.
- **Vercel KV**: Redis-compatible serverless KV store available on Vercel. Ideal for storing push subscriptions (fast reads, no schema).
- **iOS PWA push support**: Available since iOS 16.4 (Safari on iPhone/iPad) when the site is installed as a PWA from Safari's "Add to Home Screen". iOS requires the PWA manifest and a registered service worker.
- **next-pwa vs custom**: `next-pwa` (`@ducanh2912/next-pwa`) is the actively maintained fork of `next-pwa` for Next.js 14+/App Router. For a news site, a custom minimal service worker may be preferable for control over caching strategy.

## Architecture

```
PWA Layer
  ├── src/app/manifest.ts          → /manifest.webmanifest
  │     └── name, icons, theme_color (#D70606), display: standalone
  ├── public/sw.js                 → Service Worker
  │     ├── Install: cache static shell (/, /offline, icons, fonts)
  │     ├── Fetch: Network-first for HTML/API, Cache-first for assets
  │     ├── Push: handle incoming push events → show notification
  │     └── NotificationClick: open article URL from notification data
  └── public/offline.html          → Offline fallback page

Push Notification Flow
  ┌─────────────────────────────────────────────────────────────┐
  │  Browser                                                     │
  │  1. User clicks "Get Breaking News Alerts" button            │
  │  2. Notification.requestPermission() → 'granted'            │
  │  3. serviceWorkerRegistration.pushManager.subscribe({        │
  │       userVisibleOnly: true,                                 │
  │       applicationServerKey: VAPID_PUBLIC_KEY                 │
  │     }) → PushSubscription object                            │
  │  4. POST /api/push-subscribe { subscription }               │
  └─────────────────────────────────────────────────────────────┘
           ↓
  ┌─────────────────────────────────────────────────────────────┐
  │  Server (/api/push-subscribe)                               │
  │  5. Validate subscription shape                              │
  │  6. Store in Vercel KV: SET push:${hash(endpoint)} → JSON   │
  │  7. Return 201                                               │
  └─────────────────────────────────────────────────────────────┘

  Breaking News Published in Sanity
           ↓
  ┌─────────────────────────────────────────────────────────────┐
  │  Sanity Webhook → POST /api/push-notify                      │
  │  OR: Studio "Send Push" button                              │
  │  8. Validate webhook secret                                  │
  │  9. Fetch all subscriptions from Vercel KV                  │
  │  10. webpush.sendNotification(subscription, payload)         │
  │      for each subscription (batched, error-tolerant)        │
  │  11. Remove expired/410-response subscriptions               │
  └─────────────────────────────────────────────────────────────┘
           ↓
  ┌─────────────────────────────────────────────────────────────┐
  │  Browser (any page or background)                           │
  │  12. Service worker receives 'push' event                   │
  │  13. self.registration.showNotification(title, options)     │
  │  14. User taps notification → notificationclick event       │
  │  15. clients.openWindow(event.notification.data.url)        │
  └─────────────────────────────────────────────────────────────┘
```

## Proposed Solution

### Phase 1: PWA Foundation

#### Manifest

```typescript
// src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UnTelevised Media',
    short_name: 'UnTelevised',
    description: 'Unfiltered. Uncensored. Uncompromising. Independent journalism.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0a0a',
    theme_color: '#D70606',
    categories: ['news', 'politics'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
```

#### Service Worker (`public/sw.js`)

```javascript
// public/sw.js
const CACHE_NAME = 'untele-v1'
const STATIC_ASSETS = ['/', '/offline', '/icons/icon-192.png', '/icons/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== location.origin) return
  if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/_next/static/')) {
    event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request)))
    return
  }
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.headers.get('accept')?.includes('text/html')) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => caches.match(request) ?? caches.match('/offline'))
  )
})

self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon ?? '/icons/icon-192.png',
      badge: data.badge ?? '/icons/badge-72.png',
      tag: data.tag ?? 'untele-news',
      renotify: data.renotify ?? true,
      data: { url: data.url ?? '/' },
      actions: [
        { action: 'read', title: 'Read Now' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      return clients.openWindow(url)
    })
  )
})
```

#### Service Worker Registration

```typescript
// src/components/global/ServiceWorkerRegistration.tsx
'use client'
import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((reg) => console.log('[SW] Registered:', reg.scope))
        .catch((err) => console.error('[SW] Registration failed:', err))
    }
  }, [])
  return null
}
```

### Phase 2: Web Push Subscriptions

#### Environment Variables

```env
VAPID_PUBLIC_KEY=        # From: npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=       # Keep secret — never in client-side code
VAPID_SUBJECT=mailto:tech@untelevised.media
NEXT_PUBLIC_VAPID_PUBLIC_KEY=  # Same as VAPID_PUBLIC_KEY — safe to expose
KV_REST_API_URL=         # Vercel KV (from Vercel dashboard)
KV_REST_API_TOKEN=       # Vercel KV token
PUSH_NOTIFY_SECRET=      # Random secret for webhook auth
```

#### Push Subscribe API Route

```typescript
// src/app/api/push-subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json()
    if (!subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }
    const key = `push:${crypto.createHash('sha256').update(subscription.endpoint).digest('hex').slice(0, 32)}`
    await kv.set(key, JSON.stringify(subscription), { ex: 60 * 60 * 24 * 365 })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[push-subscribe] Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

#### Push Notify API Route

```typescript
// src/app/api/push-notify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.json()
  if (body.secret !== process.env.PUSH_NOTIFY_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const keys = await kv.keys('push:*')
  if (!keys.length) return NextResponse.json({ sent: 0, message: 'No subscribers' })

  const payload = JSON.stringify({
    title: body.title, body: body.body, url: body.url,
    icon: '/icons/icon-192.png', badge: '/icons/badge-72.png',
    tag: body.tag ?? 'breaking-news', renotify: true,
  })

  let sent = 0, failed = 0
  const expiredKeys: string[] = []

  await Promise.allSettled(keys.map(async (key) => {
    const subJson = await kv.get<string>(key)
    if (!subJson) return
    const subscription = typeof subJson === 'string' ? JSON.parse(subJson) : subJson
    try {
      await webpush.sendNotification(subscription, payload)
      sent++
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) expiredKeys.push(key)
      failed++
    }
  }))

  if (expiredKeys.length > 0) await Promise.all(expiredKeys.map((key) => kv.del(key)))
  return NextResponse.json({ sent, failed, cleaned: expiredKeys.length })
}
```

### Phase 3: Client-Side Push Button

```typescript
// src/components/global/PushNotificationButton.tsx
'use client'
import { useState, useEffect } from 'react'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export function PushNotificationButton() {
  const [status, setStatus] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported')
      return
    }
    setStatus(Notification.permission as any)
  }, [])

  async function subscribe() {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setStatus('denied'); return }
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })
      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      })
      setStatus('granted')
    } catch (error) {
      console.error('[PushButton] Subscribe failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'unsupported') return null
  if (status === 'granted') return <span className="text-xs uppercase tracking-widest text-green-500">✓ Alerts Active</span>
  if (status === 'denied') return <span className="text-xs uppercase tracking-widest text-zinc-500">Notifications Blocked</span>

  return (
    <button onClick={subscribe} disabled={loading}
      className="bg-untele px-4 py-2 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60">
      {loading ? 'Enabling...' : 'Get Breaking News Alerts'}
    </button>
  )
}
```

## Implementation Plan

1. **Install dependencies** — `pnpm add web-push @types/web-push @vercel/kv`
2. **Generate VAPID keys** — `npx web-push generate-vapid-keys --urlsafe-base64`; store in `.env.local` and Vercel environment variables
3. **Create manifest** — `src/app/manifest.ts` with correct icons, theme color `#D70606`, `display: standalone`
4. **Create icons** — Export icon assets at 192×192, 512×512 (standard + maskable) to `public/icons/`; badge at 72×72
5. **Create offline page** — `src/app/(user)/offline/page.tsx` with branded offline message
6. **Create service worker** — `public/sw.js` with install/activate/fetch/push/notificationclick handlers
7. **Register SW client component** — `src/components/global/ServiceWorkerRegistration.tsx`; add to root layout
8. **KV setup** — Create Vercel KV database in Vercel dashboard; add env vars
9. **Push subscribe route** — `src/app/api/push-subscribe/route.ts`
10. **Push notify route** — `src/app/api/push-notify/route.ts`
11. **Push button component** — `src/components/global/PushNotificationButton.tsx`; add to site header
12. **Sanity webhook** — Configure in Sanity dashboard: `POST /api/push-notify` on `article.publish` where `isBreaking == true`
13. **Update `.env.example`** — Document all new environment variables
14. **Test** — Verify subscription, receive test push, verify expired subscription cleanup

## Files Affected

- `src/app/manifest.ts` — new PWA manifest
- `public/sw.js` — new service worker
- `public/offline.html` — new offline fallback
- `public/icons/icon-192.png` — new icon asset
- `public/icons/icon-512.png` — new icon asset
- `public/icons/icon-512-maskable.png` — new icon asset
- `public/icons/badge-72.png` — new notification badge icon
- `src/app/(user)/offline/page.tsx` — new offline page
- `src/components/global/ServiceWorkerRegistration.tsx` — new no-render client component
- `src/app/layout.tsx` — add `<ServiceWorkerRegistration />`
- `src/app/api/push-subscribe/route.ts` — new API route
- `src/app/api/push-notify/route.ts` — new API route
- `src/components/global/PushNotificationButton.tsx` — new UI component
- `.env.example` — add VAPID and KV vars
- `package.json` — add `web-push`, `@types/web-push`, `@vercel/kv`

## Deliverables Checklist

### Phase 1 — PWA
- [ ] `src/app/manifest.ts` created and returns valid manifest object
- [ ] `name: 'UnTelevised Media'`, `short_name: 'UnTelevised'`
- [ ] `theme_color: '#D70606'`, `background_color: '#0a0a0a'`
- [ ] `display: 'standalone'`, `start_url: '/'`
- [ ] Icon at 192×192 exists at `public/icons/icon-192.png`
- [ ] Icon at 512×512 exists at `public/icons/icon-512.png`
- [ ] Maskable icon at 512×512 exists at `public/icons/icon-512-maskable.png`
- [ ] Manifest accessible at `/manifest.webmanifest` in browser
- [ ] Lighthouse PWA audit shows manifest as installable
- [ ] `public/sw.js` created with install, activate, fetch event handlers
- [ ] Service worker caches static shell on install
- [ ] Service worker provides offline fallback via `/offline`
- [ ] Offline page created with branded message
- [ ] `ServiceWorkerRegistration` client component created and added to root layout
- [ ] Service worker registers successfully (no console errors in browser)
- [ ] Site installable via browser "Add to Home Screen" on Android Chrome
- [ ] Site installable via Safari "Add to Home Screen" on iOS 16.4+

### Phase 2 — Push Infrastructure
- [ ] `web-push` and `@types/web-push` added to `package.json`
- [ ] `@vercel/kv` added to `package.json`
- [ ] VAPID key pair generated with `npx web-push generate-vapid-keys --urlsafe-base64`
- [ ] `VAPID_PUBLIC_KEY` set in `.env.local` and Vercel
- [ ] `VAPID_PRIVATE_KEY` set in `.env.local` and Vercel (secret, never client-side)
- [ ] `VAPID_SUBJECT` set to `mailto:tech@untelevised.media`
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` set (same value as public key)
- [ ] `PUSH_NOTIFY_SECRET` random hex string set in `.env.local` and Vercel
- [ ] Vercel KV database created and connected to project
- [ ] `KV_REST_API_URL` and `KV_REST_API_TOKEN` set in Vercel environment
- [ ] `src/app/api/push-subscribe/route.ts` created
- [ ] Subscribe route validates subscription shape before storing
- [ ] Subscribe route stores subscription in Vercel KV with 1-year TTL
- [ ] Subscribe route returns 201 on success
- [ ] `src/app/api/push-notify/route.ts` created
- [ ] Notify route validates `PUSH_NOTIFY_SECRET` before sending
- [ ] Notify route fetches all `push:*` keys from KV
- [ ] Notify route sends push to each subscription via `webpush.sendNotification`
- [ ] Notify route removes expired subscriptions (HTTP 410/404 responses)
- [ ] Notify route returns count of sent/failed/cleaned
- [ ] Service worker `push` event handler shows notification with correct title, body, icon
- [ ] Service worker `notificationclick` opens article URL in existing tab or new window

### Phase 3 — Client UI
- [ ] `PushNotificationButton` component created
- [ ] Button hidden on unsupported browsers
- [ ] Button shows "Get Breaking News Alerts" in default state
- [ ] Button calls `Notification.requestPermission()` on click
- [ ] Button POSTs subscription to `/api/push-subscribe` after permission granted
- [ ] Button shows "✓ Alerts Active" after successful subscription
- [ ] Button shows "Notifications Blocked" when permission is denied
- [ ] Button styled with `bg-untele` red, white text, uppercase tracking
- [ ] Button placed in site header or homepage section
- [ ] No duplicate permission prompts (checks `Notification.permission` on mount)

### Sanity Webhook
- [ ] Webhook configured in Sanity project dashboard
- [ ] Webhook triggers on `article.publish` with filter `isBreaking == true`
- [ ] Webhook POSTs to `https://untelevised.media/api/push-notify`
- [ ] Webhook includes `PUSH_NOTIFY_SECRET` in request body

### Environment & Documentation
- [ ] `.env.example` updated with all new variables and descriptions
- [ ] All secrets documented as "generate with X command"
- [ ] `pnpm build` passes without TypeScript errors
- [ ] No push-related errors in Vercel function logs after test push
