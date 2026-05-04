// supabase/functions/stripe-webhook/index.ts
// Stripe webhook handler — runs as a Supabase Edge Function (Deno).
// Stripe → this function → Supabase writes + Next.js email API.
//
// Register URL in Stripe Dashboard: https://<project>.supabase.co/functions/v1/stripe-webhook
//
// Required secrets (set via `supabase secrets set`):
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   SANITY_PROJECT_ID
//   SANITY_DATASET          (default: production)
//   SITE_URL                (e.g. https://www.untelevised.media)
//   INTERNAL_EMAIL_SECRET   (shared secret for Next.js /api/bookstore/internal/send-email)
//
// Auto-injected by Supabase runtime:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import Stripe from 'npm:stripe@^22.1.0';
import { createClient } from 'npm:@supabase/supabase-js@^2';

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

function env(key: string, fallback = ''): string {
  return Deno.env.get(key) ?? fallback;
}

const stripe = new Stripe(env('STRIPE_SECRET_KEY'), {
  apiVersion: '2026-04-22.dahlia' as Stripe.LatestApiVersion,
  httpClient: Stripe.createFetchHttpClient(),
});

// Deno uses Web Crypto API — must use SubtleCryptoProvider for webhook verification.
// Without this, constructEventAsync computes the wrong HMAC and always rejects.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

function supabase() {
  return createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
}

const siteUrl = env('SITE_URL', 'https://www.untelevised.media');
const sanityProjectId = env('SANITY_PROJECT_ID');
const sanityDataset = env('SANITY_DATASET', 'production');
const sanityReadToken = env('SANITY_API_READ_TOKEN');
const internalEmailSecret = env('INTERNAL_EMAIL_SECRET');
// Internal test promo: when used, log original prices to author_sales (not $0)
const testPromoCodeId = env('TEST_PROMO_CODE_ID');

// ---------------------------------------------------------------------------
// Sanity HTTP helper — no npm dependency
// ---------------------------------------------------------------------------

async function sanityFetch<T>(groq: string, params: Record<string, unknown> = {}): Promise<T> {
  const encodedQuery = encodeURIComponent(groq);
  const queryString = Object.entries(params)
    .map(([k, v]) => `$${k}=${encodeURIComponent(JSON.stringify(v))}`)
    .join('&');
  const url = `https://${sanityProjectId}.apicdn.sanity.io/v2021-10-21/data/query/${sanityDataset}?query=${encodedQuery}${queryString ? `&${queryString}` : ''}`;
  const headers: Record<string, string> = {};
  if (sanityReadToken) headers['Authorization'] = `Bearer ${sanityReadToken}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Sanity fetch failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { result: T };
  return json.result;
}

// ---------------------------------------------------------------------------
// Email — calls Next.js internal route
// ---------------------------------------------------------------------------

type EmailPayload =
  | {
      type: 'order-confirmation';
      to: string;
      orderNumber: string;
      items: Array<{ title: string; formatType: string; qty: number; unitPriceCents: number }>;
      subtotalCents: number;
      shippingCents: number;
      taxCents: number;
      totalCents: number;
      shippingAddress?: {
        line1: string;
        line2?: string | null;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      } | null;
      hasDigital: boolean;
    }
  | {
      type: 'digital-download';
      to: string;
      orderNumber: string;
      items: Array<{
        title: string;
        formatLabel: string;
        orderItemId: string;
        storagePath: string;
      }>;
    }
  | {
      type: 'guest-download';
      to: string;
      orderNumber: string;
      bookTitle: string;
      downloadUrl: string;
      expiresAt: string;
      storagePath?: string;
    }
  | {
      type: 'refund';
      to: string;
      orderNumber: string;
    };

async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!internalEmailSecret) {
    console.warn('[webhook] INTERNAL_EMAIL_SECRET not set — skipping email');
    return;
  }
  try {
    const res = await fetch(`${siteUrl}/api/bookstore/internal/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${internalEmailSecret}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('[webhook] Email API returned', res.status, await res.text());
    }
  } catch (err) {
    console.error('[webhook] Failed to call email API:', err);
  }
}

// ---------------------------------------------------------------------------
// Customer helpers
// ---------------------------------------------------------------------------

async function upsertAuthenticatedCustomer(
  db: ReturnType<typeof supabase>,
  clerkUserId: string,
  email: string,
  name?: string
): Promise<string> {
  const { data: existing } = await db
    .from('customers')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data, error } = await db
    .from('customers')
    .insert({ clerk_user_id: clerkUserId, email, full_name: name ?? null })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create customer: ${error.message}`);
  return (data as { id: string }).id;
}

async function upsertGuestCustomer(
  db: ReturnType<typeof supabase>,
  email: string,
  name?: string
): Promise<string> {
  const { data: existing } = await db
    .from('customers')
    .select('id')
    .is('clerk_user_id', null)
    .eq('email', email)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data, error } = await db
    .from('customers')
    .insert({ clerk_user_id: null, email, full_name: name ?? null })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create guest customer: ${error.message}`);
  return (data as { id: string }).id;
}

async function generateOrderNumber(db: ReturnType<typeof supabase>): Promise<string> {
  const { count } = await db.from('orders').select('*', { count: 'exact', head: true });
  const num = String(((count as number) ?? 0) + 1).padStart(5, '0');
  return `UM-${num}`;
}

// ---------------------------------------------------------------------------
// Shipping address
// ---------------------------------------------------------------------------

async function upsertShippingAddress(
  db: ReturnType<typeof supabase>,
  addr: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  },
  customerId: string | null,
  guestEmail: string | null
): Promise<string | null> {
  if (!addr.line1) return null;

  const { data, error } = await db
    .from('addresses')
    .insert({
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
    })
    .select('id')
    .single();

  if (error) {
    console.error('[webhook] Failed to store shipping address:', error.message);
    return null;
  }
  return (data as { id: string }).id;
}

// ---------------------------------------------------------------------------
// Revenue split
// ---------------------------------------------------------------------------

interface RevenueTerms {
  authorPercentage?: number;
  publisherPercentage?: number;
  platformPercentage?: number;
}

// Returns the inserted author_sale id (needed to link author_earnings), or null on failure.
async function insertAuthorSale(
  db: ReturnType<typeof supabase>,
  opts: {
    orderItemId: string;
    orderId: string;
    sanityBookId: string;
    authorClerkId: string | null;
    grossCents: number;
    revenueTerms: RevenueTerms | null;
    isTip: boolean;
  }
): Promise<string | null> {
  let authorPct = 70;
  let platformPct = 15;
  let publisherPct = 15;

  if (opts.isTip) {
    authorPct = 100;
    platformPct = 0;
    publisherPct = 0;
  } else if (opts.revenueTerms) {
    authorPct = opts.revenueTerms.authorPercentage ?? 70;
    platformPct = opts.revenueTerms.platformPercentage ?? 15;
    publisherPct = opts.revenueTerms.publisherPercentage ?? 15;
  }

  const authorCents = Math.round(opts.grossCents * (authorPct / 100));
  const platformCents = Math.round(opts.grossCents * (platformPct / 100));
  const publisherCents = opts.grossCents - authorCents - platformCents;

  const { data, error } = await db
    .from('author_sales')
    .insert({
      order_item_id: opts.orderItemId,
      order_id: opts.orderId,
      sanity_book_id: opts.sanityBookId,
      author_clerk_id: opts.authorClerkId,
      gross_cents: opts.grossCents,
      author_cents: authorCents,
      platform_cents: platformCents,
      publisher_cents: publisherCents,
      is_tip: opts.isTip,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[webhook] author_sale insert failed:', error.message);
    return null;
  }
  return (data as { id: string }).id;
}

// ---------------------------------------------------------------------------
// Stripe fee helpers
// ---------------------------------------------------------------------------

// Returns the actual Stripe processing fee in cents from the balance transaction.
// Handles all card types (domestic, international, corporate) automatically.
// Non-fatal: returns 0 on failure so the order write still succeeds.
async function fetchStripeFee(paymentIntentId: string): Promise<number> {
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge.balance_transaction'],
    });
    const charge = pi.latest_charge as Stripe.Charge | null;
    if (!charge) return 0;
    const balTx = charge.balance_transaction as Stripe.BalanceTransaction | null;
    if (!balTx) return 0;
    console.log('[webhook] stripe fee breakdown:', JSON.stringify(balTx.fee_details));
    return balTx.fee;
  } catch (err) {
    console.error('[webhook] fetchStripeFee failed (fee recorded as 0):', err);
    return 0;
  }
}

// Distributes orderStripeFee across items proportionally by gross amount.
// Guarantees sum(result) === orderStripeFee exactly (remainder on largest item).
function distributeStripeFee(
  orderStripeFee: number,
  items: Array<{ grossCents: number }>
): number[] {
  if (items.length === 0 || orderStripeFee === 0) return items.map(() => 0);
  const totalGross = items.reduce((s, i) => s + i.grossCents, 0);
  if (totalGross === 0) return items.map(() => 0);

  const fees = items.map((i) => Math.round(orderStripeFee * (i.grossCents / totalGross)));
  const allocated = fees.reduce((s, f) => s + f, 0);
  const remainder = orderStripeFee - allocated;
  if (remainder !== 0) {
    const largestIdx = items.reduce(
      (maxIdx, item, idx, arr) => (item.grossCents > arr[maxIdx].grossCents ? idx : maxIdx),
      0
    );
    fees[largestIdx] += remainder;
  }
  return fees;
}

// Returns the bi-monthly payout period containing the given date.
// Periods: 1st-15th (pays out 16th) and 16th-last day (pays out 1st of next month).
function getPayoutPeriod(date: Date): { start: string; end: string } {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = date.getUTCDate();
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
  ).getUTCDate();
  if (d <= 15) {
    return { start: `${y}-${m}-01`, end: `${y}-${m}-15` };
  }
  return { start: `${y}-${m}-16`, end: `${y}-${m}-${lastDay}` };
}

// Inserts one author_earnings row for a single order item.
// Splits are applied to net_after_stripe_cents (not gross).
async function insertAuthorEarning(
  db: ReturnType<typeof supabase>,
  opts: {
    authorSaleId: string;
    orderItemId: string;
    orderId: string;
    sanityBookId: string;
    authorClerkId: string | null;
    grossCents: number;
    itemStripeFee: number;
    revenueTerms: RevenueTerms | null;
    isTip: boolean;
    saleDate: Date;
  }
): Promise<void> {
  const net = opts.grossCents - opts.itemStripeFee;

  let authorPct = 70,
    platformPct = 15,
    publisherPct = 15;
  if (opts.isTip) {
    authorPct = 100;
    platformPct = 0;
    publisherPct = 0;
  } else if (opts.revenueTerms) {
    authorPct = opts.revenueTerms.authorPercentage ?? 70;
    platformPct = opts.revenueTerms.platformPercentage ?? 15;
    publisherPct = opts.revenueTerms.publisherPercentage ?? 15;
  }

  const authorCents = Math.round(net * (authorPct / 100));
  const platformCents = Math.round(net * (platformPct / 100));
  const publisherCents = net - authorCents - platformCents;

  const { start, end } = getPayoutPeriod(opts.saleDate);

  const { error } = await db.from('author_earnings').insert({
    author_sale_id: opts.authorSaleId,
    order_item_id: opts.orderItemId,
    order_id: opts.orderId,
    sanity_book_id: opts.sanityBookId,
    author_clerk_id: opts.authorClerkId,
    gross_cents: opts.grossCents,
    stripe_fee_cents: opts.itemStripeFee,
    net_after_stripe_cents: net,
    author_cents: authorCents,
    platform_cents: platformCents,
    publisher_cents: publisherCents,
    is_tip: opts.isTip,
    payout_period_start: start,
    payout_period_end: end,
  });

  if (error) console.error('[webhook] author_earning insert failed:', error.message);
}

// ---------------------------------------------------------------------------
// Main event handler
// ---------------------------------------------------------------------------

interface ItemMeta {
  bookId: string;
  formatType: string;
  formatKey: string;
  isDigital: boolean;
  qty: number;
  title: string;
  priceId: string;
  unitAmountCents?: number; // tips only — user-entered amount stored at checkout time
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const db = supabase();
  const clerkUserId = session.metadata?.clerk_user_id || null;
  const customerEmail = session.customer_details?.email ?? '';
  const customerName = session.customer_details?.name ?? undefined;

  if (!customerEmail) {
    console.error('[webhook] No customer email on session', session.id);
    return;
  }

  // 1. Upsert customer
  let customerId: string | null = null;
  try {
    customerId = clerkUserId
      ? await upsertAuthenticatedCustomer(db, clerkUserId, customerEmail, customerName)
      : await upsertGuestCustomer(db, customerEmail, customerName);
  } catch (err) {
    console.error('[webhook] Customer upsert failed:', err);
  }

  // 2. Parse cart metadata
  let items: ItemMeta[] = [];
  try {
    items = JSON.parse(session.metadata?.items_json ?? '[]') as ItemMeta[];
  } catch {
    console.error('[webhook] Failed to parse items_json');
  }

  // 3. Expand line_items for accurate per-item pricing
  let expandedSession = session;
  try {
    expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items'],
    });
  } catch (err) {
    console.error('[webhook] line_items expand failed, using session totals:', err);
  }

  // Two maps keyed by price_id or product_id:
  //   pricePaidMap     — amount_total (post-discount, what customer actually paid)
  //   priceOriginalMap — amount_subtotal (pre-discount, original list price)
  const pricePaidMap = new Map<string, number>();
  const priceOriginalMap = new Map<string, number>();
  for (const li of expandedSession.line_items?.data ?? []) {
    const keys: string[] = [];
    if (li.price?.id) keys.push(li.price.id);
    // Tips use price_data so li.price.id is ephemeral — also index by product ID
    const prod = li.price?.product;
    if (typeof prod === 'string') keys.push(prod);
    for (const key of keys) {
      pricePaidMap.set(key, li.amount_total ?? 0);
      priceOriginalMap.set(key, li.amount_subtotal ?? li.amount_total ?? 0);
    }
  }

  // Detect internal test promo — log original list prices to author_sales, not $0
  const isTestPromo =
    testPromoCodeId !== '' &&
    (session.discounts ?? []).some((d) => {
      const pc = d.promotion_code;
      return (
        (typeof pc === 'string' ? pc : (pc as { id?: string } | null)?.id) === testPromoCodeId
      );
    });

  if (isTestPromo) {
    console.log('[webhook] Test promo detected — author_sales will use original list prices');
  }

  // 4. Capture shipping address
  let shippingAddressId: string | null = null;
  const shippingAddr = expandedSession.collected_information?.shipping_details?.address;
  if (shippingAddr) {
    shippingAddressId = await upsertShippingAddress(
      db,
      shippingAddr,
      customerId,
      clerkUserId ? null : customerEmail
    );
  }

  // 5. Create order
  const orderNumber = await generateOrderNumber(db);
  const shippingCents = session.shipping_cost?.amount_total ?? 0;
  const taxCents = session.total_details?.amount_tax ?? 0;
  // Test promo applies 100% discount → amount_total = 0. Record original list prices instead
  // so the portal and order history show meaningful amounts rather than $0.
  const rawTotalCents = session.amount_total ?? 0;
  const totalCents =
    isTestPromo && rawTotalCents === 0 ? (session.amount_subtotal ?? 0) : rawTotalCents;
  const subtotalCents = totalCents - shippingCents - taxCents;

  // 5b. Fetch actual Stripe fee from balance transaction (handles domestic + international cards)
  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : null;
  const orderStripeFee =
    paymentIntentId && !isTestPromo ? await fetchStripeFee(paymentIntentId) : 0;

  const { data: order, error: orderError } = await db
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: customerId,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      status: 'paid',
      subtotal_cents: subtotalCents,
      tax_cents: taxCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
      stripe_fee_cents: orderStripeFee,
      currency: session.currency ?? 'usd',
      shipping_address_id: shippingAddressId,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('[webhook] Order insert failed:', orderError?.message);
    return;
  }

  const orderId = (order as { id: string }).id;

  // 6. Batch-fetch Sanity book data (revenue terms + author clerk ID + storage paths)
  const uniqueBookIds = [...new Set(items.map((i) => i.bookId))];
  interface SanityBookData {
    _id: string;
    revenueTerms: RevenueTerms | null;
    author: { clerkId: string | null; payoutEmail: string | null } | null;
    formats: Array<{ _key: string; digitalAsset?: { supabaseStoragePath?: string } }>;
  }
  const bookData = await sanityFetch<SanityBookData[]>(
    `*[_type == "book" && _id in $bookIds]{
      _id,
      revenueTerms{ authorPercentage, publisherPercentage, platformPercentage },
      "author": author->{ clerkId, payoutEmail },
      formats[]{ _key, digitalAsset{ supabaseStoragePath } }
    }`,
    { bookIds: uniqueBookIds }
  ).catch((err) => {
    console.error('[webhook] Sanity fetch failed:', err);
    return [] as SanityBookData[];
  });

  const bookMap = new Map(bookData.map((b) => [b._id, b]));

  // 7. Create order_items
  // unit_price_cents:
  //   - tips always use the user-entered amount from metadata (price_data = ephemeral price ID,
  //     so pricePaidMap lookup would fail)
  //   - non-tips: paid amount for real orders, original list price for the internal test promo
  //   - fallback for non-tips: spread (subtotal - known tip amounts) across non-tip qty so a
  //     tip in a mixed order never inflates the book price

  // Pre-compute: tip amounts we know from metadata (needed for fallback)
  const metaTipCents = items
    .filter((i) => i.formatType === 'tip')
    .reduce((s, i) => s + (i.unitAmountCents ?? 0), 0);
  const nonTipTotalQty = items
    .filter((i) => i.formatType !== 'tip')
    .reduce((s, i) => s + i.qty, 0);
  // Estimated non-tip subtotal for fallback (strips tips from the subtotal)
  const nonTipFallbackSubtotal = Math.max(0, subtotalCents - metaTipCents);

  const orderItemRows = items.map((item) => {
    // For both tips and non-tips:
    //   test promo → use original (pre-discount) price so portal stats show real values
    //   real orders / real coupons → use what the customer actually paid (post-discount)
    const paidAmount = pricePaidMap.get(item.priceId) ?? null;
    const originalAmount = priceOriginalMap.get(item.priceId) ?? null;
    const relevantAmount = isTestPromo ? originalAmount : paidAmount;

    if (item.formatType === 'tip') {
      // Prefer unitAmountCents (set when tip uses price_data / user-entered variable amount).
      // Fall back to pricePaidMap when tip uses a fixed Stripe Price object (no unitAmountCents).
      let unitPriceCents: number;
      if (item.unitAmountCents != null && item.unitAmountCents > 0) {
        unitPriceCents = item.unitAmountCents;
      } else if (relevantAmount != null) {
        unitPriceCents = Math.round(relevantAmount / Math.max(item.qty, 1));
      } else {
        unitPriceCents = 0;
      }
      return {
        order_id: orderId,
        sanity_book_id: item.bookId,
        sanity_format_type: item.formatType,
        book_title: item.title,
        format_label: 'Tip',
        unit_price_cents: unitPriceCents,
        quantity: 1,
        stripe_price_id: item.priceId,
        is_digital: false,
        download_fulfilled: false,
      };
    }

    // Non-tip items: look up by price ID from expanded line items.

    const unitPriceCents =
      relevantAmount != null
        ? Math.round(relevantAmount / Math.max(item.qty, 1))
        : // Fallback: divide the non-tip portion of the subtotal by total non-tip quantity.
          // This avoids tip amounts inflating the per-book price.
          Math.round(nonTipFallbackSubtotal / Math.max(nonTipTotalQty, 1));

    return {
      order_id: orderId,
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

  const { data: createdItems, error: itemsError } = await db
    .from('order_items')
    .insert(orderItemRows)
    .select();

  if (itemsError || !createdItems) {
    console.error('[webhook] order_items insert failed:', itemsError?.message);
    return;
  }

  // 5d. Distribute Stripe fee proportionally across order items by gross amount
  const grossPerItem = orderItemRows.map((row) => ({
    grossCents: row.unit_price_cents * row.quantity,
  }));
  const itemStripeFees = distributeStripeFee(orderStripeFee, grossPerItem);

  // 8. Per-item: author_sales + author_earnings + digital fulfillment
  const saleDate = new Date();
  const guestDownloadLinks: Array<{
    bookTitle: string;
    downloadUrl: string;
    storagePath: string;
  }> = [];
  const digitalEmailItems: Array<{
    title: string;
    formatLabel: string;
    orderItemId: string;
    storagePath: string;
  }> = [];

  for (let idx = 0; idx < createdItems.length; idx++) {
    const createdItem = createdItems[idx] as {
      id: string;
      unit_price_cents: number;
      quantity: number;
    };
    const meta = items[idx];
    if (!meta) continue;

    const bookInfo = bookMap.get(meta.bookId) ?? null;
    const authorClerkId = bookInfo?.author?.clerkId ?? null;
    const revenueTerms = bookInfo?.revenueTerms ?? null;
    const isTip = meta.formatType === 'tip';

    // Tips: pricePaidMap lookup always fails (ephemeral price ID), so use unit_price_cents
    // which was set from unitAmountCents above.
    // Non-tips: test promo records original list price; real orders/coupons record paid price.
    let grossCents: number;
    if (isTip) {
      grossCents = createdItem.unit_price_cents * createdItem.quantity;
    } else {
      const paidTotal = pricePaidMap.get(meta.priceId) ?? null;
      const originalTotal = priceOriginalMap.get(meta.priceId) ?? null;
      grossCents = isTestPromo
        ? (originalTotal ?? createdItem.unit_price_cents * createdItem.quantity)
        : (paidTotal ?? createdItem.unit_price_cents * createdItem.quantity);
    }

    const saleId = await insertAuthorSale(db, {
      orderItemId: createdItem.id,
      orderId,
      sanityBookId: meta.bookId,
      authorClerkId,
      grossCents,
      revenueTerms,
      isTip,
    });

    // 8b. Insert author_earnings — net-of-Stripe splits + payout period assignment
    if (saleId) {
      await insertAuthorEarning(db, {
        authorSaleId: saleId,
        orderItemId: createdItem.id,
        orderId,
        sanityBookId: meta.bookId,
        authorClerkId,
        grossCents,
        itemStripeFee: itemStripeFees[idx] ?? 0,
        revenueTerms,
        isTip,
        saleDate,
      });
    }

    if (!meta.isDigital || isTip) continue;

    const storagePath =
      bookInfo?.formats?.find((f) => f._key === meta.formatKey)?.digitalAsset
        ?.supabaseStoragePath ?? '';

    if (!storagePath) {
      console.warn(`[webhook] No storage path for book ${meta.bookId} format ${meta.formatKey}`);
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    if (customerId && clerkUserId) {
      const { error: dlErr } = await db.from('digital_downloads').insert({
        order_item_id: createdItem.id,
        customer_id: customerId,
        supabase_storage_path: storagePath,
        download_count: 0,
        max_downloads: 5,
        expires_at: expiresAt.toISOString(),
      });
      if (dlErr) {
        console.error('[webhook] digital_download insert failed:', dlErr.message);
      } else {
        // Collect for the download-ready email sent after the loop
        digitalEmailItems.push({
          title: meta.title,
          formatLabel: meta.formatType.charAt(0).toUpperCase() + meta.formatType.slice(1),
          orderItemId: createdItem.id,
          storagePath,
        });
      }
    } else if (storagePath) {
      const guestExpiry = new Date();
      guestExpiry.setDate(guestExpiry.getDate() + 14);
      const token = crypto.randomUUID();

      const { error: tokenErr } = await db.from('guest_download_tokens').insert({
        order_id: orderId,
        book_title: meta.title,
        format_label: meta.formatType,
        supabase_storage_path: storagePath,
        guest_email: customerEmail,
        token,
        max_downloads: 1,
        expires_at: guestExpiry.toISOString(),
      });

      if (tokenErr) {
        console.error('[webhook] guest_download_token insert failed:', tokenErr.message);
      } else {
        guestDownloadLinks.push({
          bookTitle: meta.title,
          downloadUrl: `${siteUrl}/api/bookstore/download/guest?token=${token}`,
          storagePath,
        });
      }
    }

    await db.from('order_items').update({ download_fulfilled: true }).eq('id', createdItem.id);
  }

  // 8b. Auto-fulfill digital/tip-only orders — no physical shipping required
  const allNonPhysical = orderItemRows.every(
    (row) => row.is_digital || row.sanity_format_type === 'tip'
  );
  if (allNonPhysical) {
    await db
      .from('orders')
      .update({ status: 'fulfilled', fulfilled_at: new Date().toISOString() })
      .eq('id', orderId);
  }

  // 9. Audit log
  await db
    .from('audit_logs')
    .insert({
      event_type: 'payment_success',
      user_id: clerkUserId ?? null,
      order_id: orderId,
      details: {
        orderNumber,
        customerEmail,
        totalCents,
        digitalItemCount: items.filter((i) => i.isDigital).length,
      },
    })
    .then(({ error }) => {
      if (error) console.error('[webhook] audit_log insert failed:', error.message);
    });

  // 10. Emails (fire-and-forget via Next.js internal API)
  const hasDigital = items.some((i) => i.isDigital && i.formatType !== 'tip');

  // Build shipping address for the receipt if present (shippingAddr already declared above)
  const shippingAddressForEmail = shippingAddr
    ? {
        line1: shippingAddr.line1 ?? '',
        line2: shippingAddr.line2 ?? null,
        city: shippingAddr.city ?? '',
        state: shippingAddr.state ?? '',
        postalCode: shippingAddr.postal_code ?? '',
        country: shippingAddr.country ?? '',
      }
    : null;

  void sendEmail({
    type: 'order-confirmation',
    to: customerEmail,
    orderNumber,
    items: items.map((i, idx) => ({
      title: i.title,
      formatType: i.formatType,
      qty: i.qty,
      unitPriceCents: orderItemRows[idx]?.unit_price_cents ?? 0,
    })),
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents,
    shippingAddress: shippingAddressForEmail,
    hasDigital,
  });

  // Digital download email: auth users only, one email with all digital items + attachments
  if (clerkUserId && digitalEmailItems.length > 0) {
    void sendEmail({
      type: 'digital-download',
      to: customerEmail,
      orderNumber,
      items: digitalEmailItems,
    });
  }

  // Guest download emails: one per digital item (single-use tokens)
  for (const link of guestDownloadLinks) {
    const guestExpiry = new Date();
    guestExpiry.setDate(guestExpiry.getDate() + 14);
    void sendEmail({
      type: 'guest-download',
      to: customerEmail,
      orderNumber,
      bookTitle: link.bookTitle,
      downloadUrl: link.downloadUrl,
      expiresAt: guestExpiry.toISOString(),
      storagePath: link.storagePath,
    });
  }
}

async function handleRefund(charge: Stripe.Charge): Promise<void> {
  const db = supabase();
  const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null;
  if (!piId) return;

  const { data: order } = await db
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', piId)
    .maybeSingle();

  if (!order) return;
  const orderId = (order as { id: string }).id;

  await db.from('orders').update({ status: 'refunded' }).eq('id', orderId);

  // Revoke digital download access
  const { data: digitalItems } = await db
    .from('order_items')
    .select('id')
    .eq('order_id', orderId)
    .eq('is_digital', true);

  for (const item of (digitalItems ?? []) as Array<{ id: string }>) {
    await db.from('digital_downloads').update({ max_downloads: 0 }).eq('order_item_id', item.id);
  }

  // Send refund notification email
  const { data: fullOrder } = await db
    .from('orders')
    .select('order_number, customer:customers(email)')
    .eq('id', orderId)
    .maybeSingle();

  if (fullOrder) {
    const customerEmail = (fullOrder.customer as { email: string } | null)?.email;
    if (customerEmail) {
      void sendEmail({
        type: 'refund',
        to: customerEmail,
        orderNumber: fullOrder.order_number,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const sig = req.headers.get('stripe-signature');
  const webhookSecret = env('STRIPE_WEBHOOK_SECRET');

  const rawBody = await req.arrayBuffer();

  let event: Stripe.Event;
  try {
    if (webhookSecret && sig) {
      event = await stripe.webhooks.constructEventAsync(
        new Uint8Array(rawBody),
        sig,
        webhookSecret,
        undefined,
        cryptoProvider
      );
    } else {
      console.warn('[webhook] No STRIPE_WEBHOOK_SECRET — skipping signature verification');
      event = JSON.parse(new TextDecoder().decode(rawBody)) as Stripe.Event;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Signature verification failed';
    console.error('[webhook] Verification error:', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`[webhook] Handler error for ${event.type}:`, err);
    return new Response(JSON.stringify({ error: 'Handler failed' }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
