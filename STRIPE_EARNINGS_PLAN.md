# Stripe Fee Deductions & Author Earnings Plan

> **Status**: Awaiting Approval  
> **Branch**: feat/issue-46-bookstore  
> **Date**: 2026-05-03

---

## Overview

Currently `author_sales` records `gross_cents` (what the customer paid) and splits it
by percentage into `author_cents`, `platform_cents`, and `publisher_cents` — with no
accounting for Stripe's processing fee. This means splits are calculated against money
we don't actually receive, and the numbers are wrong for international cards.

This plan adds:

1. A real Stripe fee lookup via the Balance Transaction API (no formula guessing)
2. A new `author_earnings` table recording actual net-of-Stripe amounts and payout periods
3. `stripe_fee_cents` on the `orders` table
4. Portal UI updates (books + orders pages, OrdersTable) showing pre/post Stripe numbers
5. Bi-monthly payout period logic (1st–15th and 16th–last day of each month)

**Customer-facing pages are not changed.** Customers always see the price they paid.

---

## Why the Stripe API — Not a Formula

The formula `2.9% + 30¢` applies to US domestic cards only. Stripe charges different
rates for:

| Scenario | Rate |
|---|---|
| US domestic card | 2.9% + 30¢ |
| International card | +1.5% surcharge → 4.4% + 30¢ |
| Currency conversion | +1% on top |
| Corporate / purchasing cards | varies |
| Future Stripe pricing changes | unknown |

By retrieving the **actual** `balance_transaction.fee` from Stripe after every
successful charge, we get the real number regardless of card type, currency, or future
rate changes. This is a single additional API call per order in the webhook — already
consistent with the existing pattern of expanding `line_items` via a second retrieve.

### Stripe API call

After the payment intent ID is confirmed (step 5 in the existing webhook, when the
order row is created), we retrieve the payment intent with the balance transaction
expanded:

```typescript
const pi = await stripe.paymentIntents.retrieve(
  session.payment_intent as string,
  { expand: ['latest_charge.balance_transaction'] }
);

const charge   = pi.latest_charge as Stripe.Charge;
const balTx    = charge.balance_transaction as Stripe.BalanceTransaction;
const stripeFee = balTx.fee;          // total fee in cents — domestic + intl + conversion
const feeDetails = balTx.fee_details; // breakdown array (logged for audit, not stored)
```

`balTx.fee` is the single authoritative number we need. It is already in cents.
`fee_details` is logged to the audit trail for transparency but not stored in its own
column (keeps the schema simple; re-derivable from Stripe Dashboard if ever needed).

### Test promo edge case

The internal test promo applies a 100% discount → `amount_total = 0`. A $0 transaction
incurs no Stripe fee (`balTx.fee = 0`). Since the webhook already records the original
list prices for test promo orders (not $0), we apply the same treatment to
`author_earnings`: record `stripe_fee_cents = 0` and use the full original gross as the
net. This is accurate — the test promo is an internal-only code with no real money
moving, so no fee is correct.

---

## Revenue Flow (After This Change)

```
Customer pays: $20.00 (2000¢)
  └── Stripe fee (actual, from balance_transaction):
        US card:   $0.88  (  88¢)   2.9% × 2000 + 30
        Intl card: $1.18  ( 118¢)   4.4% × 2000 + 30
  └── Net to platform (2000 - 88):   $19.12  (1912¢)

  Split applied to NET (example: first author at 100%):
    Author  (100%): $19.12
    Platform  (0%):  $0.00
    Publisher (0%):  $0.00

  Split applied to NET (standard 70/15/15):
    Author   (70%): $13.38  (1338¢)
    Platform (15%):  $2.87  ( 287¢)
    Publisher(15%):  $2.87  ( 287¢)
    (rounding remainder absorbed into publisher, always sums to net)
```

**Tips follow the same flow.** Tips are 100% author, but the Stripe fee is still a real
transaction cost that cannot be absorbed by the platform. Tips earned = gross tip −
proportional Stripe fee.

---

## Database Changes

### 1. Add `stripe_fee_cents` to `orders`

```sql
ALTER TABLE orders
  ADD COLUMN stripe_fee_cents INTEGER NOT NULL DEFAULT 0;
```

Stores the actual total Stripe fee for the whole transaction in cents. Written by the
webhook immediately after the Balance Transaction API call.

### 2. New `author_earnings` table

```sql
CREATE TABLE author_earnings (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source links
  author_sale_id           UUID NOT NULL REFERENCES author_sales(id)  ON DELETE CASCADE,
  order_id                 UUID NOT NULL REFERENCES orders(id)         ON DELETE CASCADE,
  order_item_id            UUID NOT NULL REFERENCES order_items(id)    ON DELETE CASCADE,
  sanity_book_id           TEXT NOT NULL,
  author_clerk_id          TEXT,                  -- null if author not yet on Clerk

  -- Pre-Stripe (what customer paid for this line item)
  gross_cents              INTEGER NOT NULL,

  -- Stripe's cut proportionally allocated to this item
  stripe_fee_cents         INTEGER NOT NULL DEFAULT 0,

  -- Net received by platform for this item after Stripe
  net_after_stripe_cents   INTEGER NOT NULL,

  -- Revenue splits applied to net_after_stripe_cents
  author_cents             INTEGER NOT NULL DEFAULT 0,
  platform_cents           INTEGER NOT NULL DEFAULT 0,
  publisher_cents          INTEGER NOT NULL DEFAULT 0,

  is_tip                   BOOLEAN NOT NULL DEFAULT false,

  -- Payout period this sale belongs to
  payout_period_start      DATE NOT NULL,
  payout_period_end        DATE NOT NULL,

  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX author_earnings_author_idx     ON author_earnings (author_clerk_id);
CREATE INDEX author_earnings_order_idx      ON author_earnings (order_id);
CREATE INDEX author_earnings_period_idx     ON author_earnings (payout_period_start);
CREATE INDEX author_earnings_book_idx       ON author_earnings (sanity_book_id);
```

**Relationship to `author_sales`**: `author_sales` is kept unchanged as the gross-based
record (useful for historical gross revenue reporting). `author_earnings` is the
authoritative table for what is actually owed to authors after Stripe deductions.

### RLS policies (mirror `author_sales`)

```sql
-- Authors see only their own earnings
CREATE POLICY author_earnings_author_select ON author_earnings
  FOR SELECT USING (author_clerk_id = requesting_user_id());

-- Service role (webhook) can insert/update
-- (service_role bypasses RLS by default in Supabase)
```

---

## Stripe Fee Distribution Across Items

The `balance_transaction.fee` is a single number for the whole order. We distribute it
across items proportionally by their share of the order gross.

```typescript
// Proportional allocation
items.forEach((item, i) => {
  item.stripeFee = Math.round(orderStripeFee * (item.grossCents / orderTotalCents));
});

// Assign any rounding remainder to the largest item
const allocated = items.reduce((s, i) => s + i.stripeFee, 0);
const remainder = orderStripeFee - allocated;
if (remainder !== 0) {
  const largest = items.reduce((a, b) => (b.grossCents > a.grossCents ? b : a));
  largest.stripeFee += remainder;
}
```

This guarantees `sum(item.stripe_fee_cents) === orders.stripe_fee_cents` exactly.

---

## Payout Period Logic

Payouts are **bi-monthly**: the **1st–15th** and the **16th–last day** of each month.

```
Sale on 2026-05-03  →  period: 2026-05-01 to 2026-05-15  →  pays out 2026-05-16
Sale on 2026-05-17  →  period: 2026-05-16 to 2026-05-31  →  pays out 2026-06-01
```

The `payout_period_start` / `payout_period_end` columns on `author_earnings` are
computed at webhook insert time:

```typescript
function getPayoutPeriod(date: Date): { start: string; end: string } {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = date.getUTCDate();
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0))
    .getUTCDate();

  if (d <= 15) {
    return { start: `${y}-${m}-01`, end: `${y}-${m}-15` };
  }
  return { start: `${y}-${m}-16`, end: `${y}-${m}-${lastDay}` };
}
```

---

## Webhook Changes

The webhook already makes two Stripe API calls per order (the original session retrieve
+ an expand for line_items). This plan adds one more: retrieving the payment intent with
the balance transaction.

### New function: `fetchStripeFee`

```typescript
async function fetchStripeFee(paymentIntentId: string): Promise<number> {
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge.balance_transaction'],
    });
    const charge = pi.latest_charge as Stripe.Charge | null;
    if (!charge) return 0;
    const balTx = charge.balance_transaction as Stripe.BalanceTransaction | null;
    if (!balTx) return 0;
    console.log('[webhook] stripe fee breakdown:', JSON.stringify(balTx.fee_details));
    return balTx.fee; // cents
  } catch (err) {
    console.error('[webhook] fetchStripefee failed:', err);
    return 0; // non-fatal — earnings still recorded, fee shows as 0
  }
}
```

Error is non-fatal: if the API call fails we log it and record `stripe_fee_cents = 0`
rather than failing the entire order write. An admin can reconcile manually against the
Stripe Dashboard.

### New function: `insertAuthorEarning`

Runs after each `insertAuthorSale` call (one per order item), using the pre-computed
proportional fee for that item:

```typescript
async function insertAuthorEarning(
  db,
  opts: {
    authorSaleId: string;
    orderItemId: string;
    orderId: string;
    sanityBookId: string;
    authorClerkId: string | null;
    grossCents: number;
    itemStripeFee: number;
    revenueTerms: RevenueTerms | null;
    isTip: boolean;
    saleDate: Date;
  }
): Promise<void> {
  const net = opts.grossCents - opts.itemStripeFee;

  let authorPct = 70, platformPct = 15, publisherPct = 15;
  if (opts.isTip) {
    authorPct = 100; platformPct = 0; publisherPct = 0;
  } else if (opts.revenueTerms) {
    authorPct   = opts.revenueTerms.authorPercentage   ?? 70;
    platformPct = opts.revenueTerms.platformPercentage ?? 15;
    publisherPct = opts.revenueTerms.publisherPercentage ?? 15;
  }

  const authorCents   = Math.round(net * (authorPct   / 100));
  const platformCents = Math.round(net * (platformPct / 100));
  const publisherCents = net - authorCents - platformCents;

  const { start, end } = getPayoutPeriod(opts.saleDate);

  await db.from('author_earnings').insert({
    author_sale_id:          opts.authorSaleId,
    order_item_id:           opts.orderItemId,
    order_id:                opts.orderId,
    sanity_book_id:          opts.sanityBookId,
    author_clerk_id:         opts.authorClerkId,
    gross_cents:             opts.grossCents,
    stripe_fee_cents:        opts.itemStripeFee,
    net_after_stripe_cents:  net,
    author_cents:            authorCents,
    platform_cents:          platformCents,
    publisher_cents:         publisherCents,
    is_tip:                  opts.isTip,
    payout_period_start:     start,
    payout_period_end:       end,
  });
}
```

### Updated `handleCheckoutCompleted` flow

The additions slot into the existing flow after step 5 (order created) and after step 8
(author_sales inserted per item):

```
Existing step 5: create order row
  NEW 5b: const stripeFee = await fetchStripeFee(session.payment_intent)
  NEW 5c: await db.from('orders').update({ stripe_fee_cents: stripeFee }).eq('id', orderId)
  NEW 5d: const itemFees = distributeStripeFee(stripeFee, orderItems)
            // proportional allocation + remainder to largest item

Existing step 8 loop (per item): insertAuthorSale(...)
  NEW 8b: await insertAuthorEarning({ ...opts, itemStripeFee: itemFees[idx], saleDate: new Date() })
```

The `insertAuthorSale` function itself is **not modified** — it keeps recording
gross-based splits as before.

---

## Portal UI Changes

### Books Page (`src/app/(portal)/portal/books/page.tsx`)

**Data source change**: Summary earnings cards query `author_earnings` instead of
`author_sales`. The query is:

```sql
SELECT
  gross_cents,
  stripe_fee_cents,
  net_after_stripe_cents,
  author_cents,
  is_tip,
  payout_period_start,
  payout_period_end,
  order_item:order_items(quantity, is_digital),
  order:orders(status, created_at)
FROM author_earnings
WHERE author_clerk_id = $clerkUserId
```

**Updated summary section** (book sales only, tips excluded) — replaces the existing
single "Your Earnings" card with a three-part breakdown row:

```
┌────────────────┬────────────────┬────────────────┐
│  Gross Sales   │  Stripe Fees   │  Your Earnings │
│  $1,200.00     │  − $35.10      │  $1,164.90     │
└────────────────┴────────────────┴────────────────┘
```

- **Gross Sales** = `sum(gross_cents)` — what customers paid
- **Stripe Fees** = `sum(stripe_fee_cents)` — shown in red/muted as a cost
- **Your Earnings** = `sum(author_cents)` — sourced from `author_earnings`

**Next Payout card**: sources from `author_earnings` grouped by `payout_period_start`
for the current active period (today ≤ `payout_period_end` and unpaid).

**Payout History table**: gains two columns — `Gross` and `Stripe Fees` — alongside
the existing `Platform Fee` and `Net` columns.

**Tips section**: same three-part breakdown — tips are not hidden from this display,
but remain in a separate section so gross/net figures for books are unaffected.

### Orders Page (`src/app/(portal)/portal/orders/page.tsx`)

A new **"Earnings Breakdown"** section is added for admin and sales roles, below the
existing order-count stat cards. It shows for the selected period:

| Stat | Source | Roles |
|---|---|---|
| Gross Revenue | `sum(gross_cents)` from `author_earnings` | Admin, Sales |
| Stripe Fees Paid | `sum(stripe_fee_cents)` | Admin, Sales |
| Net to Platform | `sum(net_after_stripe_cents)` | Admin, Sales |
| Author Payouts | `sum(author_cents)` | Admin, Sales |
| Platform Revenue | `sum(platform_cents)` | Admin only |
| Publisher Share | `sum(publisher_cents)` | Admin only |

The existing revenue stat cards (sourced from `order_items.unit_price_cents × quantity`)
remain in place — they represent the order-level gross view. The new section is clearly
labelled "After Stripe Fees" to distinguish it.

### OrdersTable Component (`src/components/portal/OrdersTable.tsx`)

In the expanded order detail panel, a new row is inserted beneath the existing Payment
block (admin and sales roles only):

```
Payment
  Subtotal:         $20.00
  Tax:               $0.00
  Shipping:          $0.00
  ─────────────────────────
  Total Charged:    $20.00

After Stripe                        ← new section
  Stripe Fee:       − $0.88         ← red
  Net to Platform:  $19.12
```

For author role (read-only, their books only):

```
Your Earnings
  Customer Paid:    $20.00
  Stripe Fee:       − $0.88
  Your Cut:         $19.12
```

---

## What Does NOT Change

| Area | Status |
|---|---|
| Checkout flow | No changes |
| `bookstore/order-success` page | No changes |
| Customer `bookstore/orders` page | No changes |
| `author_sales` table | No changes — kept as gross-based record |
| Revenue split percentages | No changes — still from Sanity `revenueTerms` or 70/15/15 defaults |
| `charge.refunded` handler | No changes in this plan (see Open Questions) |

---

## Migration Files Required

**File**: `supabase/migrations/20260503_XXX_stripe_earnings.sql`

Contents:
1. `ALTER TABLE orders ADD COLUMN stripe_fee_cents INTEGER NOT NULL DEFAULT 0`
2. `CREATE TABLE author_earnings` — full DDL as above
3. All indexes
4. RLS policies matching `author_sales` pattern
5. `GRANT SELECT, INSERT ON author_earnings TO service_role`
6. `GRANT SELECT ON author_earnings TO authenticated`

---

## Implementation Order

| Step | Task | Notes |
|---|---|---|
| 1 | Migration | Schema-only, no app impact |
| 2 | Webhook: `fetchStripeFee` + `distributeStripeFee` | Add after order insert (step 5b–5d) |
| 3 | Webhook: `insertAuthorEarning` | Add after each `insertAuthorSale` call (step 8b) |
| 4 | Portal Books page | Swap query to `author_earnings`, add three-part summary row |
| 5 | Portal Orders page | Add "Earnings Breakdown" section |
| 6 | OrdersTable | Add "After Stripe" rows in expanded detail panel |
| 7 | Test | Verify fee math, proportional distribution, payout period assignment, portal display |

---

## Open Questions for Approval

1. **Refund handling for `author_earnings`**: When `charge.refunded` fires, the existing
   handler marks the order `refunded` and zeroes out digital download counts. Should we
   also insert a negative reversal row into `author_earnings` (to net the earning to $0)
   or simply flag the row as voided? A reversal row keeps the ledger append-only; a flag
   keeps it simpler.

2. **Historical data backfill**: Existing `author_sales` rows have no Stripe fee data.
   Should we backfill `author_earnings` for past orders (the fee can be retrieved from
   Stripe's Balance Transactions API by payment intent), or only track going forward?

3. **Payout generation**: The `payouts` table is currently populated manually. Should we
   add a Supabase database function or an admin portal action that auto-generates payout
   rows from `author_earnings` on the 1st and 16th of each month, or keep it manual for
   now?
