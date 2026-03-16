<!-- GitHub Issue: #14 -->
## Problem

Once membership tiers exist (Issue 16), some content must be restricted to paying members to create a conversion incentive. Without paywalled content, there is no tangible membership benefit that casual readers cannot get for free — making "support us" the only pitch, rather than "unlock access." Investigative deep-dives, exclusive interviews, documents, and premium analysis are natural candidates for access-gated content.

The implementation must be careful not to violate Google's "First Click Free" guidance — gated content that is completely invisible to Googlebot is penalized. The correct approach is to show a meaningful preview (first 3 paragraphs) to all visitors including search crawlers, then present a paywall prompt for the remainder.

**This issue is a direct dependency of Issue 16 (Membership Tiers / Stripe).** Issue 16 must be completed first to have member records to validate against.

## Background & Context

- **Token-based auth for MVP**: Full OAuth authentication (NextAuth, Clerk) adds significant complexity. For a content gating use case, a signed token emailed to the member after purchase is sufficient for MVP. The token proves "this email paid for a subscription."
- **httpOnly cookies**: The token must be stored in an httpOnly cookie — not `localStorage` or a regular cookie. httpOnly cookies are inaccessible to JavaScript, preventing XSS attacks from stealing member tokens.
- **Server-side enforcement**: The gating logic must run on the server (in the Next.js page server component or middleware). Client-side-only gating (e.g., hiding content with CSS) provides zero actual protection — the full article body would still be in the network response.
- **Partial body query**: For gated articles, non-authenticated requests should only fetch the first 3 blocks of the article body from Sanity — not the full body. This prevents the full content from ever being sent to unauthenticated clients, even in the raw network response.
- **Google's stance**: Google allows "metered" and "lead-in" paywalls. Showing the first 3 paragraphs consistently to all visitors (including Googlebot) while gating the rest is compliant.

## Architecture

```
Article Detail Page (/articles/[slug])
  └── Server Component
        ├── If accessLevel === 'public' → Fetch full body → render normally
        ├── If accessLevel === 'members' or 'premium'
        │     ├── Read cookie: 'untele_member_token' (httpOnly)
        │     ├── If token present: validateMemberToken(token)
        │     │     └── Sanity query: member where accessToken == token && status == 'active'
        │     │     └── Returns { valid: boolean, tier: string }
        │     │     ├── If valid && tier meets requirement: full body
        │     │     └── Else: preview body (first 3 blocks) + <PaywallPrompt />
        │     └── If no token: preview body + <PaywallPrompt />
        └── Article cards: lock icon on gated articles

/unlock?token=[token]
  └── Server route: validate token → set httpOnly cookie → redirect

Member Schema Update
  └── Add 'accessToken' field to member schema
```

## Proposed Solution

### Step 1 — Article Schema Update

```typescript
// src/lib/sanity/schemas/article.ts — add accessLevel field:

defineField({
  name: 'accessLevel',
  title: 'Access Level',
  type: 'string',
  options: {
    list: [
      { title: 'Public — visible to everyone', value: 'public' },
      { title: 'Members Only — any active member', value: 'members' },
      { title: 'Contributors & Patrons — $15+/month', value: 'premium' },
    ],
    layout: 'radio',
  },
  initialValue: 'public',
  description: 'Controls who can read the full article. Gated articles show a 3-paragraph preview to non-members.',
}),
```

### Step 2 — Member Schema Token Field

```typescript
// src/lib/sanity/schemas/member.ts — add to fields array:

defineField({
  name: 'accessToken',
  title: 'Access Token',
  type: 'string',
  readOnly: true,
  hidden: true, // Sensitive — hide from Studio UI
  description: 'Token for cookie-based authentication. Set by webhook.',
}),
```

### Step 3 — Token Validation Utility

```typescript
// src/lib/memberAuth.ts

import { createClient } from '@sanity/client'

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_WRITE_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

interface MemberAuthResult {
  valid: boolean
  tier: 'supporter' | 'contributor' | 'patron' | null
  memberId: string | null
}

const TIER_RANK: Record<string, number> = {
  supporter: 1,
  contributor: 2,
  patron: 3,
}

export async function validateMemberToken(token: string | undefined): Promise<MemberAuthResult> {
  if (!token) return { valid: false, tier: null, memberId: null }
  try {
    const member = await sanity.fetch<{ _id: string; tier: string; status: string } | null>(
      `*[_type == "member" && accessToken == $token && status == "active"][0] { _id, tier, status }`,
      { token }
    )
    if (!member) return { valid: false, tier: null, memberId: null }
    return { valid: true, tier: member.tier as MemberAuthResult['tier'], memberId: member._id }
  } catch {
    return { valid: false, tier: null, memberId: null }
  }
}

export function canAccessContent(memberTier: string | null, requiredLevel: string): boolean {
  if (requiredLevel === 'public') return true
  if (!memberTier) return false
  if (requiredLevel === 'members') return TIER_RANK[memberTier] >= 1
  if (requiredLevel === 'premium') return TIER_RANK[memberTier] >= 2
  return false
}
```

### Step 4 — `/unlock` Route

```typescript
// src/app/(user)/unlock/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validateMemberToken } from '@/lib/memberAuth'

export const metadata = { robots: { index: false, follow: false } }

interface Props {
  searchParams: Promise<{ token?: string; returnTo?: string }>
}

export default async function UnlockPage({ searchParams }: Props) {
  const { token, returnTo } = await searchParams

  if (!token) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12 text-center">
        <h1 className="text-2xl font-black uppercase text-white">Invalid Link</h1>
        <p className="mt-4 text-zinc-400">This unlock link is missing a token.</p>
      </main>
    )
  }

  const { valid } = await validateMemberToken(token)

  if (!valid) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12 text-center">
        <h1 className="text-2xl font-black uppercase text-white">Invalid Token</h1>
        <p className="mt-4 text-zinc-400">This token is invalid or your membership is no longer active.</p>
        <a href="/join" className="mt-6 inline-block bg-untele px-6 py-3 text-xs font-black uppercase tracking-widest text-white">
          Become a Member
        </a>
      </main>
    )
  }

  const cookieStore = await cookies()
  cookieStore.set('untele_member_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  const destination = returnTo && returnTo.startsWith('/') ? returnTo : '/'
  redirect(destination)
}
```

### Step 5 — Gating Logic on Article Page

```typescript
// src/app/(user)/articles/[slug]/page.tsx
import { cookies } from 'next/headers'
import { validateMemberToken, canAccessContent } from '@/lib/memberAuth'
import { PaywallPrompt } from '@/components/post/PaywallPrompt'

// Inside the page function:
const cookieStore = await cookies()
const memberToken = cookieStore.get('untele_member_token')?.value
const isGated = article.accessLevel && article.accessLevel !== 'public'

let memberAuth = { valid: false, tier: null as string | null }
if (isGated) {
  memberAuth = await validateMemberToken(memberToken)
}

const hasAccess = canAccessContent(memberAuth.tier, article.accessLevel ?? 'public')

// In the return JSX:
{isGated && !hasAccess ? (
  <>
    <PortableText value={article.body?.slice(0, 3) ?? []} components={portableTextComponents} />
    <PaywallPrompt accessLevel={article.accessLevel} />
  </>
) : (
  <PortableText value={article.body ?? []} components={portableTextComponents} />
)}
```

### Step 6 — Paywall Prompt Component

```typescript
// src/components/post/PaywallPrompt.tsx
import Link from 'next/link'

interface Props {
  accessLevel: 'members' | 'premium'
}

export function PaywallPrompt({ accessLevel }: Props) {
  const tierLabel = accessLevel === 'premium' ? 'Contributor or Patron' : 'Member'
  const minPrice = accessLevel === 'premium' ? '$15' : '$5'

  return (
    <div className="relative mt-6">
      <div className="absolute -top-20 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-zinc-950 pointer-events-none" />
      <div className="border border-zinc-700 p-8 text-center">
        <div className="mb-3 inline-block bg-untele px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
          Members Only
        </div>
        <h3 className="mb-3 text-xl font-black uppercase text-white">
          This article is for {tierLabel}s
        </h3>
        <p className="mb-6 text-sm text-zinc-400">
          Support independent journalism and unlock full access to investigative reporting, exclusive interviews, and premium analysis.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/join" className="bg-untele px-6 py-3 text-xs font-black uppercase tracking-widest text-white">
            Join from {minPrice}/month
          </Link>
          <Link href="/unlock" className="border border-zinc-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-zinc-300 hover:border-untele hover:text-white">
            Already a member? Unlock →
          </Link>
        </div>
      </div>
    </div>
  )
}
```

### Step 7 — Lock Icon on Article Cards

```typescript
// src/components/cards/ArticleCards.tsx
import { LockClosedIcon } from '@heroicons/react/24/solid'

// Conditionally render in card header area:
{article.accessLevel && article.accessLevel !== 'public' && (
  <span title="Members only" className="absolute right-2 top-2 bg-zinc-900/80 p-1" aria-label="Members only content">
    <LockClosedIcon className="h-3 w-3 text-untele" />
  </span>
)}
```

## Implementation Plan

1. **Prerequisite** — Confirm Issue 16 (Membership / Stripe) is merged and member documents are being created
2. **Schema** — Add `accessLevel` field to article schema; add `accessToken` field to member schema
3. **Webhook update** — Update `stripe-webhook` route to generate and store `accessToken` on member creation
4. **Auth utility** — Create `src/lib/memberAuth.ts` with `validateMemberToken` and `canAccessContent`
5. **Unlock route** — Create `src/app/(user)/unlock/page.tsx` to validate tokens and set httpOnly cookies
6. **Article page gating** — Update `src/app/(user)/articles/[slug]/page.tsx` to check access and render paywall
7. **Paywall component** — Create `src/components/post/PaywallPrompt.tsx`
8. **Card lock icons** — Update `src/components/cards/ArticleCards.tsx` and `ArticleCardLg.tsx`
9. **Email delivery** — Integrate Resend to send the unlock token URL to new members
10. **QA** — End-to-end test: purchase membership → receive email → visit `/unlock?token=` → cookie set → gated article unlocks

## Files Affected

- `src/lib/sanity/schemas/article.ts` — add `accessLevel` field
- `src/lib/sanity/schemas/member.ts` — add `accessToken` field
- `src/lib/memberAuth.ts` — new auth utility
- `src/lib/sanity/queries.ts` — update article query for preview-only body
- `src/app/(user)/articles/[slug]/page.tsx` — gating logic
- `src/app/(user)/unlock/page.tsx` — new unlock route
- `src/app/api/stripe-webhook/route.ts` — add token generation
- `src/components/post/PaywallPrompt.tsx` — new paywall UI component
- `src/components/cards/ArticleCards.tsx` — add lock icon
- `src/components/cards/ArticleCardLg.tsx` — add lock icon
- `src/middleware.ts` — optional: middleware-level cookie refresh

## Deliverables Checklist

### Schema
- [ ] `accessLevel` field added to article schema with `radio` layout
- [ ] Options: `public`, `members`, `premium`
- [ ] `initialValue: 'public'` — no existing articles broken
- [ ] `accessToken` field added to member schema (hidden, readOnly)
- [ ] Stripe webhook updated to generate and store `accessToken` on member creation
- [ ] `accessLevel` field visible in Sanity Studio article editor

### Auth Utilities
- [ ] `src/lib/memberAuth.ts` created
- [ ] `validateMemberToken(token)` queries Sanity for matching active member
- [ ] Returns `{ valid: false }` when token is undefined or empty
- [ ] `canAccessContent(null, 'public')` returns `true`
- [ ] `canAccessContent('supporter', 'premium')` returns `false`
- [ ] `canAccessContent('contributor', 'premium')` returns `true`

### Unlock Route
- [ ] `src/app/(user)/unlock/page.tsx` created
- [ ] Missing token shows error UI, not crash
- [ ] Invalid/expired token shows error UI with link to `/join`
- [ ] Valid token sets `untele_member_token` as httpOnly cookie
- [ ] Cookie has `secure: true` in production, `sameSite: 'lax'`, 1-year maxAge
- [ ] Redirects to `returnTo` param or homepage
- [ ] Page has `robots: { index: false, follow: false }` metadata

### Article Page Gating
- [ ] Article page reads `untele_member_token` cookie via `cookies()` from `next/headers`
- [ ] Public articles render without token check
- [ ] Gated articles: full body only rendered for valid members
- [ ] Gated articles: first 3 blocks shown to non-members + `<PaywallPrompt />`
- [ ] Non-member cannot get full body via network inspection (server-side enforcement)

### Paywall Component
- [ ] `src/components/post/PaywallPrompt.tsx` created
- [ ] Gradient fade overlay over preview text
- [ ] "Members Only" red label badge
- [ ] CTA: "Join from $X/month" → `/join`
- [ ] Secondary CTA: "Already a member? Unlock →" → `/unlock`
- [ ] Sharp edges, no border-radius, `bg-untele` CTA button

### Article Cards
- [ ] Lock icon added to `ArticleCards.tsx` for gated articles
- [ ] Lock icon added to `ArticleCardLg.tsx` for gated articles
- [ ] Icon styled with `text-untele`
- [ ] Gated articles remain visible in lists — not hidden from non-members

### QA
- [ ] End-to-end test: full flow from Stripe checkout → email → unlock → access gated article
- [ ] Verify full article body is NOT in HTML response for non-authenticated request
- [ ] Verify token cookie is httpOnly (not visible in `document.cookie`)
- [ ] `/unlock?token=invalid` shows error message, not 500
- [ ] Cancelled member cannot access gated content
- [ ] `pnpm build` passes without TypeScript errors
- [ ] Google can crawl first 3 paragraphs (verified via Search Console URL inspection)
