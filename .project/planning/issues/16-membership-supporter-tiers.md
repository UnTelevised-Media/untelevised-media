<!-- GitHub Issue: #13 -->
## Problem

UnTelevised Media's `/donate` page accepts one-time donations, but there is no mechanism for recurring financial support. One-time donations are unpredictable and cannot support operational planning. Recurring memberships — even at $5/month — create a sustainable revenue baseline that allows an independent outlet to commit to ongoing coverage, hire contributors, and invest in investigative journalism.

The `/join` route already exists as a skeleton page, demonstrating intent without implementation. Without a functional membership subscription flow, the site has no path to financial sustainability beyond AdSense and sporadic donations. For an independent outlet competing against algorithmically favored corporate media, reader-supported memberships are not optional infrastructure — they are the operating model.

## Background & Context

- **Stripe**: Industry standard for subscription billing. Handles PCI compliance, recurring billing, payment method management, dunning (failed payment retries), and provides a managed checkout UI (Stripe Checkout) that reduces implementation complexity significantly.
- **Stripe Checkout**: Stripe's hosted checkout page. Redirects user to `checkout.stripe.com`, handles payment collection, then redirects back to `success_url`. Eliminates the need to handle card data directly. Suitable for MVP.
- **Stripe Webhooks**: Stripe sends POST events to a registered endpoint when subscription lifecycle events occur (created, updated, cancelled, payment failed). This is how the server learns about successful payments without polling.
- **Webhook Signature Verification**: Every webhook event includes a `Stripe-Signature` header. Verifying this against the `STRIPE_WEBHOOK_SECRET` ensures only Stripe can trigger member record creation.
- **Sanity as member database**: For MVP, storing member records in Sanity is acceptable — it avoids adding a new database dependency. Long term, a dedicated database (Postgres/PlanetScale) is preferable for querying member access. Sanity member documents are write-only from the webhook and read by the access validation logic.

## Architecture

```
User visits /join
  └── Membership tier cards (Supporter $5, Contributor $15, Patron $50)
        └── "Join as [Tier]" button
              └── POST /api/create-checkout { tier }
                    └── Stripe API: checkout.sessions.create({
                          mode: 'subscription',
                          line_items: [{ price: priceId, quantity: 1 }],
                          success_url: '/join/success?session_id={CHECKOUT_SESSION_ID}',
                          cancel_url: '/join'
                        })
                    └── Returns { url: 'https://checkout.stripe.com/...' }
              └── window.location.href = url (redirect to Stripe Checkout)

Stripe Checkout Page (hosted by Stripe)
  └── User enters payment info → Stripe processes → Redirects to /join/success

/join/success Page
  └── Retrieves session from Stripe (via session_id)
  └── Displays confirmation, tier, next billing date, newsletter prompt

Stripe Webhook → /api/stripe-webhook
  ├── checkout.session.completed → Create member document in Sanity
  ├── customer.subscription.updated → Update member tier/status in Sanity
  └── customer.subscription.deleted → Mark member as cancelled in Sanity

/join page
  └── Shows live member count ("Join X supporters")
        └── Sanity query: count(*[_type=="member" && status=="active"])
```

## Proposed Solution

### Step 1 — Environment Variables

```env
# .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_SUPPORTER=price_...
STRIPE_PRICE_CONTRIBUTOR=price_...
STRIPE_PRICE_PATRON=price_...
SANITY_API_WRITE_TOKEN=sk...  # Sanity write token for webhook
```

### Step 2 — Sanity Member Schema

```typescript
// src/lib/sanity/schemas/member.ts
import { defineField, defineType } from 'sanity'
import { UsersIcon } from '@sanity/icons'

export const member = defineType({
  name: 'member',
  title: 'Member',
  type: 'document',
  icon: UsersIcon,
  __experimental_actions: ['read', 'delete'], // Read-only in Studio
  fields: [
    defineField({ name: 'email', type: 'string', readOnly: true, validation: (Rule) => Rule.required().email() }),
    defineField({ name: 'stripeCustomerId', type: 'string', readOnly: true }),
    defineField({ name: 'stripeSubscriptionId', type: 'string', readOnly: true }),
    defineField({
      name: 'tier',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          { title: 'Supporter ($5/mo)', value: 'supporter' },
          { title: 'Contributor ($15/mo)', value: 'contributor' },
          { title: 'Patron ($50/mo)', value: 'patron' },
        ],
      },
    }),
    defineField({
      name: 'status',
      type: 'string',
      readOnly: true,
      initialValue: 'active',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Cancelled', value: 'cancelled' },
          { title: 'Past Due', value: 'past_due' },
          { title: 'Incomplete', value: 'incomplete' },
        ],
      },
    }),
    defineField({ name: 'memberSince', type: 'datetime', readOnly: true }),
    defineField({ name: 'displayName', type: 'string', description: 'Optional public name for member credits.' }),
  ],
  preview: {
    select: { title: 'email', subtitle: 'tier' },
  },
})
```

### Step 3 — Create Checkout API Route

```typescript
// src/app/api/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })

const PRICE_MAP: Record<string, string | undefined> = {
  supporter: process.env.STRIPE_PRICE_SUPPORTER,
  contributor: process.env.STRIPE_PRICE_CONTRIBUTOR,
  patron: process.env.STRIPE_PRICE_PATRON,
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://untelevised.media'

export async function POST(request: NextRequest) {
  try {
    const { tier, email } = await request.json()
    const priceId = PRICE_MAP[tier]
    if (!priceId) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email ?? undefined,
      success_url: `${BASE_URL}/join/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/join`,
      metadata: { tier },
      subscription_data: { metadata: { tier } },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[create-checkout] Error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
```

### Step 4 — Stripe Webhook Handler

```typescript
// src/app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@sanity/client'
import crypto from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_WRITE_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function getRawBody(request: NextRequest): Promise<Buffer> {
  const chunks: Uint8Array[] = []
  const reader = request.body!.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  return Buffer.concat(chunks)
}

export async function POST(request: NextRequest) {
  const rawBody = await getRawBody(request)
  const signature = request.headers.get('stripe-signature')!
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const tier = session.metadata?.tier ?? 'supporter'
        const accessToken = crypto.randomBytes(32).toString('hex')
        await sanity.createOrReplace({
          _type: 'member',
          _id: `member-${session.customer}`,
          email: session.customer_details?.email ?? '',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          tier, status: 'active',
          memberSince: new Date().toISOString(),
          accessToken,
        })
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const status = sub.status === 'active' ? 'active'
          : sub.status === 'past_due' ? 'past_due'
          : sub.status === 'canceled' ? 'cancelled' : 'incomplete'
        await sanity.patch(`member-${sub.customer}`).set({ status }).commit()
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await sanity.patch(`member-${sub.customer}`).set({ status: 'cancelled' }).commit()
        break
      }
    }
  } catch (error) {
    console.error('[stripe-webhook] Handler error:', error)
    // Return 200 to prevent Stripe retries — log and investigate separately
  }

  return NextResponse.json({ received: true })
}
```

### Step 5 — Updated `/join` Page with Member Count

```typescript
// src/app/(user)/join/page.tsx
import { Metadata } from 'next'
import { sanityFetch } from '@/lib/sanity/fetch'
import { MembershipTiers } from '@/components/membership/MembershipTiers'
import { groq } from 'next-sanity'

export const metadata: Metadata = {
  title: 'Join UnTelevised Media — Support Independent Journalism',
  description: 'Become a member and support uncensored, independent journalism. From $5/month.',
}

const queryMemberCount = groq`count(*[_type == "member" && status == "active"])`

export default async function JoinPage() {
  const { data: memberCount } = await sanityFetch({ query: queryMemberCount, tags: ['member'] })

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-4 inline-block bg-untele px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
        Support the Mission
      </div>
      <h1 className="mb-4 text-4xl font-black uppercase tracking-tight">Join UnTelevised Media</h1>
      <p className="mb-2 text-lg text-zinc-300">
        Independent journalism doesn&apos;t run on algorithms or corporate sponsorships. It runs on readers like you.
      </p>
      {memberCount > 0 && (
        <p className="mb-8 text-sm text-zinc-400">
          Join <span className="font-bold text-white">{memberCount.toLocaleString()}</span> supporters funding uncensored reporting.
        </p>
      )}
      <MembershipTiers />
      <div className="mt-12 border-t border-zinc-700 pt-8 text-center">
        <p className="text-sm text-zinc-400">
          Want to write for us?{' '}
          <a href="/careers" className="text-untele hover:underline">Join our team →</a>
        </p>
      </div>
    </main>
  )
}
```

### Step 6 — Membership Tiers Component

```typescript
// src/components/membership/MembershipTiers.tsx
'use client'
import { useState } from 'react'

const TIERS = [
  { id: 'supporter', name: 'Supporter', price: 5,
    description: 'Support independent journalism with a monthly contribution.',
    perks: ['Supporter badge in comments', 'Monthly newsletter', 'Our sincere gratitude'] },
  { id: 'contributor', name: 'Contributor', price: 15, featured: true,
    description: 'Get more access while keeping the lights on.',
    perks: ['Everything in Supporter', 'Ad-free reading experience', 'Access to members-only articles', 'Monthly Q&A with editorial team'] },
  { id: 'patron', name: 'Patron', price: 50,
    description: 'Become a founding patron of independent media.',
    perks: ['Everything in Contributor', 'Credit in articles you support', 'Direct email line to editors', 'Annual patron recognition'] },
]

export function MembershipTiers() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleJoin(tierId: string) {
    setLoading(tierId)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      console.error('[MembershipTiers] Checkout error:', err)
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {TIERS.map((tier) => (
        <div key={tier.id} className={`flex flex-col border p-6 ${tier.featured ? 'border-untele' : 'border-zinc-700 hover:border-zinc-500'}`}>
          {tier.featured && (
            <div className="mb-4 inline-block bg-untele px-2 py-0.5 text-xs font-black uppercase tracking-widest text-white">Most Popular</div>
          )}
          <h2 className="mb-1 text-xl font-black uppercase tracking-wide text-white">{tier.name}</h2>
          <div className="mb-4">
            <span className="text-3xl font-black text-white">${tier.price}</span>
            <span className="text-sm text-zinc-400">/month</span>
          </div>
          <p className="mb-6 text-sm text-zinc-400">{tier.description}</p>
          <ul className="mb-8 flex-1 space-y-2">
            {tier.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="mt-0.5 text-untele">✓</span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleJoin(tier.id)}
            disabled={loading === tier.id}
            className="bg-untele py-3 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60"
          >
            {loading === tier.id ? 'Redirecting...' : `Join as ${tier.name}`}
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Implementation Plan

1. **Install** — `pnpm add stripe @stripe/stripe-js`
2. **Stripe setup** — Create Products and Prices in Stripe Dashboard (test mode first); copy price IDs to `.env.local`
3. **Member schema** — Create `src/lib/sanity/schemas/member.ts`; add to `src/lib/sanity/schemas/index.ts`
4. **Sanity write token** — Create a token with write access in Sanity project settings; add to `SANITY_API_WRITE_TOKEN` env var
5. **Checkout route** — Create `src/app/api/create-checkout/route.ts`
6. **Webhook route** — Create `src/app/api/stripe-webhook/route.ts`; register endpoint in Stripe Dashboard; copy signing secret to `STRIPE_WEBHOOK_SECRET`
7. **Join page** — Update `src/app/(user)/join/page.tsx` with member count query and tier display
8. **Tiers component** — Create `src/components/membership/MembershipTiers.tsx`
9. **Success page** — Create `src/app/(user)/join/success/page.tsx`
10. **Env vars** — Update `.env.example` with all new variables
11. **Test** — Complete a test checkout with Stripe test card `4242 4242 4242 4242`; verify member document created in Sanity
12. **Webhook testing** — Use Stripe CLI (`stripe listen --forward-to localhost:3000/api/stripe-webhook`) for local webhook testing

## Files Affected

- `src/lib/sanity/schemas/member.ts` — new schema
- `src/lib/sanity/schemas/index.ts` — register member schema
- `src/lib/sanity/queries.ts` — add member count query
- `src/app/(user)/join/page.tsx` — major rewrite
- `src/app/(user)/join/success/page.tsx` — new
- `src/app/api/create-checkout/route.ts` — new
- `src/app/api/stripe-webhook/route.ts` — new
- `src/components/membership/MembershipTiers.tsx` — new
- `.env.example` — add Stripe and Sanity write token vars
- `package.json` — add `stripe`, `@stripe/stripe-js`

## Deliverables Checklist

### Stripe Setup
- [ ] `stripe` and `@stripe/stripe-js` added to `package.json`
- [ ] Three Products created in Stripe Dashboard: Supporter, Contributor, Patron
- [ ] Recurring Prices created: $5/mo, $15/mo, $50/mo (monthly billing)
- [ ] Price IDs stored in environment variables
- [ ] Webhook endpoint registered in Stripe Dashboard → `/api/stripe-webhook`
- [ ] Webhook listens to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] `STRIPE_WEBHOOK_SECRET` (signing secret) set in `.env.local` and Vercel

### Sanity Schema
- [ ] `src/lib/sanity/schemas/member.ts` created
- [ ] Schema has fields: `email`, `stripeCustomerId`, `stripeSubscriptionId`, `tier`, `status`, `memberSince`, `displayName`
- [ ] All fields except `displayName` are `readOnly: true` in Studio
- [ ] Schema registered in `src/lib/sanity/schemas/index.ts`
- [ ] `SANITY_API_WRITE_TOKEN` created with editor/write permissions and set in env vars
- [ ] Member documents visible in Sanity Studio

### API Routes
- [ ] `src/app/api/create-checkout/route.ts` created
- [ ] Route maps tier ID to price ID via `PRICE_MAP` using env vars
- [ ] Route creates Stripe Checkout Session with `mode: 'subscription'`
- [ ] `success_url` includes `{CHECKOUT_SESSION_ID}` placeholder
- [ ] Route returns `{ url }` for client-side redirect
- [ ] `src/app/api/stripe-webhook/route.ts` created
- [ ] Webhook reads raw request body bytes before parsing
- [ ] Signature verified with `stripe.webhooks.constructEvent`
- [ ] `checkout.session.completed` handler creates member in Sanity
- [ ] `customer.subscription.updated` handler updates member status
- [ ] `customer.subscription.deleted` handler marks member cancelled
- [ ] Handler returns 200 even when Sanity write fails (prevents Stripe retries)

### Join Page & Components
- [ ] `/join` page updated with member count and tier cards
- [ ] `MembershipTiers` component renders 3 tier cards with pricing and perks
- [ ] "Contributor" tier visually highlighted as "Most Popular"
- [ ] Join buttons call `/api/create-checkout` and redirect to Stripe Checkout URL
- [ ] Loading state shown on button during API call and redirect
- [ ] Tier cards styled with `border-untele` on featured, sharp edges, no border-radius
- [ ] CTAs use `bg-untele py-3 text-xs font-black uppercase tracking-widest text-white` pattern

### Success Page
- [ ] `src/app/(user)/join/success/page.tsx` created
- [ ] Shows confirmation message with tier name and next billing date
- [ ] Newsletter signup prompt included
- [ ] Link back to homepage and to articles
- [ ] `generateMetadata` with noindex

### Testing
- [ ] Test checkout completed with Stripe test card `4242 4242 4242 4242`
- [ ] Member document appears in Sanity Studio after test checkout
- [ ] Stripe CLI webhook forwarding tested locally
- [ ] Subscription cancellation webhook tested (member status updated to 'cancelled')
- [ ] Member count on `/join` page reflects actual member count from Sanity
- [ ] `pnpm build` passes without TypeScript errors
- [ ] All Stripe keys in environment variables — no hardcoded keys in source code
