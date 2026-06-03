// src/app/api/membership/one-time-donation/route.ts
// Creates a Stripe Checkout Session for a one-time NYOP donation (min $5).
// Uses the membership Stripe project (STRIPE_MEMBERSHIP_SECRET_KEY).
//
// STRIPE_MEMBERSHIP_PRICE_DONATION — set to the prod_xxx or price_xxx ID of the
// "One-Time Donation" product in the membership Stripe dashboard.
// If a price_xxx is provided, the product is resolved from it automatically.
// If unset, falls back to an inline product_data definition.

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_MEMBERSHIP_SECRET_KEY ?? '', {
  apiVersion: '2026-05-27.dahlia',
});

const BASE_URL =
  process.env.NEXT_PUBLIC_PRODUCTION_URL ??
  process.env.NEXT_PUBLIC_DEVELOPMENT_URL ??
  'http://localhost:3000';

const MIN_CENTS = 500;

async function resolveDonationProductId(): Promise<string | null> {
  const id = process.env.STRIPE_MEMBERSHIP_PRICE_DONATION;
  if (!id) return null;
  if (id.startsWith('prod_')) return id;
  if (id.startsWith('price_')) {
    const price = await stripe.prices.retrieve(id);
    return typeof price.product === 'string' ? price.product : null;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { amountCents } = (await request.json()) as { amountCents: number };

    if (!Number.isInteger(amountCents) || amountCents < MIN_CENTS) {
      return NextResponse.json({ error: 'Minimum donation is $5.00' }, { status: 400 });
    }

    const productId = await resolveDonationProductId();

    const priceData = productId
      ? { currency: 'usd', product: productId, unit_amount: amountCents }
      : {
          currency: 'usd',
          product_data: {
            name: 'One-Time Donation — UnTelevised Media',
            description: 'Supporting independent, uncensored journalism.',
          },
          unit_amount: amountCents,
        };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price_data: priceData, quantity: 1 }],
      success_url: `${BASE_URL}/support/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/support`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[one-time-donation]', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
