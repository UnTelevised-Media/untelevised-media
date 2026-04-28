// src/lib/shop/email.ts
// Transactional email helpers using Resend.
// TODO: set RESEND_API_KEY and RESEND_FROM_EMAIL env vars.

import { Resend } from 'resend';
import type { FormatType } from './types';

const resend = new Resend(process.env.RESEND_API_KEY ?? '');
const from = process.env.RESEND_FROM_EMAIL ?? 'UnTelevised Media <orders@untelevised.media>';

const baseUrl =
  process.env.NEXT_PUBLIC_PRODUCTION_URL ??
  process.env.NEXT_PUBLIC_DEVELOPMENT_URL ??
  'http://localhost:3000';

// ---------------------------------------------------------------------------
// Order confirmation
// ---------------------------------------------------------------------------

interface OrderConfirmationParams {
  to: string;
  orderNumber: string;
  items: { title: string; formatType: FormatType; qty: number }[];
  totalCents: number;
}

export async function sendOrderConfirmationEmail(params: OrderConfirmationParams) {
  if (!process.env.RESEND_API_KEY) return;

  const itemLines = params.items
    .map((i) => `<li>${i.title} — ${i.formatType} × ${i.qty}</li>`)
    .join('');

  const total = (params.totalCents / 100).toFixed(2);

  await resend.emails.send({
    from,
    to: params.to,
    subject: `Order Confirmed — ${params.orderNumber} | UnTelevised Media`,
    html: `
      <h2 style="font-family:sans-serif;">Order Confirmed</h2>
      <p style="font-family:sans-serif;">Order <strong>${params.orderNumber}</strong> — Total: <strong>$${total}</strong></p>
      <ul style="font-family:sans-serif;">${itemLines}</ul>
      <p style="font-family:sans-serif;">
        <a href="${baseUrl}/shop/orders">View your orders</a>
      </p>
      <p style="font-family:sans-serif;color:#888;font-size:12px;">UnTelevised Media — Unfiltered. Uncensored. Uncompromising.</p>
    `,
  });
}

// ---------------------------------------------------------------------------
// Digital download delivery
// ---------------------------------------------------------------------------

interface DigitalDownloadEmailParams {
  to: string;
  orderNumber: string;
}

export async function sendDigitalDownloadEmail(params: DigitalDownloadEmailParams) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from,
    to: params.to,
    subject: `Your Digital Download Is Ready — ${params.orderNumber} | UnTelevised Media`,
    html: `
      <h2 style="font-family:sans-serif;">Your Download Is Ready</h2>
      <p style="font-family:sans-serif;">Thank you for your purchase (Order <strong>${params.orderNumber}</strong>).</p>
      <p style="font-family:sans-serif;">
        Access your digital files any time from your
        <a href="${baseUrl}/shop/downloads">Download Vault</a>.
        Downloads are available for 1 year (up to 5 downloads).
      </p>
      <p style="font-family:sans-serif;color:#888;font-size:12px;">UnTelevised Media — Unfiltered. Uncensored. Uncompromising.</p>
    `,
  });
}

// ---------------------------------------------------------------------------
// Shipment confirmation
// ---------------------------------------------------------------------------

interface ShipmentEmailParams {
  to: string;
  orderNumber: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export async function sendShipmentEmail(params: ShipmentEmailParams) {
  if (!process.env.RESEND_API_KEY) return;

  const trackingSection = params.trackingNumber
    ? `<p style="font-family:sans-serif;">Tracking: <strong>${params.trackingNumber}</strong>${params.trackingUrl ? ` — <a href="${params.trackingUrl}">Track package</a>` : ''}</p>`
    : '';

  await resend.emails.send({
    from,
    to: params.to,
    subject: `Your Order Has Shipped — ${params.orderNumber} | UnTelevised Media`,
    html: `
      <h2 style="font-family:sans-serif;">Your Order Has Shipped</h2>
      <p style="font-family:sans-serif;">Order <strong>${params.orderNumber}</strong> is on its way!</p>
      ${trackingSection}
      <p style="font-family:sans-serif;color:#888;font-size:12px;">UnTelevised Media — Unfiltered. Uncensored. Uncompromising.</p>
    `,
  });
}

// ---------------------------------------------------------------------------
// Refund confirmation
// ---------------------------------------------------------------------------

export async function sendRefundEmail(params: { to: string; orderNumber: string }) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from,
    to: params.to,
    subject: `Refund Processed — ${params.orderNumber} | UnTelevised Media`,
    html: `
      <h2 style="font-family:sans-serif;">Refund Processed</h2>
      <p style="font-family:sans-serif;">Your refund for order <strong>${params.orderNumber}</strong> has been processed. Please allow 5–10 business days for the credit to appear.</p>
      <p style="font-family:sans-serif;color:#888;font-size:12px;">UnTelevised Media — Unfiltered. Uncensored. Uncompromising.</p>
    `,
  });
}
