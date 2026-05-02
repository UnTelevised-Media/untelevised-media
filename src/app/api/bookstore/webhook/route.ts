// src/app/api/bookstore/webhook/route.ts
// Stripe webhook handling has moved to the Supabase Edge Function:
//   supabase/functions/stripe-webhook/index.ts
// Register the edge function URL in Stripe Dashboard instead:
//   https://<project-ref>.supabase.co/functions/v1/stripe-webhook

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Webhook endpoint moved. Update Stripe to point to the Supabase edge function URL.' },
    { status: 410 }
  );
}
