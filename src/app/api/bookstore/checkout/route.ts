// src/app/api/bookstore/checkout/route.ts
// Creates a Stripe Checkout Session from submitted cart items.
// Returns { url } — client redirects to Stripe-hosted checkout.
// TODO: fill STRIPE_SECRET_KEY and ensure SUPABASE_SHOP_* vars are set

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { createHash } from 'node:crypto';
import { auth } from '@clerk/nextjs/server';
import { client as sanityReadClient } from '@/lib/sanity/lib/client';
import type {
  CheckoutPayload,
  CheckoutLineItem,
  FormatType,
  GiftOptions,
} from '@/lib/bookstore/types';
import { checkCheckoutRate } from '@/lib/bookstore/ratelimit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
});

const baseUrl =
  process.env.NEXT_PUBLIC_PRODUCTION_URL ??
  process.env.NEXT_PUBLIC_DEVELOPMENT_URL ??
  'http://localhost:3000';

// ---------------------------------------------------------------------------
// Server-side price ID resolution — never trust the client's stripePriceId.
// We batch-fetch all referenced books from Sanity in one query, then validate
// each cart item against the authoritative data stored there.
// ---------------------------------------------------------------------------

interface SanityFormatSlot {
  _key: string;
  stripePriceId?: string;
  nameYourPrice?: boolean;
}

interface SanityBookPricing {
  _id: string;
  formats: SanityFormatSlot[];
  author?: { tipStripeProductId?: string };
}

async function fetchCanonicalPricing(
  items: CheckoutLineItem[]
): Promise<Map<string, SanityBookPricing>> {
  const bookIds = [...new Set(items.map((i) => i.sanityBookId))];

  const books: SanityBookPricing[] = await sanityReadClient.fetch(
    `*[_type == "book" && _id in $ids]{
      _id,
      "formats": formats[]{_key, stripePriceId, nameYourPrice},
      "author": author->{tipStripeProductId}
    }`,
    { ids: bookIds },
    // Bypass CDN so we always get the live price — not a cached value.
    { cache: 'no-store' }
  );

  return new Map(books.map((b) => [b._id, b]));
}

// Returns the canonical Stripe price/product ID for this item as stored in
// Sanity. Throws a descriptive error if the item cannot be found or priced.
function resolveCanonicalPriceId(
  item: CheckoutLineItem,
  bookMap: Map<string, SanityBookPricing>
): string {
  const book = bookMap.get(item.sanityBookId);
  if (!book) {
    throw new Error(`"${item.title}" was not found in the catalog`);
  }

  // Tip items use the author's Stripe product ID, not a format price ID.
  if (item.formatType === 'tip') {
    const tipProductId = book.author?.tipStripeProductId;
    if (!tipProductId) {
      throw new Error(`Tip payments are not configured for "${item.title}"`);
    }
    return tipProductId;
  }

  const format = book.formats?.find((f) => f._key === item.formatKey);
  if (!format) {
    throw new Error(`Format not available for "${item.title}"`);
  }

  if (!format.stripePriceId) {
    throw new Error(`"${item.title}" is not yet available for purchase`);
  }

  return format.stripePriceId;
}

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

    // Validate gift options if present
    const gift: GiftOptions | undefined = body.giftOptions;
    if (gift) {
      if (!gift.recipientEmail || !z.string().email().safeParse(gift.recipientEmail).success) {
        return NextResponse.json(
          { error: 'Valid recipient email required for gift' },
          { status: 400 }
        );
      }
    }

    // Validate NYOP minimum amounts before the Sanity round-trip
    for (const item of body.items) {
      if (item.isNyop) {
        if (!item.unitAmountCents || item.unitAmountCents < 50) {
          return NextResponse.json(
            { error: `"${item.title}": minimum payment is $0.50` },
            { status: 400 }
          );
        }
      }
    }

    // Filter out tips with no amount or zero amount before resolving prices
    const chargeableItems = body.items.filter(
      (i) => i.formatType !== 'tip' || (i.unitAmountCents != null && i.unitAmountCents > 0)
    );

    if (chargeableItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Resolve authoritative price IDs from Sanity — one batched query for all books.
    // This replaces the client-supplied stripePriceId with the server-authoritative value,
    // preventing price substitution attacks.
    let bookMap: Map<string, SanityBookPricing>;
    try {
      bookMap = await fetchCanonicalPricing(chargeableItems);
    } catch {
      return NextResponse.json({ error: 'Could not verify product catalog' }, { status: 503 });
    }

    // Resolve canonical IDs up front so any catalog errors surface before we
    // call Stripe, keeping the error surface clean and deterministic.
    const canonicalIds: string[] = [];
    for (const item of chargeableItems) {
      try {
        canonicalIds.push(resolveCanonicalPriceId(item, bookMap));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown catalog error';
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }

    const hasPhysical = chargeableItems.some(
      (i) => i.formatType === 'physical' || i.formatType === 'bundle'
    );
    const hasDigital = chargeableItems.some((i) => i.isDigital);

    const lineItems = await Promise.all(
      chargeableItems.map(async (item, idx) => {
        // Use the server-resolved canonical ID, not item.stripePriceId from the client.
        const canonicalId = canonicalIds[idx];

        // Tips and NYOP both use price_data: a Stripe product + user-entered amount
        if ((item.formatType === 'tip' || item.isNyop) && item.unitAmountCents) {
          // canonicalId may be a price_xxx (format slot) or prod_xxx (tip product).
          // Resolve down to a product ID for price_data.
          let productId = canonicalId;
          if (canonicalId.startsWith('price_')) {
            const price = await stripe.prices.retrieve(canonicalId);
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
            // Tips are always qty 1; NYOP respects the ordered quantity
            quantity: item.formatType === 'tip' ? 1 : item.quantity,
          };
        }

        return { price: canonicalId, quantity: item.quantity };
      })
    );

    // Build per-item metadata for the webhook handler.
    const itemsMeta = chargeableItems.map((item, idx) => ({
      bookId: item.sanityBookId,
      formatType: item.formatType as FormatType,
      formatKey: item.formatKey,
      isDigital: item.isDigital,
      qty: item.quantity,
      title: item.title,
      // Store the server-resolved canonical ID in metadata, not the client value.
      priceId: canonicalIds[idx],
      ...((item.formatType === 'tip' || item.isNyop) && item.unitAmountCents
        ? { unitAmountCents: item.unitAmountCents }
        : {}),
      ...(item.isNyop ? { isNyop: true } : {}),
    }));

    const idempotencyKey = createHash('sha256')
      .update(
        JSON.stringify({
          userId: userId ?? 'anon',
          items: chargeableItems
            .map((i) => ({
              id: i.sanityBookId,
              fmt: i.formatKey,
              qty: i.quantity,
              nyop: i.unitAmountCents,
            }))
            .sort((a, b) => `${a.id}:${a.fmt}`.localeCompare(`${b.id}:${b.fmt}`)),
        })
      )
      .digest('hex');

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        allow_promotion_codes: true,
        line_items: lineItems,
        ...(body.customerEmail && { customer_email: body.customerEmail }),
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
          ...(gift && {
            gift_recipient_email: gift.recipientEmail,
            gift_from_name: gift.fromName ?? '',
            gift_anonymous: String(gift.anonymous),
          }),
        },
      },
      { idempotencyKey }
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[shop/checkout]', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Unable to create checkout session. Please try again.' },
      { status: 500 }
    );
  }
}
