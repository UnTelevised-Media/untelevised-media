// src/app/api/membership/one-time-donation/route.ts
// Creates a Stripe Checkout Session for a one-time NYOP donation.
// Uses the membership Stripe project (STRIPE_MEMBERSHIP_SECRET_KEY).
// Minimum donation: $5.00 (500 cents).

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_MEMBERSHIP_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
});

const BASE_URL =
  process.env.NEXT_PUBLIC_PRODUCTION_URL ??
  process.env.NEXT_PUBLIC_DEVELOPMENT_URL ??
  'http://localhost:3000';

const MIN_CENTS = 500;

export async function POST(request: NextRequest) {
  try {
    const { amountCents } = (await request.json()) as { amountCents: number };

    if (!Number.isInteger(amountCents) || amountCents < MIN_CENTS) {
      return NextResponse.json({ error: 'Minimum donation is $5.00' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'One-Time Donation — UnTelevised Media',
              description: 'Supporting independent, uncensored journalism.',
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${BASE_URL}/support/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/support`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[one-time-donation]', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
