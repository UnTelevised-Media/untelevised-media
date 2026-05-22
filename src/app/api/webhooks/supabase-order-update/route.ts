// src/app/api/webhooks/supabase-order-update/route.ts
// Receives Supabase Database Webhook on orders UPDATE.
// Fires a shipment notification email when shipping_tracking_number is first set.
//
// Supabase Dashboard setup:
//   Database → Webhooks → Create Webhook
//   Table: public.orders | Events: UPDATE
//   URL: https://www.untelevised.media/api/webhooks/supabase-order-update
//   Header: x-supabase-webhook-secret: <SUPABASE_WEBHOOK_SECRET>
//
// Required env var:
//   SUPABASE_WEBHOOK_SECRET — must match the header value configured in Supabase Dashboard

import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { shopServiceClient } from '@/lib/bookstore/supabase';
import { sendShipmentEmail } from '@/lib/bookstore/email';

function timingSafeStringEqual(a: string, b: string): boolean {
  // Pad both to the same length before comparing so a length mismatch doesn't
  // short-circuit before timingSafeEqual runs.
  const maxLen = Math.max(a.length, b.length);
  const ba = Buffer.from(a.padEnd(maxLen));
  const bb = Buffer.from(b.padEnd(maxLen));
  return a.length === b.length && timingSafeEqual(ba, bb);
}

interface OrderRecord {
  id: string;
  order_number: string;
  customer_id: string | null;
  shipping_tracking_number: string | null;
  shipping_tracking_url: string | null;
}

interface WebhookPayload {
  type: string;
  table: string;
  schema: string;
  record: OrderRecord;
  old_record: OrderRecord;
}

export async function POST(req: NextRequest) {
  // 1. Verify shared secret with constant-time comparison to prevent timing attacks
  const receivedSecret = req.headers.get('x-supabase-webhook-secret') ?? '';
  const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET ?? '';

  if (!expectedSecret || !timingSafeStringEqual(receivedSecret, expectedSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse webhook payload
  let body: WebhookPayload;
  try {
    body = (await req.json()) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const order = body.record;
  const oldOrder = body.old_record;

  // 3. Guard: only act when tracking number is newly added (NULL → value)
  if (!order?.shipping_tracking_number || oldOrder?.shipping_tracking_number) {
    return NextResponse.json({ skipped: true });
  }

  // 4. Fetch customer email from Supabase
  if (!order.customer_id) {
    // Guest orders: email was already sent via stripe webhook guest-download flow
    return NextResponse.json({ skipped: true, reason: 'guest order' });
  }

  const { data: customer, error: custErr } = await shopServiceClient
    .from('customers')
    .select('email')
    .eq('id', order.customer_id)
    .maybeSingle();

  if (custErr || !customer?.email) {
    console.error('[supabase-order-update] Customer lookup failed:', custErr?.message);
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  // 5. Send shipment email
  try {
    await sendShipmentEmail({
      to: customer.email,
      orderNumber: order.order_number,
      trackingNumber: order.shipping_tracking_number,
      trackingUrl: order.shipping_tracking_url ?? undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Email send failed';
    console.error('[supabase-order-update] Shipment email failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ sent: true, orderNumber: order.order_number });
}
