// src/app/api/bookstore/checkout/route.ts
// Creates a Stripe Checkout Session from submitted cart items.
// Returns { url } — client redirects to Stripe-hosted checkout.
// TODO: fill STRIPE_SECRET_KEY and ensure SUPABASE_SHOP_* vars are set

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import type { CheckoutPayload, FormatType } from '@/lib/bookstore/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
});

const baseUrl =
  process.env.NEXT_PUBLIC_PRODUCTION_URL ??
  process.env.NEXT_PUBLIC_DEVELOPMENT_URL ??
  'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = (await req.json()) as CheckoutPayload;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate all items have a stripePriceId
    for (const item of body.items) {
      if (!item.stripePriceId) {
        return NextResponse.json(
          { error: `Item "${item.title}" is missing a Stripe Price ID` },
          { status: 400 }
        );
      }
    }

    const hasPhysical = body.items.some((i) => i.formatType !== 'digital');
    const hasDigital = body.items.some((i) => i.isDigital);

    const lineItems = body.items.map((item) => ({
      price: item.stripePriceId,
      quantity: item.quantity,
    }));

    // Build per-item metadata for the webhook handler
    const itemsMeta = body.items.map((item) => ({
      bookId: item.sanityBookId,
      formatType: item.formatType as FormatType,
      formatKey: item.formatKey,
      isDigital: item.isDigital,
      qty: item.quantity,
      title: item.title,
      priceId: item.stripePriceId,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${baseUrl}/bookstore/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/bookstore/cart`,
      // Collect shipping for physical items
      ...(hasPhysical && {
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB'],
        },
      }),
      metadata: {
        clerk_user_id: userId ?? '',
        has_digital: String(hasDigital),
        has_physical: String(hasPhysical),
        items_json: JSON.stringify(itemsMeta).slice(0, 500), // Stripe metadata limit is 500 chars per value
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout session creation failed';
    console.error('[shop/checkout]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
