import type { SanityBookFormat } from './types';

/**
 * Returns the Stripe identifier for a format used when building checkout payloads.
 * NYOP formats send a product ID (prod_xxx) so the checkout route can build
 * price_data with the buyer-entered amount. Fixed-price formats send a price ID.
 */
export function getStripeIdForFormat(format: SanityBookFormat): string | undefined {
  return format.nameYourPrice ? format.stripeProductId : format.stripePriceId;
}
