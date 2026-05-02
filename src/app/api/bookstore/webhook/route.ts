// src/app/api/bookstore/webhook/route.ts
// Stripe webhook endpoint. Verifies signature, routes events to handlers.
// Register this URL in Stripe Dashboard → Developers → Webhooks.
// STRIPE_WEBHOOK_SECRET must be set after registration.
//
// All Supabase writes use shopServiceClient (service role) — never anon from client.

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { shopServiceClient, writeAuditLog } from '@/lib/bookstore/supabase';
import sanityClient from '@/lib/sanity/lib/client';
import type { FormatType } from '@/lib/bookstore/types';
import {
  sendOrderConfirmationEmail,
  sendDigitalDownloadEmail,
  sendGuestDownloadEmail,
} from '@/lib/bookstore/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
});

const baseUrl =
  process.env.NEXT_PUBLIC_PRODUCTION_URL ??
  process.env.NEXT_PUBLIC_DEVELOPMENT_URL ??
  'http://localhost:3000';

// ---------------------------------------------------------------------------
// Customer helpers
// ---------------------------------------------------------------------------

async function upsertAuthenticatedCustomer(clerkUserId: string, email: string, name?: string) {
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

async function upsertGuestCustomer(email: string, name?: string): Promise<string> {
  // Guests don't have a Clerk ID. Look up by email first so repeat purchases merge.
  const { data: existing } = await shopServiceClient
    .from('customers')
    .select('id')
    .is('clerk_user_id', null)
    .eq('email', email)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await shopServiceClient
    .from('customers')
    .insert({ clerk_user_id: null, email, full_name: name ?? null })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create guest customer: ${error.message}`);
  return data.id;
}

async function generateOrderNumber(): Promise<string> {
  const { count } = await shopServiceClient
    .from('orders')
    .select('*', { count: 'exact', head: true });
  const num = String((count ?? 0) + 1).padStart(5, '0');
  return `UM-${num}`;
}

// ---------------------------------------------------------------------------
// Shipping address capture
// ---------------------------------------------------------------------------

type ShippingDetails = NonNullable<
  NonNullable<Stripe.Checkout.Session['collected_information']>['shipping_details']
>;

async function upsertShippingAddress(
  shippingDetails: ShippingDetails,
  customerId: string | null,
  guestEmail: string | null
): Promise<string | null> {
  const addr = shippingDetails.address;
  if (!addr?.line1) return null;

  const row = {
    customer_id: customerId,
    guest_email: guestEmail,
    label: 'Shipping',
    line1: addr.line1,
    line2: addr.line2 ?? null,
    city: addr.city ?? '',
    state: addr.state ?? '',
    postal_code: addr.postal_code ?? '',
    country: addr.country ?? 'US',
    is_default: false,
  };

  const { data, error } = await shopServiceClient
    .from('addresses')
    .insert(row)
    .select('id')
    .single();

  if (error) {
    console.error('[webhook] Failed to store shipping address:', error.message);
    return null;
  }
  return data.id;
}

// ---------------------------------------------------------------------------
// Revenue split helper
// ---------------------------------------------------------------------------

interface RevenueTerms {
  authorPercentage?: number;
  publisherPercentage?: number;
  platformPercentage?: number;
}

interface AuthorSaleInput {
  orderItemId: string;
  orderId: string;
  sanityBookId: string;
  authorClerkId: string | null;
  grossCents: number;
  revenueTerms: RevenueTerms | null;
  isTip: boolean;
}

async function insertAuthorSale(input: AuthorSaleInput) {
  let authorPct = 70; // sane defaults if no terms configured
  let platformPct = 15;
  let publisherPct = 15;

  if (input.isTip) {
    // Tips go 100% to the author
    authorPct = 100;
    platformPct = 0;
    publisherPct = 0;
  } else if (input.revenueTerms) {
    authorPct = input.revenueTerms.authorPercentage ?? 70;
    platformPct = input.revenueTerms.platformPercentage ?? 15;
    publisherPct = input.revenueTerms.publisherPercentage ?? 15;
  }

  const authorCents = Math.round(input.grossCents * (authorPct / 100));
  const platformCents = Math.round(input.grossCents * (platformPct / 100));
  // Publisher gets the remainder to avoid rounding drift
  const publisherCents = input.grossCents - authorCents - platformCents;

  const { error } = await shopServiceClient.from('author_sales').insert({
    order_item_id: input.orderItemId,
    order_id: input.orderId,
    sanity_book_id: input.sanityBookId,
    author_clerk_id: input.authorClerkId,
    gross_cents: input.grossCents,
    author_cents: authorCents,
    platform_cents: platformCents,
    publisher_cents: publisherCents,
    is_tip: input.isTip,
  });

  if (error) {
    console.error('[webhook] Failed to insert author_sale:', error.message);
  }
}

// ---------------------------------------------------------------------------
// Main checkout handler
// ---------------------------------------------------------------------------

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
  const clerkUserId = session.metadata?.clerk_user_id || null;
  const customerEmail = session.customer_details?.email ?? '';
  const customerName = session.customer_details?.name ?? undefined;

  if (!customerEmail) {
    console.error('[webhook] checkout.session.completed — no customer email');
    return;
  }

  // Upsert customer (authenticated or guest)
  let customerId: string | null = null;
  try {
    if (clerkUserId) {
      customerId = await upsertAuthenticatedCustomer(clerkUserId, customerEmail, customerName);
    } else {
      customerId = await upsertGuestCustomer(customerEmail, customerName);
    }
  } catch (err) {
    console.error('[webhook] Customer upsert failed:', err);
    // Continue — order can still be created without a customer record
  }

  // Parse items metadata from session
  let items: ItemMeta[] = [];
  try {
    items = JSON.parse(session.metadata?.items_json ?? '[]') as ItemMeta[];
  } catch {
    console.error('[webhook] Failed to parse items_json from session metadata');
  }

  // Retrieve full session with line_items expanded for accurate per-item pricing
  let expandedSession: Stripe.Checkout.Session = session;
  try {
    expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items'],
    });
  } catch (err) {
    console.error(
      '[webhook] Failed to expand line_items — falling back to metadata pricing:',
      err
    );
  }

  const stripeLineItems = expandedSession.line_items?.data ?? [];

  // Build a price-id → amount_total map for accurate unit pricing
  const priceAmountMap = new Map<string, number>();
  for (const li of stripeLineItems) {
    const priceId = typeof li.price?.id === 'string' ? li.price.id : null;
    if (priceId) {
      priceAmountMap.set(priceId, li.amount_total ?? 0);
    }
  }

  // Capture shipping address if present (populated by shipping_address_collection on session)
  let shippingAddressId: string | null = null;
  const shippingDetails = expandedSession.collected_information?.shipping_details;
  if (shippingDetails) {
    shippingAddressId = await upsertShippingAddress(
      shippingDetails,
      customerId,
      clerkUserId ? null : customerEmail
    );
  }

  // Create order
  const orderNumber = await generateOrderNumber();
  const totalCents = session.amount_total ?? 0;
  const shippingCents = session.shipping_cost?.amount_total ?? 0;
  const taxCents = session.total_details?.amount_tax ?? 0;
  const subtotalCents = totalCents - shippingCents - taxCents;

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
      tax_cents: taxCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
      currency: session.currency ?? 'usd',
      shipping_address_id: shippingAddressId,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('[webhook] Failed to create order:', orderError?.message);
    return;
  }

  // Fetch Sanity revenue terms and author info for all books in one query
  const uniqueBookIds = [...new Set(items.map((i) => i.bookId))];
  const bookData = await sanityClient.fetch<
    Array<{
      _id: string;
      revenueTerms: RevenueTerms | null;
      author: { clerkId: string | null } | null;
    }>
  >(
    `*[_type == "book" && _id in $bookIds]{
      _id,
      revenueTerms,
      "author": author->{clerkId}
    }`,
    { bookIds: uniqueBookIds }
  );

  const bookInfoMap = new Map(bookData.map((b) => [b._id, b]));

  // Create order items with accurate per-item pricing
  const orderItemInserts = items.map((item) => {
    // Use Stripe's reported amount for the matching price ID when available
    const stripeItemTotal = priceAmountMap.get(item.priceId) ?? null;
    // Fall back: pro-rata from session total if line item lookup misses (e.g. tips use price_data)
    const unitPriceCents =
      stripeItemTotal != null
        ? Math.round(stripeItemTotal / Math.max(item.qty, 1))
        : Math.round(totalCents / Math.max(items.length, 1));

    return {
      order_id: order.id,
      sanity_book_id: item.bookId,
      sanity_format_type: item.formatType,
      book_title: item.title,
      format_label: item.formatType.charAt(0).toUpperCase() + item.formatType.slice(1),
      unit_price_cents: unitPriceCents,
      quantity: item.qty,
      stripe_price_id: item.priceId,
      is_digital: item.isDigital,
      download_fulfilled: false,
    };
  });

  const { data: createdItems, error: itemsError } = await shopServiceClient
    .from('order_items')
    .insert(orderItemInserts)
    .select();

  if (itemsError) {
    console.error('[webhook] Failed to create order items:', itemsError.message);
    return;
  }

  // Author sales + digital fulfillment
  const guestDownloadLinks: Array<{ bookTitle: string; downloadUrl: string }> = [];

  for (let idx = 0; idx < (createdItems ?? []).length; idx++) {
    const createdItem = createdItems![idx];
    const meta = items[idx];
    if (!meta) continue;

    const bookInfo = bookInfoMap.get(meta.bookId) ?? null;
    const authorClerkId = bookInfo?.author?.clerkId ?? null;
    const revenueTerms = bookInfo?.revenueTerms ?? null;
    const isTip = meta.formatType === 'tip';

    // Revenue split
    const grossCents = createdItem.unit_price_cents * createdItem.quantity;
    await insertAuthorSale({
      orderItemId: createdItem.id,
      orderId: order.id,
      sanityBookId: meta.bookId,
      authorClerkId,
      grossCents,
      revenueTerms,
      isTip,
    });

    // Digital fulfillment (skip tip items — they have no file)
    if (!meta.isDigital || isTip) continue;

    const storagePath: string =
      (await sanityClient.fetch(
        `*[_type == "book" && _id == $bookId][0].formats[_key == $formatKey][0].digitalAsset.supabaseStoragePath`,
        { bookId: meta.bookId, formatKey: meta.formatKey }
      )) ?? '';

    if (!storagePath) {
      console.warn(`[webhook] No storage path for book ${meta.bookId} format ${meta.formatKey}`);
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    if (customerId && clerkUserId) {
      // Authenticated user — persistent download record
      const { error: dlError } = await shopServiceClient.from('digital_downloads').insert({
        order_item_id: createdItem.id,
        customer_id: customerId,
        supabase_storage_path: storagePath,
        download_count: 0,
        max_downloads: 5,
        expires_at: expiresAt.toISOString(),
      });
      if (dlError) {
        console.error('[webhook] Failed to create digital_download:', dlError.message);
      }
    } else if (storagePath) {
      // Guest or auth user without storage path — single-use token, 14-day expiry
      const guestExpiry = new Date();
      guestExpiry.setDate(guestExpiry.getDate() + 14);

      const token = crypto.randomUUID();
      const { error: tokenError } = await shopServiceClient.from('guest_download_tokens').insert({
        order_id: order.id,
        book_title: meta.title,
        format_label: meta.formatType,
        supabase_storage_path: storagePath,
        guest_email: customerEmail,
        token,
        max_downloads: 1,
        expires_at: guestExpiry.toISOString(),
      });

      if (tokenError) {
        console.error('[webhook] Failed to create guest download token:', tokenError.message);
      } else {
        const downloadUrl = `${baseUrl}/api/bookstore/download/guest?token=${token}`;
        guestDownloadLinks.push({ bookTitle: meta.title, downloadUrl });
      }
    }

    await shopServiceClient
      .from('order_items')
      .update({ download_fulfilled: true })
      .eq('id', createdItem.id);
  }

  // Audit log
  void writeAuditLog({
    eventType: 'payment_success',
    userId: clerkUserId ?? undefined,
    orderId: order.id,
    details: {
      orderNumber,
      customerEmail,
      totalCents,
      digitalItemCount: items.filter((i) => i.isDigital).length,
    },
  });

  // Emails
  const hasDigitalItems = items.some((i) => i.isDigital && i.formatType !== 'tip');

  try {
    await sendOrderConfirmationEmail({
      to: customerEmail,
      orderNumber,
      items: items.map((i) => ({ title: i.title, formatType: i.formatType, qty: i.qty })),
      totalCents,
    });

    if (clerkUserId && customerId && hasDigitalItems) {
      await sendDigitalDownloadEmail({ to: customerEmail, orderNumber });
    }

    for (const guestLink of guestDownloadLinks) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);
      await sendGuestDownloadEmail({
        to: customerEmail,
        orderNumber,
        bookTitle: guestLink.bookTitle,
        downloadUrl: guestLink.downloadUrl,
        expiresAt,
      });
    }
  } catch (emailErr) {
    console.error('[webhook] Email send failed:', emailErr);
  }
}

// ---------------------------------------------------------------------------
// Refund handler
// ---------------------------------------------------------------------------

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

  // Revoke digital download access
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

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

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
