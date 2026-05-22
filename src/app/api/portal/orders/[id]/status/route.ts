// src/app/api/portal/orders/[id]/status/route.ts
// PATCH — update order status. Accessible to admin, sales, and authors (own book orders only).

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getRoleFromUser } from '@/lib/auth/roles';
import { isSalesOnly } from '@/lib/auth/roles-utils';
import { shopServiceClient } from '@/lib/bookstore/supabase';
import { sendRefundEmail } from '@/lib/bookstore/email';
import { client as sanityReadClient } from '@/lib/sanity/lib/client';
import type { OrderStatus } from '@/lib/bookstore/types';
import { z } from 'zod';

const ALLOWED_TRANSITIONS: Record<string, OrderStatus[]> = {
  paid: ['processing', 'fulfilled', 'cancelled', 'refunded'],
  processing: ['shipped', 'fulfilled', 'cancelled', 'refunded'],
  shipped: ['delivered', 'refunded'],
  delivered: ['refunded'],
  fulfilled: ['refunded'],
};

// Allowlist of HTTPS carrier/tracking domains permitted in tracking_url.
// Only URLs on these domains will be injected into customer shipment emails.
// Add carriers here when a new shipping partner is onboarded.
const ALLOWED_TRACKING_HOSTS = new Set([
  'ups.com',
  'www.ups.com',
  'wwwapps.ups.com',
  'fedex.com',
  'www.fedex.com',
  'usps.com',
  'www.usps.com',
  'tools.usps.com',
  'dhl.com',
  'www.dhl.com',
  'parcelsapp.com',
  'www.parcelsapp.com',
  '17track.net',
  'www.17track.net',
  'track.amazon.com',
  'aftership.com',
  'www.aftership.com',
  'shipbob.com',
  'www.shipbob.com',
  'shipstation.com',
  'www.shipstation.com',
]);

function isAllowedTrackingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && ALLOWED_TRACKING_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

const schema = z.object({
  status: z.enum([
    'pending',
    'paid',
    'processing',
    'fulfilled',
    'shipped',
    'delivered',
    'refunded',
    'cancelled',
  ]),
  tracking_number: z.string().max(100).trim().optional(),
  // tracking_url is stored in the DB and injected as a raw href into customer
  // shipment emails — it must be validated against a carrier allowlist to prevent
  // phishing URLs reaching customers via legitimate branded email.
  tracking_url: z
    .string()
    .url()
    .refine(isAllowedTrackingUrl, {
      message: 'tracking_url must be an https:// link to a recognised carrier domain',
    })
    .optional(),
});

// ---------------------------------------------------------------------------
// Author ownership check
// ---------------------------------------------------------------------------
// Returns true if the Clerk user (identified by clerkUserId) has at least one
// book in the given order. This is done with a single GROQ query that resolves
// the author's Sanity ID and checks it against the order items in one round-trip.
//
// We use the CDN read client with cache:'no-store' so the check always reflects
// the current author-book assignment, not a stale cached response.
async function authorOwnsOrderItem(
  clerkUserId: string,
  orderItemBookIds: string[]
): Promise<boolean> {
  if (orderItemBookIds.length === 0) return false;

  // Resolve the Sanity author document for this Clerk user, then check whether
  // any of the order's books reference that author.
  const count = await sanityReadClient.fetch<number>(
    `count(*[_type == "book" && _id in $bookIds && author._ref in *[_type == "author" && clerkId == $clerkId]._id])`,
    { bookIds: orderItemBookIds, clerkId: clerkUserId },
    { cache: 'no-store' }
  );

  return count > 0;
}

// ---------------------------------------------------------------------------

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await params;

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = getRoleFromUser(user);
  if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    status: newStatus,
    tracking_number: trackingNumber,
    tracking_url: trackingUrl,
  } = parsed.data;

  // Fetch the current order to validate transition and ownership
  const { data: order, error: fetchError } = await shopServiceClient
    .from('orders')
    .select('id, status, customer_id')
    .eq('id', orderId)
    .maybeSingle();

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const currentStatus = order.status as OrderStatus;

  // Validate allowed transition (non-admins are constrained)
  if (role !== 'admin') {
    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${newStatus}` },
        { status: 422 }
      );
    }

    // Sales-only: cannot issue refunds (admin-only)
    if (isSalesOnly(role) && newStatus === 'refunded') {
      return NextResponse.json({ error: 'Refunds require admin role' }, { status: 403 });
    }

    // Authors: verify the order actually contains books they authored.
    // The previous check only tested items.length > 0, which is always true
    // for any real order — any author could modify any order in the system.
    if (role === 'author') {
      const { data: items } = await shopServiceClient
        .from('order_items')
        .select('sanity_book_id')
        .eq('order_id', orderId);

      const bookIds = (items ?? []).map((i) => i.sanity_book_id).filter(Boolean);
      const owns = await authorOwnsOrderItem(userId, bookIds);

      if (!owns) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  // Build the update payload
  const setFulfilledAt =
    newStatus === 'fulfilled' || newStatus === 'delivered' || newStatus === 'shipped';

  const now = new Date().toISOString();

  const { error: updateError } = await shopServiceClient
    .from('orders')
    .update({
      status: newStatus,
      ...(setFulfilledAt ? { fulfilled_at: now } : {}),
      ...(newStatus === 'shipped'
        ? {
            shipped_at: now,
            ...(trackingNumber ? { shipping_tracking_number: trackingNumber } : {}),
            ...(trackingUrl ? { shipping_tracking_url: trackingUrl } : {}),
          }
        : {}),
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('[portal/orders/status]', updateError.message);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }

  // Shipment email is handled exclusively by the Supabase DB webhook
  // (POST /api/webhooks/supabase-order-update) which fires on the DB update above.
  // Do NOT call sendShipmentEmail() here — that would send a duplicate.

  // Refund: send email directly (no DB webhook for refunds) and revoke digital access.
  if (newStatus === 'refunded') {
    const { data: fullOrder } = await shopServiceClient
      .from('orders')
      .select('order_number, customer:customers(email)')
      .eq('id', orderId)
      .maybeSingle();

    const customerEmail = (fullOrder?.customer as { email: string } | null)?.email;

    if (customerEmail && fullOrder) {
      sendRefundEmail({ to: customerEmail, orderNumber: fullOrder.order_number }).catch((e) =>
        console.error('[portal/orders/status] refund email failed:', e)
      );
    }

    const { data: digitalItems } = await shopServiceClient
      .from('order_items')
      .select('id')
      .eq('order_id', orderId)
      .eq('is_digital', true);

    for (const item of digitalItems ?? []) {
      await shopServiceClient
        .from('digital_downloads')
        .update({ max_downloads: 0 })
        .eq('order_item_id', item.id);
    }
  }

  return NextResponse.json({ success: true, status: newStatus });
}
