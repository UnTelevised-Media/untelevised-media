# Plan 07: Email Delivery, Order Receipts & Supabase Webhooks

**Branch:** `feat/issue-46-bookstore`  
**Status:** Planning — awaiting review  
**Date:** 2026-05-03

---

## 1. Current Architecture (What's Already Built)

Understanding the baseline prevents rework.

```
Stripe → Supabase Edge Function (stripe-webhook)
           ├─ Writes: customers, orders, order_items, digital_downloads,
           │          guest_download_tokens, author_sales, author_earnings, audit_logs
           └─ Calls: POST /api/bookstore/internal/send-email (Bearer auth)
                       ├─ order-confirmation  → sendOrderConfirmationEmail()
                       ├─ digital-download   → sendDigitalDownloadEmail()
                       └─ guest-download     → sendGuestDownloadEmail()
```

**Email transport:** Nodemailer + Gmail SMTP (`smtp.gmail.com:587`, App Password)  
**Download center:** `/bookstore/downloads` (auth users), guest tokens via `/api/bookstore/download/guest`

---

## 2. Gaps — What's Missing

| # | Gap | Impact |
| --- | --- | --- |
| 1 | `sendShipmentEmail()` exists but is **never triggered** — no mechanism to call it | Customers never get shipping notifications |
| 2 | `sendRefundEmail()` exists but is **never called** from `handleRefund()` in the webhook | Customers don't know when refunds are processed |
| 3 | `order-confirmation` email has **no per-item prices**, no shipping address | Receipt is incomplete — just shows titles + total |
| 4 | `digital-download` email sends users to the vault page only — **no per-book links**, no file attachment | Extra friction; guests can't use the vault |
| 5 | **No file attachment** for digital purchases in any email | User expectation not met |
| 6 | **No Supabase DB webhook** — currently only Stripe webhook exists | Shipping updates require a separate trigger path |
| 7 | **No admin UI** for entering tracking numbers on physical orders | No way to trigger the shipment email |
| 8 | Email HTML is **bare-bones, unbranded** — no Hurriya / UnTelevised styling | Looks unprofessional |
| 9 | `digital-download` email sent to **auth users only** — guest download email handles guests | This is correct but not obvious from reading the code |

---

## 3. Implementation Plan

### Phase 1 — Branded Email Templates

**Goal:** Replace the bare-bones inline HTML with properly branded, structured emails.

**Approach:** Inline HTML (no new dependencies — React Email is overkill for 5 templates and adds build complexity). Use a shared layout wrapper function in `email.ts`.

**Shared layout wrapper:**

```ts
// src/lib/bookstore/email.ts
function emailLayout(content: string, title: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><title>${title}</title></head>
  <body style="margin:0;padding:0;background:#0a0a0a;font-family:sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;max-width:600px;width:100%;">
          <!-- Header bar -->
          <tr><td style="background:#D70606;padding:16px 32px;">
            <span style="color:#fff;font-size:11px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">
              HURRIYA PUBLICATIONS / UNTELEVI SED MEDIA
            </span>
          </td></tr>
          <!-- Body -->
          <tr><td style="padding:32px;color:#e5e5e5;">
            ${content}
          </td></tr>
          <!-- Footer -->
          <tr><td style="background:#0a0a0a;padding:16px 32px;border-top:1px solid #222;text-align:center;">
            <span style="color:#555;font-size:11px;">
              Unfiltered. Uncensored. Uncompromising.<br>
              <a href="${baseUrl}" style="color:#D70606;">untelevised.media</a>
            </span>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;
}
```

**Templates to update:**

#### 1a. Order Receipt (`order-confirmation`)

Add: itemized table with unit price per line, shipping address, subtotal/shipping/tax/total breakdown, link to order history.

```
Subject: Order Receipt — UM-00042 | Hurriya Publications
```

New `OrderConfirmationParams` additions:

```ts
interface OrderConfirmationParams {
  to: string;
  orderNumber: string;
  items: {
    title: string;
    formatType: FormatType;
    qty: number;
    unitPriceCents: number; // ADD
  }[];
  subtotalCents: number; // ADD (split out from totalCents)
  shippingCents: number; // ADD
  taxCents: number; // ADD
  totalCents: number;
  shippingAddress?: {
    // ADD — only present for physical orders
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  hasDigital: boolean; // ADD — show download vault CTA if true
}
```

The Stripe webhook already has all this data (`subtotal_cents`, `shipping_cents`, `tax_cents`, expanded line items). The `sendEmail()` call in the Edge Function needs to pass these fields.

#### 1b. Digital Download Delivery (`digital-download`)

For **auth users**: include one download button per digital item (signed link to `/api/bookstore/download?order_item_id=<id>`) rather than just linking to the vault.

New `DigitalDownloadEmailParams` additions:

```ts
interface DigitalDownloadEmailParams {
  to: string;
  orderNumber: string;
  items: {
    // ADD — one per digital item
    title: string;
    formatLabel: string;
    orderItemId: string;
    downloadUrl: string; // pre-signed or app route URL
  }[];
  vaultUrl: string; // ADD — always show vault link too
  attachments?: EmailAttachment[]; // ADD — see Phase 2
}
```

#### 1c. Guest Download (`guest-download`)

Already good. Minor polish: add layout wrapper, clarify 14-day expiry, add account creation CTA.

#### 1d. Shipment Notification (`shipment`)

Already written (`sendShipmentEmail`). Add layout wrapper + estimated delivery note.

#### 1e. Refund Confirmation (`refund`)

Already written (`sendRefundEmail`). Add layout wrapper.

**Files to change:**

- `src/lib/bookstore/email.ts` — add `emailLayout()`, update all 5 functions, add `items[]` params
- `src/app/api/bookstore/internal/send-email/route.ts` — update payload types for `order-confirmation` and `digital-download` + add `shipment` and `refund` types
- `supabase/functions/stripe-webhook/index.ts` — pass enriched fields to `sendEmail()` calls

---

### Phase 2 — Digital File Attachments in Email

**Goal:** Attach the purchased digital file to the download delivery email when the file is small enough.

**Constraints:**

- Gmail SMTP limit: 25 MB per message (encoded, ~18 MB raw file max)
- Practical limit: 10 MB raw (base64 encoding adds ~33% overhead)
- Supabase Storage `createSignedUrl` returns a pre-signed URL valid for N seconds

**Decision tree for each digital order item:**

```
file size ≤ 10 MB?
  YES → fetch from Supabase Storage → attach to email as binary attachment
  NO  → include signed URL link only (valid 72 hours)
  UNKNOWN (can't fetch size) → include signed URL link only
```

**Implementation:**

Add a helper to `email.ts`:

```ts
// src/lib/bookstore/email.ts
import { createClient } from '@supabase/supabase-js';

interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

async function fetchAttachmentIfSmall(
  storagePath: string,
  maxBytes = 10 * 1024 * 1024
): Promise<EmailAttachment | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Generate a short-lived signed URL
  const { data: urlData, error: urlErr } = await supabase.storage
    .from('digital-books')
    .createSignedUrl(storagePath, 300); // 5 min — just for fetch

  if (urlErr || !urlData?.signedUrl) return null;

  const res = await fetch(urlData.signedUrl, { method: 'HEAD' });
  const contentLength = parseInt(res.headers.get('content-length') ?? '0', 10);
  if (contentLength > maxBytes) return null;

  const fileRes = await fetch(urlData.signedUrl);
  if (!fileRes.ok) return null;

  const buffer = Buffer.from(await fileRes.arrayBuffer());
  const filename = storagePath.split('/').pop() ?? 'download';
  const contentType = fileRes.headers.get('content-type') ?? 'application/octet-stream';

  return { filename, content: buffer, contentType };
}
```

**Nodemailer attachment format:**

```ts
await transporter.sendMail({
  from,
  to,
  subject,
  html,
  attachments: attachments.map((a) => ({
    filename: a.filename,
    content: a.content,
    contentType: a.contentType,
  })),
});
```

**Where to call this:** Inside `sendDigitalDownloadEmail()` and `sendGuestDownloadEmail()`, after resolving storage paths from the `items[]` array added in Phase 1.

**Note:** The `supabase_storage_path` for each item is stored in `digital_downloads` (auth users) and `guest_download_tokens` (guests). The internal send-email route must query Supabase to retrieve it. Add a service-role Supabase client to the Next.js API route for this lookup.

**Files to change:**

- `src/lib/bookstore/email.ts` — add `fetchAttachmentIfSmall()`, call from download emails
- `src/app/api/bookstore/internal/send-email/route.ts` — pass `storagePath` in payload so the route can do the lookup, or fetch it directly in the route

---

### Phase 3 — Wire Missing Email Triggers

**Goal:** `sendShipmentEmail` and `sendRefundEmail` are already implemented but never called.

#### 3a. Refund Email

**Where to fix:** `supabase/functions/stripe-webhook/index.ts`, `handleRefund()` function.

After updating the order status to `refunded`, fetch the customer email and order number, then call `sendEmail()`:

```ts
// in handleRefund(), after db.from('orders').update({ status: 'refunded' })
const { data: fullOrder } = await db
  .from('orders')
  .select('order_number, customers(email)')
  .eq('id', orderId)
  .maybeSingle();

if (fullOrder) {
  void sendEmail({
    type: 'refund',
    to: fullOrder.customers.email,
    orderNumber: fullOrder.order_number,
  });
}
```

Add `refund` to the `EmailPayload` union type in the Edge Function and to the internal route.

#### 3b. Shipment Email

The shipment email is triggered manually when staff enter a tracking number (see Phase 4 / Phase 5). It is NOT triggered from the Stripe webhook — it's triggered from the admin interface or the DB webhook.

**Files to change:**

- `supabase/functions/stripe-webhook/index.ts` — add refund email call in `handleRefund()`
- `src/app/api/bookstore/internal/send-email/route.ts` — add `refund` and `shipment` types

---

### Phase 4 — Supabase Database Webhook → Next.js (Shipping Updates)

**Goal:** When a physical order's tracking number is entered in Supabase (via the portal or direct DB update), automatically trigger a shipping notification email.

**Why a DB webhook vs another approach:**  
A DB webhook fires on any change to the `orders` row regardless of which surface made the change (portal, admin tool, direct psql). It's the most reliable trigger.

#### 4a. Supabase Webhook Configuration

In the Supabase Dashboard → **Database → Webhooks → Create Webhook:**

| Field | Value |
| --- | --- |
| Name | `order-shipping-update` |
| Table | `public.orders` |
| Events | `UPDATE` |
| Condition | `NEW.shipping_tracking_number IS NOT NULL AND OLD.shipping_tracking_number IS NULL` |
| URL | `https://www.untelevised.media/api/webhooks/supabase-order-update` |
| HTTP Method | `POST` |
| Headers | `x-supabase-webhook-secret: <SUPABASE_WEBHOOK_SECRET>` |

The condition ensures the webhook only fires the first time a tracking number is added (not on every update).

> **Note:** Supabase Database Webhooks use `pg_net` to make HTTP calls from Postgres. The condition filter is set in the Supabase Dashboard "Condition" field or via SQL trigger.

#### 4b. New Next.js Webhook Route

Create: `src/app/api/webhooks/supabase-order-update/route.ts`

```ts
// Receives Supabase DB webhook on orders UPDATE (tracking number added).
// Verifies secret, fetches customer email, sends shipment notification.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendShipmentEmail } from '@/lib/bookstore/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  // 1. Verify secret
  const secret = req.headers.get('x-supabase-webhook-secret');
  if (!secret || secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse payload
  // Supabase DB webhook payload: { type: 'UPDATE', table: 'orders', record: {...}, old_record: {...} }
  const body = await req.json();
  const order = body.record;
  const oldOrder = body.old_record;

  // 3. Guard: only proceed when tracking number is newly added
  if (!order?.shipping_tracking_number || oldOrder?.shipping_tracking_number) {
    return NextResponse.json({ skipped: true });
  }

  // 4. Fetch customer email
  const { data: customer } = await supabase
    .from('customers')
    .select('email')
    .eq('id', order.customer_id)
    .maybeSingle();

  if (!customer?.email) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  // 5. Send shipment email
  await sendShipmentEmail({
    to: customer.email,
    orderNumber: order.order_number,
    trackingNumber: order.shipping_tracking_number,
    trackingUrl: order.shipping_tracking_url ?? undefined,
  });

  return NextResponse.json({ sent: true });
}
```

**New env var required:** `SUPABASE_WEBHOOK_SECRET` (generate a random 32+ char string, set in both Vercel and as the Supabase webhook header value)

**Files to create:**

- `src/app/api/webhooks/supabase-order-update/route.ts`

**Supabase schema to verify:** The `orders` table needs `shipping_tracking_number` and `shipping_tracking_url` columns (confirm in migration files — likely already there based on `sendShipmentEmail` having these params).

---

### Phase 5 — Admin UI for Tracking Numbers

**Goal:** Give staff a way to enter tracking numbers on physical orders so the DB webhook fires.

**Where:** Add a "Mark as Shipped" action in the portal orders view.

**Portal order detail** (`/portal/sales` or a new `/portal/orders/[id]`):

- Show unfulfilled physical orders
- Input: tracking number (text), carrier (select: USPS / UPS / FedEx / DHL / Other), tracking URL (auto-generated or manual)
- Button: "Mark as Shipped" → `PATCH /api/portal/orders/[id]/ship`

**New API route:** `src/app/api/portal/orders/[id]/ship/route.ts`

```ts
// PATCH — sets tracking number on order, triggers DB webhook automatically
// Protected by Clerk auth + role check (admin/publisher role)

await supabase
  .from('orders')
  .update({
    shipping_tracking_number: trackingNumber,
    shipping_tracking_url: trackingUrl,
    status: 'shipped',
    shipped_at: new Date().toISOString(),
  })
  .eq('id', orderId);
```

The DB webhook fires automatically on this UPDATE — no manual email call needed in this route.

**Schema additions needed** (new migration):

```sql
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_tracking_url text,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz;
```

Check if `shipping_tracking_number` already exists in the migration files before adding it.

**Files to create/change:**

- `src/app/api/portal/orders/[id]/ship/route.ts` — new
- Portal orders UI component — add ship button + form (scope TBD)
- New Supabase migration for `shipping_tracking_url` / `shipped_at` if columns don't exist

---

## 4. Email Service: Nodemailer + Gmail SMTP

**Transport:** Nodemailer + Gmail SMTP — already configured and working. This is the sole email transport for the project.

| Concern        | Detail                                                                  |
| -------------- | ----------------------------------------------------------------------- |
| Transport      | `smtp.gmail.com:587` (STARTTLS) via App Password                        |
| From address   | Configured via `ORDERS_SMTP_FROM` env var                               |
| Attachments    | Native Nodemailer `attachments` array — no extra libraries needed       |
| Sending limit  | 500 emails/day (Gmail free account) — sufficient for early-stage volume |
| Deliverability | Good when DKIM/SPF are properly configured for the sending domain       |

**Nodemailer attachment format (reference):**

```ts
await transporter.sendMail({
  from,
  to,
  subject,
  html,
  attachments: [
    {
      filename: 'my-book.epub',
      content: fileBuffer, // Buffer
      contentType: 'application/epub+zip',
    },
  ],
});
```

No migration to any other service is planned.

---

## 5. Environment Variables

Variables needed beyond what already exists:

| Variable | Where to set | Purpose |
| --- | --- | --- |
| `SUPABASE_WEBHOOK_SECRET` | Vercel + Supabase Dashboard webhook header | Authenticate DB webhook calls to Next.js |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (already set for portal?) | Needed in Next.js for file attachment fetch + customer lookup in webhook route |

Existing required (must be confirmed set in Vercel):

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `ORDERS_SMTP_FROM`
- `INTERNAL_EMAIL_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`

---

## 6. Delivery Sequence (Target State)

```
Stripe checkout.session.completed
  └─ Supabase Edge Function
       ├─ Creates: order, order_items, digital_downloads / guest_download_tokens
       └─ POST /api/bookstore/internal/send-email
            ├─ type=order-confirmation  → Branded receipt (itemized, address, totals)
            ├─ type=digital-download    → Per-item download links + file attachment (if ≤10MB)
            │    (auth users only)
            └─ type=guest-download     → Single-use link + file attachment (if ≤10MB)
                 (one per digital guest item)

Stripe charge.refunded
  └─ Supabase Edge Function
       └─ POST /api/bookstore/internal/send-email
            └─ type=refund  → Refund confirmation email

Staff enters tracking number via portal UI
  └─ PATCH /api/portal/orders/[id]/ship
       └─ UPDATE orders SET shipping_tracking_number = ...
            └─ Supabase DB Webhook fires
                 └─ POST /api/webhooks/supabase-order-update
                      └─ sendShipmentEmail() → Tracking info + carrier link
```

---

## 7. Implementation Order

1. **Phase 1** — Branded templates (highest visible impact, low risk)
2. **Phase 3** — Wire refund email (small change, one file in Edge Function)
3. **Phase 4** — Supabase DB webhook route (enables shipping notifications)
4. **Phase 5** — Portal ship UI (enables staff to trigger shipping)
5. **Phase 2** — File attachments (most complex, depends on Phase 1 interface changes)

---

## 8. Testing Checklist

- [ ] Place a test digital-only order (authenticated user) → confirm receipt + download email with links
- [ ] Place a test digital-only order (guest) → confirm guest download email with single-use link
- [ ] Place a test physical order → confirm receipt with shipping address, NO download section
- [ ] Place a mixed order (digital + physical) → confirm receipt shows both, download email sent
- [ ] Trigger refund via Stripe Dashboard → confirm refund email received
- [ ] Enter tracking number via portal → confirm Supabase DB webhook fires → shipping email received
- [ ] Test file attachment: digital file ≤ 10 MB → attached; file > 10 MB → link only
- [ ] Guest download token: use link → file downloads; use link again → 403 (used)
- [ ] Check Gmail spam folder on first few sends; verify DKIM/SPF pass
