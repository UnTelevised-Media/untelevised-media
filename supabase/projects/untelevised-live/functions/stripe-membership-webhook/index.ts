// supabase/functions/stripe-membership-webhook/index.ts
// Handles Stripe subscription lifecycle events for the membership system.
// Deployed to the untelevised-membership Supabase project (NOT the shop project).
//
// Register URL in the membership Stripe Dashboard:
//   https://<membership-project>.supabase.co/functions/v1/stripe-membership-webhook
//
// Required secrets (set via `supabase secrets set --project-ref <membership-project-ref>`):
//   STRIPE_MEMBERSHIP_SECRET_KEY     — membership Stripe project secret key
//   STRIPE_MEMBERSHIP_WEBHOOK_SECRET — signing secret from membership Stripe webhook config
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

const stripe = new Stripe(env('STRIPE_MEMBERSHIP_SECRET_KEY'), {
  apiVersion: '2026-04-22.dahlia' as Stripe.LatestApiVersion,
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

function db() {
  return createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Tier helpers
// ---------------------------------------------------------------------------

type MembershipTier = 'supporter' | 'contributor' | 'patron';
type MembershipStatus = 'active' | 'cancelled' | 'past_due' | 'incomplete';

function stripeStatusToMemberStatus(stripeStatus: string): MembershipStatus {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
      return 'cancelled';
    default:
      return 'incomplete';
  }
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  if (session.mode !== 'subscription') return;

  const clerkUserId = session.metadata?.clerk_user_id || null;
  const email = session.customer_details?.email ?? '';
  const tier = (session.metadata?.tier ?? 'supporter') as MembershipTier;
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  if (!email || !stripeCustomerId) {
    console.error('[membership-webhook] Missing email or customer ID on session', session.id);
    return;
  }

  const { error } = await db()
    .from('members')
    .upsert(
      {
        clerk_user_id: clerkUserId || null,
        email,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        tier,
        status: 'active',
        member_since: new Date().toISOString(),
      },
      { onConflict: 'stripe_customer_id' }
    );

  if (error) {
    console.error('[membership-webhook] Member upsert failed:', error.message);
  } else {
    console.log('[membership-webhook] Member created/updated:', stripeCustomerId, tier);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const status = stripeStatusToMemberStatus(subscription.status);
  const stripeCustomerId = subscription.customer as string;

  // Update clerk_user_id from subscription metadata if it was set at checkout
  // (covers the case where the session metadata clerk_user_id is the authoritative source)
  const clerkUserId = subscription.metadata?.clerk_user_id || null;

  const updatePayload: Record<string, unknown> = { status };
  if (clerkUserId) updatePayload.clerk_user_id = clerkUserId;

  const { error } = await db()
    .from('members')
    .update(updatePayload)
    .eq('stripe_customer_id', stripeCustomerId);

  if (error) {
    console.error('[membership-webhook] Subscription update failed:', error.message);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const stripeCustomerId = subscription.customer as string;

  const { error } = await db()
    .from('members')
    .update({ status: 'cancelled' })
    .eq('stripe_customer_id', stripeCustomerId);

  if (error) {
    console.error('[membership-webhook] Subscription deletion update failed:', error.message);
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
  const webhookSecret = env('STRIPE_MEMBERSHIP_WEBHOOK_SECRET');

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
      console.warn(
        '[membership-webhook] No STRIPE_MEMBERSHIP_WEBHOOK_SECRET — skipping verification'
      );
      event = JSON.parse(new TextDecoder().decode(rawBody)) as Stripe.Event;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Signature verification failed';
    console.error('[membership-webhook] Verification error:', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`[membership-webhook] Handler error for ${event.type}:`, err);
    // Return 200 to prevent Stripe retries on handler errors — log and investigate separately
    return new Response(JSON.stringify({ received: true, handlerError: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
