// src/app/api/bookstore/webhook/route.ts
// Stripe webhook endpoint. Verifies signature, routes events to handlers.
// Register this URL in Stripe Dashboard → Developers → Webhooks.
// TODO: set STRIPE_WEBHOOK_SECRET env var after registration.
//
// All Supabase writes use shopServiceClient (service role) — never anon from client.

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { shopServiceClient } from '@/lib/bookstore/supabase';
import sanityClient from '@/lib/sanity/lib/client';
import type { FormatType } from '@/lib/bookstore/types';
import { sendOrderConfirmationEmail, sendDigitalDownloadEmail } from '@/lib/bookstore/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
});

async function upsertCustomer(clerkUserId: string, email: string, name?: string) {
  const { data: existing } = await shopServiceClient
    .from('customers')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await shopServiceClient
    .from('customers')
    .insert({ clerk_user_id: clerkUserId, email, full_name: name ?? null })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create customer: ${error.message}`);
  return data.id;
}

async function generateOrderNumber(): Promise<string> {
  const { count } = await shopServiceClient
    .from('orders')
    .select('*', { count: 'exact', head: true });
  const num = String((count ?? 0) + 1).padStart(5, '0');
  return `UM-${num}`;
}

interface ItemMeta {
  bookId: string;
  formatType: FormatType;
  formatKey: string;
  isDigital: boolean;
  qty: number;
  title: string;
  priceId: string;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const clerkUserId = session.metadata?.clerk_user_id ?? '';
  const customerEmail = session.customer_details?.email ?? '';
  const customerName = session.customer_details?.name ?? undefined;

  if (!customerEmail) {
    console.error('[webhook] checkout.session.completed — no customer email');
    return;
  }

  // Upsert customer
  const customerId = clerkUserId
    ? await upsertCustomer(clerkUserId, customerEmail, customerName)
    : null;

  // Parse items metadata
  let items: ItemMeta[] = [];
  try {
    items = JSON.parse(session.metadata?.items_json ?? '[]') as ItemMeta[];
  } catch {
    console.error('[webhook] Failed to parse items_json from session metadata');
  }

  // Create order
  const orderNumber = await generateOrderNumber();
  const totalCents = session.amount_total ?? 0;
  const subtotalCents = totalCents; // Stripe sessions don't separate sub/tax by default

  const { data: order, error: orderError } = await shopServiceClient
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: customerId,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === 'string' ? session.payment_intent : null,
      status: 'paid',
      subtotal_cents: subtotalCents,
      tax_cents: 0,
      shipping_cents: 0,
      total_cents: totalCents,
      currency: session.currency ?? 'usd',
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('[webhook] Failed to create order:', orderError?.message);
    return;
  }

  // Create order items
  const orderItemInserts = items.map((item) => ({
    order_id: order.id,
    sanity_book_id: item.bookId,
    sanity_format_type: item.formatType,
    book_title: item.title,
    format_label: item.formatType.charAt(0).toUpperCase() + item.formatType.slice(1),
    unit_price_cents: Math.round((session.amount_total ?? 0) / Math.max(items.length, 1)),
    quantity: item.qty,
    stripe_price_id: item.priceId,
    is_digital: item.isDigital,
    download_fulfilled: false,
  }));

  const { data: createdItems, error: itemsError } = await shopServiceClient
    .from('order_items')
    .insert(orderItemInserts)
    .select();

  if (itemsError) {
    console.error('[webhook] Failed to create order items:', itemsError.message);
    return;
  }

  // Digital fulfillment
  const digitalItems = (createdItems ?? []).filter(
    (_, idx) => items[idx]?.isDigital && items[idx]?.bookId
  );

  for (const item of digitalItems) {
    const meta = items.find((m) => m.bookId === item.sanity_book_id);
    if (!meta) continue;

    // Look up the storage path from the Sanity book's digitalAsset field
    const storagePath: string =
      (await sanityClient.fetch(
        `*[_type == "book" && _id == $bookId][0].formats[_key == $formatKey][0].digitalAsset.supabaseStoragePath`,
        { bookId: meta.bookId, formatKey: meta.formatKey }
      )) ?? '';

    if (!storagePath) {
      console.warn(
        `[webhook] No storage path found for book ${meta.bookId} format ${meta.formatKey} — download will not be available`
      );
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    if (customerId) {
      await shopServiceClient.from('digital_downloads').insert({
        order_item_id: item.id,
        customer_id: customerId,
        supabase_storage_path: storagePath,
        download_count: 0,
        max_downloads: 5,
        expires_at: expiresAt.toISOString(),
      });
    }

    // Mark item as fulfilled
    await shopServiceClient
      .from('order_items')
      .update({ download_fulfilled: true })
      .eq('id', item.id);
  }

  // Send emails
  try {
    await sendOrderConfirmationEmail({
      to: customerEmail,
      orderNumber,
      items: items.map((i) => ({ title: i.title, formatType: i.formatType, qty: i.qty })),
      totalCents,
    });

    if (digitalItems.length > 0) {
      await sendDigitalDownloadEmail({ to: customerEmail, orderNumber });
    }
  } catch (emailErr) {
    console.error('[webhook] Email send failed:', emailErr);
  }
}

async function handleRefund(charge: Stripe.Charge) {
  const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null;
  if (!piId) return;

  const { data: order } = await shopServiceClient
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', piId)
    .maybeSingle();

  if (!order) return;

  await shopServiceClient.from('orders').update({ status: 'refunded' }).eq('id', order.id);

  // Revoke download access
  const { data: items } = await shopServiceClient
    .from('order_items')
    .select('id')
    .eq('order_id', order.id)
    .eq('is_digital', true);

  for (const item of items ?? []) {
    await shopServiceClient
      .from('digital_downloads')
      .update({ max_downloads: 0 })
      .eq('order_item_id', item.id);
  }
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('[webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature verification');
  }

  const rawBody = await req.arrayBuffer();

  let event: Stripe.Event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(Buffer.from(rawBody), sig, webhookSecret);
    } else {
      event = JSON.parse(new TextDecoder().decode(rawBody)) as Stripe.Event;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook signature verification failed';
    console.error('[webhook] Verification error:', msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await shopServiceClient
          .from('orders')
          .update({ status: 'paid' })
          .eq('stripe_payment_intent_id', pi.id)
          .eq('status', 'pending');
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await shopServiceClient
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('stripe_payment_intent_id', pi.id);
        break;
      }

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge);
        break;

      case 'charge.dispute.created':
        console.warn(
          '[webhook] Dispute created for charge:',
          (event.data.object as Stripe.Dispute).id
        );
        break;

      default:
        break;
    }
  } catch (handlerErr) {
    console.error(`[webhook] Handler error for ${event.type}:`, handlerErr);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
