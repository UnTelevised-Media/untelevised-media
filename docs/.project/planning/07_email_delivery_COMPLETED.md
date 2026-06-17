# Plan 07 — Email Delivery & Webhooks: Deliverables Complete

**Completed:** 2026-05-03  
**Branch:** `feat/issue-46-bookstore`  
**TypeScript:** `pnpm tsc --noEmit` — 0 errors

---

## Deliverables

### 1. Supabase Migration — Shipping Tracking Columns

**File:** `supabase/migrations/20260503000003_shipping_tracking.sql`

Added three columns to `public.orders`:

- `shipping_tracking_number text` — carrier tracking number
- `shipping_tracking_url text` — direct carrier tracking link
- `shipped_at timestamptz` — timestamp when order was marked shipped (separate from `fulfilled_at`)

Includes a partial index on `shipping_tracking_number` for efficient lookups.

**Action required:** Run `supabase db push` or apply via Supabase Dashboard SQL editor.

---

### 2. Branded Email Templates + File Attachments

**File:** `src/lib/bookstore/email.ts` _(full rewrite)_

**What changed:**

| Function | Before | After |
| --- | --- | --- |
| `sendOrderConfirmationEmail` | Bare HTML, title + total only | Branded layout, itemized table with unit prices, subtotal/shipping/tax breakdown, shipping address block, digital download CTA |
| `sendDigitalDownloadEmail` | Single vault link | Per-item download buttons; tries to attach files ≤ 10 MB from Supabase Storage; falls back to vault link if too large |
| `sendGuestDownloadEmail` | Plain single-use link | Branded layout; tries to attach file ≤ 10 MB; keeps single-use link as backup with clear expiry notice |
| `sendShipmentEmail` | Plain text, no branding | Branded layout, tracking number displayed prominently, "Track Package →" CTA button |
| `sendRefundEmail` | Plain text, no branding | Branded layout with contact link |

**New additions:**

- `emailLayout(content, title)` — shared dark-mode HTML wrapper (red header bar, `#D70606` brand color, footer with links)
- `fetchAttachmentIfSmall(storagePath, maxBytes)` — fetches from `digital-books` Supabase Storage bucket via signed URL; uses HEAD to check size before downloading; returns `null` if file > 10 MB or on any error
- All interfaces exported for use in the send-email route

**Subject lines updated** from "UnTelevised Media" to "Hurriya Publications" to match the publishing imprint.

---

### 3. Internal Send-Email Route — Enriched Payload Types

**File:** `src/app/api/bookstore/internal/send-email/route.ts`

Updated `Payload` union type:

- `order-confirmation` — now accepts `subtotalCents`, `shippingCents`, `taxCents`, `shippingAddress`, `hasDigital`, and `unitPriceCents` per item
- `digital-download` — now accepts `items[]` array with `title`, `formatLabel`, `orderItemId`, `storagePath` (enables per-item attachment fetching)
- `guest-download` — now accepts optional `storagePath` (for attachment)
- `refund` — **new type** added; was previously missing from this route

---

### 4. Stripe Webhook Edge Function — Enriched Email Calls + Refund Email

**File:** `supabase/functions/stripe-webhook/index.ts`

**Changes:**

1. **`EmailPayload` union** updated to match all new payload shapes (including `refund` type)

2. **`guestDownloadLinks` array** extended with `storagePath` field so guest emails can attempt file attachment

3. **`digitalEmailItems` array** added — collects digital items during the order loop for the consolidated auth-user download email:

   ```ts
   {
     (title, formatLabel, orderItemId, storagePath);
   }
   ```

4. **`order-confirmation` sendEmail call** now passes:
   - `unitPriceCents` per item (from `orderItemRows`)
   - `subtotalCents`, `shippingCents`, `taxCents`
   - `shippingAddress` from `expandedSession.collected_information.shipping_details.address`
   - `hasDigital` flag

5. **`digital-download` sendEmail call** now passes the full `digitalEmailItems` array (was previously just `{ to, orderNumber }`)

6. **`handleRefund()`** now sends a refund email after revoking digital downloads — previously this was a gap

---

### 5. Portal Order Status Route — Persist Tracking to DB

**File:** `src/app/api/portal/orders/[id]/status/route.ts`

**Changes:**

- Schema extended with `tracking_url: z.string().optional()`
- When `newStatus === 'shipped'`:
  - Writes `shipping_tracking_number` to DB (if provided)
  - Writes `shipping_tracking_url` to DB (if provided)
  - Writes `shipped_at` timestamp to DB
- `sendShipmentEmail()` now receives `trackingUrl` (was previously only `trackingNumber`)

---

### 6. Supabase DB Webhook Handler — New Route

**File:** `src/app/api/webhooks/supabase-order-update/route.ts` _(new)_

Handles the Supabase Database Webhook that fires when a tracking number is added directly to the `orders` table (e.g., via direct DB edit, future admin tools, or any surface other than the portal UI).

**Flow:**

```
orders UPDATE (tracking_number NULL → value)
  └─ Supabase pg_net POST → /api/webhooks/supabase-order-update
       ├─ Verifies x-supabase-webhook-secret header
       ├─ Guards: skips if tracking number already existed or guest order
       ├─ Fetches customer email from customers table
       └─ sendShipmentEmail() → customer inbox
```

Authenticated via `SUPABASE_WEBHOOK_SECRET` env var (shared secret in request header).

**Supabase Dashboard configuration required:**

```
Database → Webhooks → Create Webhook
  Name:    order-shipping-update
  Table:   public.orders
  Events:  UPDATE
  URL:     https://www.untelevised.media/api/webhooks/supabase-order-update
  Header:  x-supabase-webhook-secret: <SUPABASE_WEBHOOK_SECRET value>
```

---

### 7. Type Updates — `Order`, `database.types.ts`, `OrdersTable`

**`src/lib/bookstore/types.ts`** Added to `Order` interface:

```ts
shipping_tracking_number: string | null;
shipping_tracking_url: string | null;
shipped_at: string | null;
```

**`src/lib/bookstore/database.types.ts`** Added `shipping_tracking_number`, `shipping_tracking_url`, `shipped_at`, and `stripe_fee_cents` to `orders` Row / Insert / Update types.

**`src/components/portal/OrdersTable.tsx`**

- `updateStatus()` signature extended with optional `trackingUrl` param
- Second input field added to the "Mark as Shipped" dialog: **Tracking URL** (type=url)
- `tracking_url` sent in the PATCH body
- Optimistic UI update includes `shipping_tracking_number`, `shipping_tracking_url`, `shipped_at`
- Expanded panel Timeline section now shows:
  - `Shipped:` timestamp (separate from Fulfilled)
  - Tracking number (monospace)
  - "Track Package →" link (when URL present)

**`src/app/(portal)/portal/sales/page.tsx`**

- Type cast for raw Supabase orders updated to include the three new columns
- Mapping to `OrderWithItems` passes them through

---

## New Environment Variable Required

| Variable | Where | Purpose |
| --- | --- | --- |
| `SUPABASE_WEBHOOK_SECRET` | Vercel env vars + Supabase webhook header | Authenticates DB webhook calls to `/api/webhooks/supabase-order-update` |

---

## Email Flow Summary (Final State)

```
Stripe checkout.session.completed
  └─ Supabase Edge Function
       └─ POST /api/bookstore/internal/send-email
            ├─ order-confirmation  → Branded receipt, itemized, shipping address
            ├─ digital-download   → Per-item buttons + file attachment ≤10MB (auth users)
            └─ guest-download     → Single-use link + file attachment ≤10MB (one per item)

Stripe charge.refunded
  └─ Supabase Edge Function (handleRefund)
       └─ POST /api/bookstore/internal/send-email
            └─ refund  → Branded refund confirmation

Staff marks order as shipped via portal
  └─ PATCH /api/portal/orders/[id]/status
       ├─ Saves tracking_number, tracking_url, shipped_at to DB
       └─ sendShipmentEmail() directly → customer inbox

DB update (tracking number set by any surface)
  └─ Supabase DB Webhook → POST /api/webhooks/supabase-order-update
       └─ sendShipmentEmail() → customer inbox
```

---

## Testing Checklist

- [ ] Apply migration: `supabase/migrations/20260503000003_shipping_tracking.sql`
- [ ] Set `SUPABASE_WEBHOOK_SECRET` in Vercel and Supabase Dashboard webhook header
- [ ] Configure Supabase Database Webhook (see §6 above)
- [ ] Place digital-only order (auth user) → verify receipt has itemized prices + download email with vault link ± attachment
- [ ] Place digital-only order (guest) → verify guest download email has single-use link ± attachment
- [ ] Place physical order → verify receipt shows shipping address, no download section
- [ ] Place mixed order (digital + physical) → receipt shows both; download email sent
- [ ] Trigger refund in Stripe Dashboard → verify refund email received from Edge Function
- [ ] Mark order as shipped in portal with tracking number + URL → verify email arrives with tracking block
- [ ] Update tracking number directly in Supabase Table Editor → verify DB webhook fires → email arrives
- [ ] Test digital file > 10 MB → no attachment, vault link shown instead
- [ ] Confirm `pnpm tsc --noEmit` stays clean after `supabase gen types` regeneration
