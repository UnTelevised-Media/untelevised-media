// src/app/api/membership/create-checkout/route.ts
// Creates a Stripe Checkout Session for a membership subscription.
// Uses the membership Stripe project (STRIPE_MEMBERSHIP_SECRET_KEY) —
// entirely separate from the bookstore Stripe project (STRIPE_SECRET_KEY).

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_MEMBERSHIP_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
});

const PRICE_MAP: Record<string, string | undefined> = {
  supporter: process.env.STRIPE_MEMBERSHIP_PRICE_SUPPORTER,
  contributor: process.env.STRIPE_MEMBERSHIP_PRICE_CONTRIBUTOR,
  patron: process.env.STRIPE_MEMBERSHIP_PRICE_PATRON,
};

const BASE_URL =
  process.env.NEXT_PUBLIC_PRODUCTION_URL ??
  process.env.NEXT_PUBLIC_DEVELOPMENT_URL ??
  'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { tier } = (await request.json()) as { tier: string };

    const priceId = PRICE_MAP[tier];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid membership tier' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${BASE_URL}/join/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/join`,
      allow_promotion_codes: true,
      metadata: {
        tier,
        // Pass the Clerk user ID so the Edge Function can link the subscription
        // back to the Clerk identity. Empty string for guest checkouts.
        clerk_user_id: userId ?? '',
      },
      subscription_data: {
        metadata: { tier, clerk_user_id: userId ?? '' },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[membership/create-checkout]', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
