// src/app/api/bookstore/download/guest-resend/route.ts
// POST /api/bookstore/download/guest-resend
// Allows a guest to request a fresh download link by providing their order number and email.
// Rate limited to 3 resends per original token to prevent abuse.
//
// SERVICE ROLE JUSTIFICATION:
// This route uses shopServiceClient (service role) because guest purchasers have no
// Supabase Auth session. There is no Clerk userId to verify, so we cannot use the
// anon client (which would deny all reads via RLS). Application-level security is
// enforced by:
//   1. Rate limiting via checkGuestResendRate
//   2. Email cross-check against the order's stored customer email (Step A below)
//   3. Token lookup filtered by both order_id AND guest_email (Step B below)
// All three layers must pass before any token is issued or email is sent.

import { NextRequest, NextResponse } from 'next/server';
import { shopServiceClient, writeAuditLog } from '@/lib/bookstore/supabase';
import { sendGuestDownloadEmail } from '@/lib/bookstore/email';
import { checkGuestResendRate } from '@/lib/bookstore/ratelimit';

const MAX_RESENDS = 3;

export async function POST(req: NextRequest) {
  const rl = await checkGuestResendRate(req);
  if (rl.limited) {
    return NextResponse.json(
      { error: 'Too many requests — please wait a few minutes before trying again' },
      { status: 429 }
    );
  }

  let body: { orderNumber?: string; guestEmail?: string };

  try {
    body = (await req.json()) as { orderNumber?: string; guestEmail?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { orderNumber, guestEmail } = body;

  if (!orderNumber || !guestEmail) {
    return NextResponse.json(
      { error: 'orderNumber and guestEmail are required' },
      { status: 400 }
    );
  }

  // Look up the order (Step A: fetch customer_id for email cross-check below)
  const { data: order } = await shopServiceClient
    .from('orders')
    .select('id, customer_id')
    .eq('order_number', orderNumber.trim().toUpperCase())
    .maybeSingle();

  if (!order) {
    // Return generic message to avoid order enumeration
    return NextResponse.json({
      message: 'If a matching order was found, a new download link has been sent.',
    });
  }

  // Step A: Compare requested email against the stored purchaser email before
  // querying tokens. This prevents an attacker who knows an order number from
  // probing whether different emails have tokens attached to that order.
  if (order.customer_id) {
    const { data: customer } = await shopServiceClient
      .from('customers')
      .select('email')
      .eq('id', order.customer_id)
      .maybeSingle();

    if (!customer || customer.email.toLowerCase() !== guestEmail.trim().toLowerCase()) {
      return NextResponse.json({
        message: 'If a matching order was found, a new download link has been sent.',
      });
    }
  }

  // Step B: Find all guest download tokens for this order + email
  const { data: tokens } = await shopServiceClient
    .from('guest_download_tokens')
    .select('*')
    .eq('order_id', order.id)
    .eq('guest_email', guestEmail.trim().toLowerCase());

  if (!tokens || tokens.length === 0) {
    return NextResponse.json({
      message: 'If a matching order was found, a new download link has been sent.',
    });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_PRODUCTION_URL ??
    process.env.NEXT_PUBLIC_DEVELOPMENT_URL ??
    'http://localhost:3000';

  let sentCount = 0;

  for (const record of tokens) {
    if (record.resend_count >= MAX_RESENDS) {
      continue;
    }

    // Generate a fresh token with a 14-day window
    const newToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const { error: insertError } = await shopServiceClient.from('guest_download_tokens').insert({
      order_id: order.id,
      book_title: record.book_title,
      format_label: record.format_label,
      supabase_storage_path: record.supabase_storage_path,
      guest_email: guestEmail.trim().toLowerCase(),
      token: newToken,
      max_downloads: 1,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      console.error('[guest-resend] Failed to create resend token:', insertError.message);
      continue;
    }

    // Increment resend counter on the original token
    await shopServiceClient
      .from('guest_download_tokens')
      .update({ resend_count: record.resend_count + 1 })
      .eq('id', record.id);

    const downloadUrl = `${baseUrl}/api/bookstore/download/guest?token=${newToken}`;

    try {
      await sendGuestDownloadEmail({
        to: guestEmail.trim().toLowerCase(),
        orderNumber,
        bookTitle: record.book_title ?? 'Your Book',
        downloadUrl,
        expiresAt,
      });
      sentCount++;
    } catch (emailErr) {
      console.error('[guest-resend] Email send failed:', emailErr);
    }
  }

  void writeAuditLog({
    eventType: 'guest_download_resend',
    details: { orderNumber, guestEmail, sentCount },
  });

  return NextResponse.json({
    message: 'If a matching order was found, a new download link has been sent.',
  });
}
