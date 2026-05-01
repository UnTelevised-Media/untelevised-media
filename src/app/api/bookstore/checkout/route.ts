// src/app/api/bookstore/checkout/route.ts
// Creates a Stripe Checkout Session from submitted cart items.
// Returns { url } — client redirects to Stripe-hosted checkout.
// TODO: fill STRIPE_SECRET_KEY and ensure SUPABASE_SHOP_* vars are set

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import type { CheckoutPayload, FormatType } from '@/lib/bookstore/types';
import { checkCheckoutRate } from '@/lib/bookstore/ratelimit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
});

const baseUrl =
  process.env.NEXT_PUBLIC_PRODUCTION_URL ??
  process.env.NEXT_PUBLIC_DEVELOPMENT_URL ??
  'http://localhost:3000';

export async function POST(req: NextRequest) {
  const rl = await checkCheckoutRate(req);
  if (rl.limited) {
    return NextResponse.json(
      { error: 'Too many requests — please wait a moment' },
      { status: 429 }
    );
  }

  try {
    const { userId } = await auth();
    const body = (await req.json()) as CheckoutPayload;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate non-tip items have a stripePriceId
    for (const item of body.items) {
      if (item.formatType !== 'tip' && !item.stripePriceId) {
        return NextResponse.json(
          { error: `Item "${item.title}" is missing a Stripe Price ID` },
          { status: 400 }
        );
      }
    }

    // Filter out tips with no amount or zero amount
    const chargeableItems = body.items.filter(
      (i) => i.formatType !== 'tip' || (i.unitAmountCents != null && i.unitAmountCents > 0)
    );

    if (chargeableItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const hasPhysical = chargeableItems.some(
      (i) => i.formatType === 'physical' || i.formatType === 'bundle'
    );
    const hasDigital = chargeableItems.some((i) => i.isDigital);

    const keyPrefix = (process.env.STRIPE_SECRET_KEY ?? '').slice(0, 14);
    console.log(
      '[shop/checkout] key prefix:',
      keyPrefix,
      '| items:',
      JSON.stringify(
        chargeableItems.map((i) => ({
          title: i.title,
          priceId: i.stripePriceId,
          type: i.formatType,
        }))
      )
    );

    const lineItems = await Promise.all(
      chargeableItems.map(async (item) => {
        const storedId = item.stripePriceId.trim();

        if (item.formatType === 'tip' && item.unitAmountCents) {
          // Resolve to a Product ID — Sanity may store either prod_xxx or price_xxx
          let productId = storedId;
          if (storedId.startsWith('price_')) {
            const price = await stripe.prices.retrieve(storedId);
            productId =
              typeof price.product === 'string'
                ? price.product
                : (price.product as { id: string }).id;
          }
          return {
            price_data: {
              currency: 'usd',
              product: productId,
              unit_amount: item.unitAmountCents,
            },
            quantity: 1,
          };
        }

        return { price: storedId, quantity: item.quantity };
      })
    );

    // Build per-item metadata for the webhook handler
    const itemsMeta = chargeableItems.map((item) => ({
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
        items_json: JSON.stringify(itemsMeta), // Stripe limit is 500 chars per key; cart is validated to be short
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout session creation failed';
    console.error('[shop/checkout]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
