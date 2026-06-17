# Hurriya Publications — Bookstore Recommendations

_May 2026 — Full codebase audit: storefront, portal, Supabase edge functions, API routes_

---

## What's Already Built

The bookstore is substantially complete and production-ready.

**Storefront**

- Shopping cart (Zustand + localStorage persistence)
- Stripe Checkout — physical + digital + tip line items in a single session, `allow_promotion_codes: true`
- Genre filtering (URL-based, shareable)
- Book detail page — cover, description, formats, revenue transparency, author bio, buy CTAs
- Sample PDF preview link (`samplePdfUrl` rendered on book detail page)
- Breadcrumb navigation on book detail page

**Fulfillment**

- Digital download vault — authenticated (Clerk) with signed URL generation and download limits
- Guest download — one-time token-based links delivered by email, renewable up to 3 times
- Stripe webhook (`supabase/functions/stripe-webhook`) — handles `checkout.session.completed` and `charge.refunded`; creates orders, order_items, author_earnings, digital_downloads, guest tokens; sends all transactional emails
- Shipment tracking — `OrdersTable` displays tracking number/URL; `/api/webhooks/supabase-order-update` fires shipment email when tracking is added; `/api/portal/orders/[id]/status` captures tracking on status update

**Author & Admin Portal** (`/portal`)

- Earnings dashboard — real-time stats, payout history, tips breakdown, per-book sales split (`/portal/earnings`)
- Sales & order management — role-aware (admin/sales/author), full order lifecycle, expandable detail rows, inline status + tracking updates (`/portal/sales`)
- Book library — CRUD, inventory alerts, sales stats per title (`/portal/library`)
- Portal dashboard — widgets for pending orders, tips, payouts, book strip (`/portal/page`)
- Book management actions — create, upload cover, upload digital asset, update, genre management (`src/lib/portal/book-actions.ts`)

**Infrastructure**

- Transactional email — 5 templates (order confirmation, digital download, guest download, shipment, refund) via Nodemailer + Google SMTP
- Rate limiting (Upstash Redis) on checkout, download, and guest-resend endpoints
- Audit logging (fire-and-forget on all payment events)
- RBAC — admin / sales / author / editor roles enforced across portal and API routes
- Tipping system — name-your-price, direct to author, included in order and email flow
- Revenue sharing transparency — per-book splits displayed on detail page, recorded in `author_earnings`
- Returns & refunds policy page
- About / Our Story page
- Full Hurriya Publications sub-brand (header, nav strip, footer)

---

## Remaining Gaps

Tier 1 blocks revenue or creates bad user experiences. Tier 2 improves discovery, conversion, or platform trust. Tier 3 is longer-horizon work.

---

### TIER 1 — Critical

---

#### 1. Inventory Decrement on Purchase

**What's missing:** Physical book inventory is tracked in Sanity (`formats[].inventory.quantity`) but the Stripe webhook does not decrement it. A physical book can oversell indefinitely.

The webhook currently creates `order_items`, `author_earnings`, and `digital_downloads` — but does NOT call `writeClient.patch(bookId).dec(...)` on Sanity.

**Fix:** In `supabase/functions/stripe-webhook/index.ts`, after inserting order_items, call the Sanity Mutations API for each physical item:

```
PATCH https://<project>.api.sanity.io/v2021-06-07/data/mutate/<dataset>
{ mutations: [{ patch: { id: bookId, dec: { "formats[_key == \"...\"].inventory.quantity": qty } } }] }
```

If quantity hits zero and `allowBackorder` is false, follow with a second mutation setting `status` to `"out-of-stock"`.

---

#### 2. Book Search

**What's missing:** The bookstore homepage has genre filtering but no text search. With one book this is a non-issue; at ten it becomes a real problem.

**Implementation:** Add a search input querying Sanity directly:

```groq
*[_type == "book" && status in ["published", "out-of-stock"] && (
  title match $q + "*" ||
  author->name match $q + "*" ||
  pt::text(description) match $q + "*"
)] | order(publishedAt desc) { ...bookFragment }
```

Use a `?q=` URL param so results are shareable and server-rendered. Follow the `GenreFilter` component pattern.

---

#### 3. Out-of-Stock Notification / Waitlist

**What's missing:** Out-of-stock books show a blocking overlay but give the reader nowhere to go. No mechanism to capture intent or notify when stock returns.

**Implementation:**

- Supabase table: `waitlist (id, sanity_book_id, format_type, email, created_at, notified_at)`
- Email capture form on out-of-stock book pages (server action, no Clerk required)
- Supabase database trigger fires when inventory is restored — queries waitlist and sends notification emails
- Admin can view entries in the portal library view

---

### TIER 2 — High Value

---

#### 4. Related Books / "Also by This Author"

**What's missing:** The book detail page ends at the author bio with no onward journey. A reader who finishes the page has nowhere to go except away.

**Add two sections after the author bio:**

- **More by [Author Name]** — `*[_type == "book" && author._ref == $authorId && slug.current != $slug && status == "published"]` — 2–3 card row
- **In the Same Genre** — books sharing any genre with the current one, excluding the current book — 2–3 card row

Both are lightweight parallel fetches. They render nothing until there are 3+ books in the catalog — build it now, it becomes useful automatically.

---

#### 5. Payout Approval Workflow UI

**What's partially done:** The `payouts` Supabase table has `status` (pending / paid / cancelled), `paid_at`, and `notes` columns. The portal earnings page and pending payouts widget show payout data. But there is no UI to act on it.

**What's missing:**

- An admin-only action to transition `pending → paid` or `pending → cancelled`, capturing `paid_at` and optional notes
- A PATCH endpoint at `/api/portal/payouts/[id]/status` — same pattern as the existing order status API
- Authors currently have no confirmation that a payout has been processed other than checking their bank account

---

### TIER 3 — Platform Maturity

---

#### 6. Multi-Author / Contributor Field

Each book supports one `author` reference. Co-authored books, forewords, or edited collections are not representable in the current schema.

**Non-breaking schema addition:**

```typescript
{
  name: 'contributors',
  type: 'array',
  of: [{ type: 'object', fields: [
    { name: 'author', type: 'reference', to: [{ type: 'author' }] },
    { name: 'role', type: 'string' } // "Co-author", "Foreword", "Editor"
  ]}]
}
```

Revenue model is unaffected — `revenueTerms` handles splits independently of this field.

---

#### 7. Localization / Multi-Language UI

The `language` field exists on every book. If Hurriya publishes an Arabic title, the entire storefront UI remains in English. Not urgent now — flag for when the catalog includes non-English titles. Implementation path: `next-intl`.

---

#### 8. Physical Pre-orders

Add `"pre-order"` as a valid book `status` in the Sanity schema. Show an expected release date and a pre-order CTA on the book detail page. Useful for fundraising a print run before committing to it — orders created in `pre_order` status, fulfilled manually when stock ships.

---

#### 9. Affiliate / Referral Links

Advocates who post about books in solidarity communities could earn a small commission or store credit. Stripe supports referral tracking via URL params + session metadata. Low priority now; a natural fit for the platform's framing when the catalog is larger.

---

## Summary

| #   | Recommendation                   | Tier | Effort |
| --- | -------------------------------- | ---- | ------ |
| 1   | Inventory decrement on purchase  | 1    | Medium |
| 2   | Book search                      | 1    | Low    |
| 3   | Out-of-stock waitlist            | 1    | Medium |
| 4   | Related books on detail page     | 2    | Low    |
| 5   | Payout approval workflow UI      | 2    | Low    |
| 6   | Multi-author / contributor field | 3    | Low    |
| 7   | Localization                     | 3    | High   |
| 8   | Physical pre-orders              | 3    | Medium |
| 9   | Affiliate / referral links       | 3    | High   |

---

## Next Actions

1. **Inventory decrement** — Add the Sanity Mutations API call to the Stripe webhook handler for physical items. The only remaining gap that can cause direct financial damage.

2. **Payout approval UI** — One PATCH endpoint plus a button in the portal earnings view. Authors should not have to check their bank to know they've been paid.

3. **End-to-end purchase test in Stripe test mode** — Confirm: order appears in Supabase, download email arrives, download link works, `author_earnings` row created with correct splits.

---

_Audit covers: `src/app/(user)/bookstore/`, `src/app/(portal)/portal/`, `src/components/bookstore/`, `src/components/portal/`, `src/lib/bookstore/`, `src/lib/portal/`, `src/app/api/bookstore/`, `src/app/api/portal/`, `src/app/api/webhooks/`, `supabase/functions/stripe-webhook/`, `src/models/schema/`, `src/lib/sanity/lib/queries.ts`_
