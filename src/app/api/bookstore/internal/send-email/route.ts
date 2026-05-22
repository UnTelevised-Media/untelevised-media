// src/app/api/bookstore/internal/send-email/route.ts
// Internal-only transactional email endpoint called by the Supabase stripe-webhook edge function.
// Protected by INTERNAL_EMAIL_SECRET bearer token — never expose this route to clients.

import { NextRequest, NextResponse } from 'next/server';
import {
  sendOrderConfirmationEmail,
  sendDigitalDownloadEmail,
  sendGuestDownloadEmail,
  sendRefundEmail,
  sendGiftEmail,
  type OrderConfirmationParams,
  type DigitalDownloadEmailParams,
  type GuestDownloadEmailParams,
} from '@/lib/bookstore/email';
import type { FormatType } from '@/lib/bookstore/types';

type Payload =
  | {
      type: 'order-confirmation';
      to: string;
      orderNumber: string;
      items: Array<{
        title: string;
        formatType: FormatType;
        qty: number;
        unitPriceCents: number;
      }>;
      subtotalCents: number;
      shippingCents: number;
      taxCents: number;
      totalCents: number;
      shippingAddress?: OrderConfirmationParams['shippingAddress'];
      hasDigital: boolean;
    }
  | {
      type: 'digital-download';
      to: string;
      orderNumber: string;
      items: DigitalDownloadEmailParams['items'];
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
    }
  | {
      type: 'gift';
      to: string;
      bookTitle: string;
      bookCoverUrl?: string;
      fromName?: string;
      anonymous: boolean;
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
          subtotalCents: payload.subtotalCents,
          shippingCents: payload.shippingCents,
          taxCents: payload.taxCents,
          totalCents: payload.totalCents,
          shippingAddress: payload.shippingAddress,
          hasDigital: payload.hasDigital,
        });
        break;

      case 'digital-download':
        await sendDigitalDownloadEmail({
          to: payload.to,
          orderNumber: payload.orderNumber,
          items: payload.items,
        });
        break;

      case 'guest-download':
        await sendGuestDownloadEmail({
          to: payload.to,
          orderNumber: payload.orderNumber,
          bookTitle: payload.bookTitle,
          downloadUrl: payload.downloadUrl,
          expiresAt: new Date(payload.expiresAt),
          storagePath: payload.storagePath,
        });
        break;

      case 'refund':
        await sendRefundEmail({ to: payload.to, orderNumber: payload.orderNumber });
        break;

      case 'gift':
        await sendGiftEmail({
          to: payload.to,
          bookTitle: payload.bookTitle,
          bookCoverUrl: payload.bookCoverUrl,
          fromName: payload.fromName,
          anonymous: payload.anonymous,
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
