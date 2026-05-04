// src/lib/bookstore/email.ts
// Transactional email helpers using Nodemailer + Google SMTP.
//
// Required env vars:
//   SMTP_HOST                     e.g. smtp.gmail.com
//   SMTP_PORT                     587 (STARTTLS) or 465 (SSL)
//   SMTP_SECURE                   "false" for 587, "true" for 465
//   SMTP_USER                     Gmail address
//   SMTP_PASS                     Google App Password (16-char)
//   ORDERS_SMTP_FROM              Display from address
//   SUPABASE_SHOP_URL             Supabase project URL (for attachment fetching)
//   SUPABASE_SHOP_SERVICE_ROLE_KEY  Service role key (for Storage signed URLs)

import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import type { FormatType } from './types';

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

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
  'Hurriya Publications <orders@untelevised.media>';

const baseUrl =
  process.env.NEXT_PUBLIC_PRODUCTION_URL ??
  process.env.NEXT_PUBLIC_DEVELOPMENT_URL ??
  'http://localhost:3000';

function isConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

// ---------------------------------------------------------------------------
// Branded HTML layout wrapper
// ---------------------------------------------------------------------------

function emailLayout(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#111111;border:1px solid #2a2a2a;max-width:600px;width:100%;">

        <!-- Red header bar -->
        <tr>
          <td style="background-color:#D70606;padding:16px 32px;">
            <p style="margin:0;color:#ffffff;font-size:10px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">
              HURRIYA PUBLICATIONS &nbsp;&bull;&nbsp; UNTELEVISED MEDIA
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;color:#e5e5e5;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#0a0a0a;padding:16px 32px;border-top:1px solid #2a2a2a;text-align:center;">
            <p style="margin:0;color:#555555;font-size:11px;line-height:1.8;">
              Unfiltered. Uncensored. Uncompromising.<br>
              <a href="${baseUrl}" style="color:#D70606;text-decoration:none;">untelevised.media</a>
              &nbsp;&middot;&nbsp;
              <a href="${baseUrl}/policies" style="color:#555555;text-decoration:none;">Policies</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// File attachment helper — fetches from Supabase Storage if file ≤ maxBytes
// Returns null when the file is too large, missing, or on any fetch error.
// ---------------------------------------------------------------------------

interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

async function fetchAttachmentIfSmall(
  storagePath: string,
  maxBytes = 10 * 1024 * 1024 // 10 MB raw — ~13 MB base64-encoded in email
): Promise<EmailAttachment | null> {
  if (!storagePath) return null;
  const url = process.env.SUPABASE_SHOP_URL;
  const key = process.env.SUPABASE_SHOP_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });

    const { data: urlData, error: urlErr } = await supabase.storage
      .from('digital-books')
      .createSignedUrl(storagePath, 300); // 5-minute window just for the fetch

    if (urlErr || !urlData?.signedUrl) return null;

    // HEAD first to avoid downloading a file that's too large
    const headRes = await fetch(urlData.signedUrl, { method: 'HEAD' });
    const contentLength = parseInt(headRes.headers.get('content-length') ?? '0', 10);
    if (contentLength > maxBytes) return null;

    const fileRes = await fetch(urlData.signedUrl);
    if (!fileRes.ok) return null;

    const buffer = Buffer.from(await fileRes.arrayBuffer());
    const filename = storagePath.split('/').pop() ?? 'download';
    const contentType = fileRes.headers.get('content-type') ?? 'application/octet-stream';

    return { filename, content: buffer, contentType };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Shared formatting helpers
// ---------------------------------------------------------------------------

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// 1. Order Receipt
// ---------------------------------------------------------------------------

export interface OrderConfirmationParams {
  to: string;
  orderNumber: string;
  items: {
    title: string;
    formatType: FormatType;
    qty: number;
    unitPriceCents: number;
  }[];
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

export async function sendOrderConfirmationEmail(params: OrderConfirmationParams) {
  if (!isConfigured()) return;

  const itemRows = params.items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #222222;font-size:13px;color:#e5e5e5;vertical-align:top;">
          ${i.title}
          <span style="display:inline-block;margin-left:6px;font-size:9px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#999999;background-color:#1e1e1e;padding:2px 5px;">${i.formatType}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #222222;font-size:13px;color:#888888;text-align:center;white-space:nowrap;vertical-align:top;">&times;${i.qty}</td>
        <td style="padding:10px 0;border-bottom:1px solid #222222;font-size:13px;color:#e5e5e5;text-align:right;white-space:nowrap;vertical-align:top;">${fmt(i.unitPriceCents * i.qty)}</td>
      </tr>`
    )
    .join('');

  const totalsRows = [
    params.shippingCents > 0 || params.taxCents > 0
      ? `<tr>
          <td style="font-size:13px;color:#888888;padding:4px 0;">Subtotal</td>
          <td style="font-size:13px;color:#888888;text-align:right;padding:4px 0;">${fmt(params.subtotalCents)}</td>
        </tr>`
      : '',
    params.shippingCents > 0
      ? `<tr>
          <td style="font-size:13px;color:#888888;padding:4px 0;">Shipping</td>
          <td style="font-size:13px;color:#888888;text-align:right;padding:4px 0;">${fmt(params.shippingCents)}</td>
        </tr>`
      : '',
    params.taxCents > 0
      ? `<tr>
          <td style="font-size:13px;color:#888888;padding:4px 0;">Tax</td>
          <td style="font-size:13px;color:#888888;text-align:right;padding:4px 0;">${fmt(params.taxCents)}</td>
        </tr>`
      : '',
    `<tr>
      <td style="font-size:14px;font-weight:900;color:#ffffff;padding:12px 0 0;border-top:1px solid #333333;">Total</td>
      <td style="font-size:14px;font-weight:900;color:#D70606;text-align:right;padding:12px 0 0;border-top:1px solid #333333;">${fmt(params.totalCents)}</td>
    </tr>`,
  ]
    .filter(Boolean)
    .join('');

  const addressBlock = params.shippingAddress
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid #2a2a2a;padding-top:20px;">
        <tr><td style="padding-bottom:8px;">
          <p style="margin:0;font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#888888;">Ship To</p>
        </td></tr>
        <tr><td style="font-size:13px;color:#aaaaaa;line-height:1.8;">
          ${params.shippingAddress.line1}<br>
          ${params.shippingAddress.line2 ? `${params.shippingAddress.line2}<br>` : ''}
          ${params.shippingAddress.city}, ${params.shippingAddress.state} ${params.shippingAddress.postalCode}<br>
          ${params.shippingAddress.country}
        </td></tr>
      </table>`
    : '';

  const digitalCta = params.hasDigital
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
        <tr><td style="background-color:#0d0d0d;border:1px solid #2a2a2a;padding:20px;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#D70606;">Digital Files Ready</p>
          <p style="margin:0 0 16px;font-size:13px;color:#aaaaaa;">Your digital files are in your Download Vault — available for 1 year, up to 5 downloads each.</p>
          <a href="${baseUrl}/bookstore/downloads" style="display:inline-block;background-color:#D70606;color:#ffffff;font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;padding:10px 20px;text-decoration:none;">Access Download Vault &rarr;</a>
        </td></tr>
      </table>`
    : '';

  const content = `
    <p style="margin:0 0 4px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Order Confirmed</p>
    <p style="margin:0 0 24px;font-size:13px;color:#888888;">
      Order <strong style="color:#e5e5e5;">${params.orderNumber}</strong> &mdash; we&rsquo;ve received your purchase.
    </p>

    <p style="margin:0 0 10px;font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#888888;">Order Items</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <thead>
        <tr>
          <th style="text-align:left;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#555555;padding-bottom:8px;border-bottom:1px solid #333333;">Item</th>
          <th style="text-align:center;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#555555;padding-bottom:8px;border-bottom:1px solid #333333;white-space:nowrap;">Qty</th>
          <th style="text-align:right;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#555555;padding-bottom:8px;border-bottom:1px solid #333333;white-space:nowrap;">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      ${totalsRows}
    </table>

    ${addressBlock}
    ${digitalCta}

    <p style="margin:24px 0 0;">
      <a href="${baseUrl}/bookstore/orders" style="font-size:11px;color:#D70606;text-decoration:none;font-weight:700;">View Order History &rarr;</a>
    </p>`;

  await getTransporter().sendMail({
    from,
    to: params.to,
    subject: `Order Receipt — ${params.orderNumber} | Hurriya Publications`,
    html: emailLayout(content, `Order Receipt — ${params.orderNumber}`),
  });
}

// ---------------------------------------------------------------------------
// 2. Digital Download Ready (authenticated users)
// ---------------------------------------------------------------------------

export interface DigitalDownloadItem {
  title: string;
  formatLabel: string;
  orderItemId: string;
  storagePath: string;
}

export interface DigitalDownloadEmailParams {
  to: string;
  orderNumber: string;
  items: DigitalDownloadItem[];
}

export async function sendDigitalDownloadEmail(params: DigitalDownloadEmailParams) {
  if (!isConfigured()) return;

  // Attempt to attach files ≤ 10 MB
  const attachmentResults = await Promise.all(
    params.items.map((item) => fetchAttachmentIfSmall(item.storagePath))
  );
  const attachments = attachmentResults.filter((a): a is EmailAttachment => a !== null);
  const vaultUrl = `${baseUrl}/bookstore/downloads`;

  const itemBlocks = params.items
    .map(
      (item, idx) => `
      <tr><td style="padding:14px 0;border-bottom:1px solid #222222;">
        <p style="margin:0 0 2px;font-size:14px;font-weight:900;color:#ffffff;">${item.title}</p>
        <p style="margin:0 0 10px;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#888888;">${item.formatLabel}</p>
        ${
          attachmentResults[idx]
            ? `<p style="margin:0;font-size:12px;color:#4ade80;font-weight:700;">&#10003; File attached to this email</p>`
            : `<a href="${vaultUrl}" style="display:inline-block;background-color:#D70606;color:#ffffff;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;padding:8px 16px;text-decoration:none;">Download from Vault &rarr;</a>`
        }
      </td></tr>`
    )
    .join('');

  const vaultNote =
    attachments.length > 0
      ? `Files too large to attach are also in your <a href="${vaultUrl}" style="color:#D70606;">Download Vault</a>.`
      : `All your digital purchases are in your <a href="${vaultUrl}" style="color:#D70606;">Download Vault</a>.`;

  const content = `
    <p style="margin:0 0 4px;font-size:26px;font-weight:900;color:#ffffff;">Downloads Ready</p>
    <p style="margin:0 0 24px;font-size:13px;color:#888888;">
      Your digital purchase for order <strong style="color:#e5e5e5;">${params.orderNumber}</strong> is ready.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemBlocks}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
      <tr><td style="background-color:#0d0d0d;border:1px solid #2a2a2a;padding:16px;">
        <p style="margin:0 0 12px;font-size:12px;color:#aaaaaa;">${vaultNote} Downloads are valid for 1 year (up to 5 per title).</p>
        <a href="${vaultUrl}" style="display:inline-block;border:1px solid #D70606;color:#D70606;font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;padding:10px 20px;text-decoration:none;">Open Download Vault &rarr;</a>
      </td></tr>
    </table>`;

  await getTransporter().sendMail({
    from,
    to: params.to,
    subject: `Your Downloads Are Ready — ${params.orderNumber} | Hurriya Publications`,
    html: emailLayout(content, `Downloads Ready — ${params.orderNumber}`),
    attachments: attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  });
}

// ---------------------------------------------------------------------------
// 3. Guest One-Time Download
// ---------------------------------------------------------------------------

export interface GuestDownloadEmailParams {
  to: string;
  orderNumber: string;
  bookTitle: string;
  downloadUrl: string;
  expiresAt: Date;
  storagePath?: string;
}

export async function sendGuestDownloadEmail(params: GuestDownloadEmailParams) {
  if (!isConfigured()) return;

  const attachment = params.storagePath ? await fetchAttachmentIfSmall(params.storagePath) : null;

  const expires = params.expiresAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const primaryAction = attachment
    ? `<p style="margin:0 0 6px;font-size:13px;color:#4ade80;font-weight:700;">&#10003; Your file is attached to this email.</p>`
    : `<a href="${params.downloadUrl}" style="display:inline-block;background-color:#D70606;color:#ffffff;font-size:13px;font-weight:900;letter-spacing:2px;text-transform:uppercase;padding:14px 28px;text-decoration:none;">Download Your Book &rarr;</a>`;

  const notice = attachment
    ? `<p style="margin:0;font-size:12px;color:#888888;background-color:#0d0d0d;border:1px solid #2a2a2a;padding:14px;line-height:1.6;">
        If the attachment doesn&rsquo;t open, use your backup link before <strong style="color:#e5e5e5;">${expires}</strong>:<br>
        <a href="${params.downloadUrl}" style="color:#D70606;word-break:break-all;">${params.downloadUrl}</a>
      </p>`
    : `<p style="margin:16px 0 0;font-size:12px;color:#888888;background-color:#0d0d0d;border:1px solid #2a2a2a;padding:14px;line-height:1.6;">
        This is a <strong style="color:#e5e5e5;">single-use link</strong> that expires on <strong style="color:#e5e5e5;">${expires}</strong>.
        Save your file immediately &mdash; this link cannot be reused.
      </p>`;

  const content = `
    <p style="margin:0 0 4px;font-size:26px;font-weight:900;color:#ffffff;">Your Download Is Ready</p>
    <p style="margin:0 0 24px;font-size:13px;color:#888888;">
      Thank you for purchasing <strong style="color:#ffffff;">${params.bookTitle}</strong>. Order <strong style="color:#e5e5e5;">${params.orderNumber}</strong>.
    </p>

    <div style="padding:24px 0;">
      ${primaryAction}
    </div>

    ${notice}

    <p style="margin:24px 0 0;font-size:11px;color:#666666;">
      Create a free account to access all your purchases anytime:<br>
      <a href="${baseUrl}/sign-up" style="color:#D70606;">${baseUrl}/sign-up</a>
    </p>`;

  await getTransporter().sendMail({
    from,
    to: params.to,
    subject: `Your Download — ${params.bookTitle} | Hurriya Publications`,
    html: emailLayout(content, `Download Ready — ${params.bookTitle}`),
    ...(attachment
      ? {
          attachments: [
            {
              filename: attachment.filename,
              content: attachment.content,
              contentType: attachment.contentType,
            },
          ],
        }
      : {}),
  });
}

// ---------------------------------------------------------------------------
// 4. Shipment Notification
// ---------------------------------------------------------------------------

export interface ShipmentEmailParams {
  to: string;
  orderNumber: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export async function sendShipmentEmail(params: ShipmentEmailParams) {
  if (!isConfigured()) return;

  const trackingBlock = params.trackingNumber
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background-color:#0d0d0d;border:1px solid #2a2a2a;padding:20px;">
        <tr><td>
          <p style="margin:0 0 4px;font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#888888;">Tracking Number</p>
          <p style="margin:0 0 16px;font-size:20px;font-weight:900;color:#ffffff;letter-spacing:1px;font-family:monospace;">${params.trackingNumber}</p>
          ${
            params.trackingUrl
              ? `<a href="${params.trackingUrl}" style="display:inline-block;background-color:#D70606;color:#ffffff;font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;padding:10px 20px;text-decoration:none;">Track Package &rarr;</a>`
              : ''
          }
        </td></tr>
      </table>`
    : `<p style="margin:16px 0 0;font-size:13px;color:#aaaaaa;">Tracking information will be available shortly.</p>`;

  const content = `
    <p style="margin:0 0 4px;font-size:26px;font-weight:900;color:#ffffff;">Your Order Has Shipped</p>
    <p style="margin:0 0 8px;font-size:13px;color:#888888;">
      Order <strong style="color:#e5e5e5;">${params.orderNumber}</strong> is on its way to you.
    </p>
    ${trackingBlock}
    <p style="margin:24px 0 0;">
      <a href="${baseUrl}/bookstore/orders" style="font-size:11px;color:#D70606;text-decoration:none;font-weight:700;">View Your Orders &rarr;</a>
    </p>`;

  await getTransporter().sendMail({
    from,
    to: params.to,
    subject: `Your Order Has Shipped — ${params.orderNumber} | Hurriya Publications`,
    html: emailLayout(content, `Order Shipped — ${params.orderNumber}`),
  });
}

// ---------------------------------------------------------------------------
// 5. Refund Confirmation
// ---------------------------------------------------------------------------

export async function sendRefundEmail(params: { to: string; orderNumber: string }) {
  if (!isConfigured()) return;

  const content = `
    <p style="margin:0 0 4px;font-size:26px;font-weight:900;color:#ffffff;">Refund Processed</p>
    <p style="margin:0 0 24px;font-size:13px;color:#aaaaaa;">
      Your refund for order <strong style="color:#e5e5e5;">${params.orderNumber}</strong> has been processed.
      Please allow 5&ndash;10 business days for the credit to appear on your statement.
    </p>
    <p style="margin:0;font-size:12px;color:#666666;">
      Questions? <a href="${baseUrl}/secure-contact" style="color:#D70606;">Contact us</a>
    </p>`;

  await getTransporter().sendMail({
    from,
    to: params.to,
    subject: `Refund Processed — ${params.orderNumber} | Hurriya Publications`,
    html: emailLayout(content, `Refund Processed — ${params.orderNumber}`),
  });
}
