// src/app/api/bookstore/internal/send-email/route.ts
// Internal-only transactional email endpoint called by the Supabase stripe-webhook edge function.
// Protected by INTERNAL_EMAIL_SECRET bearer token — never expose this route to clients.

import { NextRequest, NextResponse } from 'next/server';
import {
  sendOrderConfirmationEmail,
  sendDigitalDownloadEmail,
  sendGuestDownloadEmail,
} from '@/lib/bookstore/email';
import type { FormatType } from '@/lib/bookstore/types';

type Payload =
  | {
      type: 'order-confirmation';
      to: string;
      orderNumber: string;
      items: Array<{ title: string; formatType: FormatType; qty: number }>;
      totalCents: number;
    }
  | { type: 'digital-download'; to: string; orderNumber: string }
  | {
      type: 'guest-download';
      to: string;
      orderNumber: string;
      bookTitle: string;
      downloadUrl: string;
      expiresAt: string;
    };

export async function POST(req: NextRequest) {
  // Verify bearer token
  const auth = req.headers.get('authorization') ?? '';
  const secret = process.env.INTERNAL_EMAIL_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    switch (payload.type) {
      case 'order-confirmation':
        await sendOrderConfirmationEmail({
          to: payload.to,
          orderNumber: payload.orderNumber,
          items: payload.items,
          totalCents: payload.totalCents,
        });
        break;

      case 'digital-download':
        await sendDigitalDownloadEmail({ to: payload.to, orderNumber: payload.orderNumber });
        break;

      case 'guest-download':
        await sendGuestDownloadEmail({
          to: payload.to,
          orderNumber: payload.orderNumber,
          bookTitle: payload.bookTitle,
          downloadUrl: payload.downloadUrl,
          expiresAt: new Date(payload.expiresAt),
        });
        break;

      default:
        return NextResponse.json({ error: 'Unknown email type' }, { status: 400 });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Email send failed';
    console.error('[send-email]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
