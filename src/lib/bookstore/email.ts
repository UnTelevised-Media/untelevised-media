// src/lib/bookstore/email.ts
// Transactional email helpers using Nodemailer + Google SMTP.
// Env vars required:
//   SMTP_HOST      e.g. smtp.gmail.com
//   SMTP_PORT      587 (TLS) or 465 (SSL)
//   SMTP_SECURE    false for 587/STARTTLS, true for 465/SSL
//   SMTP_USER      Gmail address (untelevisedmedia.live@gmail.com)
//   SMTP_PASS      Google App Password (16-char, spaces OK)
//   ORDERS_SMTP_FROM  Display from address (must be a verified Gmail alias or SMTP_USER)

import nodemailer from 'nodemailer';
import type { FormatType } from './types';

// Lazy-initialize so missing env vars don't crash at build/import time
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) {
      throw new Error('[bookstore/email] SMTP_HOST, SMTP_USER, and SMTP_PASS must be set');
    }
    _transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT ?? '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });
  }
  return _transporter;
}

const from =
  process.env.ORDERS_SMTP_FROM ??
  process.env.SMTP_USER ??
  'UnTelevised Media <orders@untelevised.media>';

const baseUrl =
  process.env.NEXT_PUBLIC_PRODUCTION_URL ??
  process.env.NEXT_PUBLIC_DEVELOPMENT_URL ??
  'http://localhost:3000';

function isConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

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
  if (!isConfigured()) return;

  const itemLines = params.items
    .map((i) => `<li>${i.title} — ${i.formatType} × ${i.qty}</li>`)
    .join('');
  const total = (params.totalCents / 100).toFixed(2);

  await getTransporter().sendMail({
    from,
    to: params.to,
    subject: `Order Confirmed — ${params.orderNumber} | UnTelevised Media`,
    html: `
      <h2 style="font-family:sans-serif;">Order Confirmed</h2>
      <p style="font-family:sans-serif;">Order <strong>${params.orderNumber}</strong> — Total: <strong>$${total}</strong></p>
      <ul style="font-family:sans-serif;">${itemLines}</ul>
      <p style="font-family:sans-serif;">
        <a href="${baseUrl}/bookstore/orders">View your orders</a>
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
  if (!isConfigured()) return;

  await getTransporter().sendMail({
    from,
    to: params.to,
    subject: `Your Digital Download Is Ready — ${params.orderNumber} | UnTelevised Media`,
    html: `
      <h2 style="font-family:sans-serif;">Your Download Is Ready</h2>
      <p style="font-family:sans-serif;">Thank you for your purchase (Order <strong>${params.orderNumber}</strong>).</p>
      <p style="font-family:sans-serif;">
        Access your digital files any time from your
        <a href="${baseUrl}/bookstore/downloads">Download Vault</a>.
        Downloads are available for 1 year (up to 5 downloads).
      </p>
      <p style="font-family:sans-serif;color:#888;font-size:12px;">UnTelevised Media — Unfiltered. Uncensored. Uncompromising.</p>
    `,
  });
}

// ---------------------------------------------------------------------------
// Guest one-time download link
// ---------------------------------------------------------------------------

interface GuestDownloadEmailParams {
  to: string;
  orderNumber: string;
  bookTitle: string;
  downloadUrl: string;
  expiresAt: Date;
}

export async function sendGuestDownloadEmail(params: GuestDownloadEmailParams) {
  if (!isConfigured()) return;

  const expires = params.expiresAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  await getTransporter().sendMail({
    from,
    to: params.to,
    subject: `Your Download Link — ${params.orderNumber} | UnTelevised Media`,
    html: `
      <h2 style="font-family:sans-serif;">Your Download Is Ready</h2>
      <p style="font-family:sans-serif;">Thank you for purchasing <strong>${params.bookTitle}</strong> (Order <strong>${params.orderNumber}</strong>).</p>
      <p style="font-family:sans-serif;">
        <a href="${params.downloadUrl}" style="font-size:16px;font-weight:bold;color:#D70606;">Download Your Book →</a>
      </p>
      <p style="font-family:sans-serif;color:#666;font-size:13px;">
        This is a <strong>single-use link</strong> that expires on <strong>${expires}</strong>.
        Save your file immediately after downloading — this link cannot be reused.
      </p>
      <p style="font-family:sans-serif;color:#666;font-size:12px;">
        To access your purchases anytime, create a free account at
        <a href="${baseUrl}/sign-up">untelevised.media/sign-up</a> and sign in with the same email address.
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
  if (!isConfigured()) return;

  const trackingSection = params.trackingNumber
    ? `<p style="font-family:sans-serif;">Tracking: <strong>${params.trackingNumber}</strong>${params.trackingUrl ? ` — <a href="${params.trackingUrl}">Track package</a>` : ''}</p>`
    : '';

  await getTransporter().sendMail({
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
  if (!isConfigured()) return;

  await getTransporter().sendMail({
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
