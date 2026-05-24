// src/lib/newsletter/email.ts
// Confirmation and welcome emails for both newsletter lists via Nodemailer SMTP.
// Uses the same SMTP env vars as the bookstore order emails (src/lib/bookstore/email.ts).
import 'server-only';

import nodemailer from 'nodemailer';

let _transporter: nodemailer.Transporter | null = null;

// Strip leading BOM and surrounding whitespace that PowerShell/Vercel CLI can inject.
function cleanEnv(key: string): string {
  return (process.env[key] ?? '').replace(/﻿/g, '').trim();
}

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    const host = cleanEnv('SMTP_HOST');
    const user = cleanEnv('SMTP_USER');
    const pass = cleanEnv('SMTP_PASS');
    if (!host || !user || !pass) {
      throw new Error('[newsletter/email] SMTP_HOST, SMTP_USER, and SMTP_PASS must be set');
    }
    _transporter = nodemailer.createTransport({
      host,
      port: parseInt(cleanEnv('SMTP_PORT') || '587', 10),
      secure: cleanEnv('SMTP_SECURE') === 'true',
      auth: { user, pass },
    });
  }
  return _transporter;
}

export function isConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

// Gmail rejects MAIL FROM if the address isn't a verified alias — always use SMTP_USER.
function fromAddress(displayName: string): string {
  const user = cleanEnv('SMTP_USER');
  return user ? `${displayName} <${user}>` : `${displayName} <newsletter@untelevised.media>`;
}

const baseSiteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_PRODUCTION_URL ??
  'https://untelevised.media'
).replace(/\/$/, '');

// ---------------------------------------------------------------------------
// Shared HTML layout — fully parameterized per list
// ---------------------------------------------------------------------------

interface LayoutOptions {
  title: string;
  brandColor: string;
  brandLabel: string; // e.g. "UNTELEVISED MEDIA" or "HURRIYA PUBLICATIONS"
  tagline: string; // e.g. "Unfiltered. Uncensored. Uncompromising."
}

function layout(content: string, opts: LayoutOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#111111;border:1px solid #2a2a2a;max-width:600px;width:100%;">

        <!-- Brand bar -->
        <tr>
          <td style="background-color:${opts.brandColor};padding:16px 32px;">
            <p style="margin:0;color:#ffffff;font-size:10px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">
              ${opts.brandLabel}
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
              ${opts.tagline}<br>
              <a href="${baseSiteUrl}" style="color:${opts.brandColor};text-decoration:none;">untelevised.media</a>
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
// 1. Confirmation email
// ---------------------------------------------------------------------------

export interface SendConfirmEmailParams {
  to: string;
  firstName?: string;
  confirmUrl: string;
  listName: string;
  fromName: string;
  tagline: string;
  brandColor: string;
}

export async function sendConfirmEmail(params: SendConfirmEmailParams): Promise<void> {
  const greeting = params.firstName ? `Hi ${params.firstName},` : 'Hi there,';

  const content = `
    <p style="margin:0 0 16px;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Confirm Your Subscription</p>
    <p style="margin:0 0 8px;font-size:13px;color:#aaaaaa;line-height:1.6;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:13px;color:#aaaaaa;line-height:1.6;">
      Thanks for signing up for <strong style="color:#ffffff;">${params.listName}</strong> updates.
      Click the button below to confirm your email address and activate your subscription.
    </p>
    <div style="padding:8px 0 24px;">
      <a href="${params.confirmUrl}"
         style="display:inline-block;background-color:${params.brandColor};color:#ffffff;font-size:11px;font-weight:900;letter-spacing:3px;text-transform:uppercase;padding:14px 28px;text-decoration:none;">
        Confirm Subscription &rarr;
      </a>
    </div>
    <p style="margin:0;font-size:11px;color:#555555;line-height:1.6;">
      If you didn&rsquo;t sign up for ${params.listName} updates, you can safely ignore this email.
    </p>`;

  await getTransporter().sendMail({
    from: fromAddress(params.fromName),
    to: params.to,
    subject: `Confirm your ${params.listName} subscription`,
    html: layout(content, {
      title: `Confirm subscription — ${params.listName}`,
      brandColor: params.brandColor,
      brandLabel: params.fromName.toUpperCase(),
      tagline: params.tagline,
    }),
  });
}

// ---------------------------------------------------------------------------
// 2. Welcome email
// ---------------------------------------------------------------------------

export interface SendWelcomeEmailParams {
  to: string;
  firstName?: string;
  listName: string;
  fromName: string;
  tagline: string;
  brandColor: string;
  missionCopy: string;
  ctaUrl: string;
  ctaText: string;
  unsubscribeUrl: string;
}

export async function sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<void> {
  const greeting = params.firstName ? `Welcome, ${params.firstName}!` : 'Welcome!';
  const fullCtaUrl = `${baseSiteUrl}${params.ctaUrl === '/' ? '' : params.ctaUrl}`;

  const content = `
    <p style="margin:0 0 16px;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:13px;color:#aaaaaa;line-height:1.6;">
      You&rsquo;re now subscribed to <strong style="color:#ffffff;">${params.listName}</strong>.
    </p>
    <div style="background-color:#0d0d0d;border-left:4px solid ${params.brandColor};padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#aaaaaa;line-height:1.6;">${params.missionCopy}</p>
    </div>
    <div style="padding:8px 0 24px;">
      <a href="${fullCtaUrl}"
         style="display:inline-block;background-color:${params.brandColor};color:#ffffff;font-size:11px;font-weight:900;letter-spacing:3px;text-transform:uppercase;padding:14px 28px;text-decoration:none;">
        ${params.ctaText} &rarr;
      </a>
    </div>
    <hr style="border:none;border-top:1px solid #2a2a2a;margin:24px 0 16px;" />
    <p style="margin:0;font-size:10px;color:#555555;line-height:1.6;">
      You received this because you subscribed to ${params.listName}.<br>
      <a href="${params.unsubscribeUrl}" style="color:#555555;">Unsubscribe</a>
    </p>`;

  await getTransporter().sendMail({
    from: fromAddress(params.fromName),
    to: params.to,
    subject: `Welcome to ${params.listName}`,
    html: layout(content, {
      title: `Welcome to ${params.listName}`,
      brandColor: params.brandColor,
      brandLabel: params.fromName.toUpperCase(),
      tagline: params.tagline,
    }),
  });
}
