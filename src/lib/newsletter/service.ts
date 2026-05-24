// src/lib/newsletter/service.ts
// Shared subscribe / confirm / unsubscribe logic for both newsletter lists.
// API routes import this and pass a NewsletterConfig; no list-specific logic lives here.
import 'server-only';

import { writeClient } from '@/lib/sanity/lib/write-client';
import { client } from '@/lib/sanity/lib/client';
import { sendConfirmEmail, sendWelcomeEmail, isConfigured } from './email';
import type { NewsletterConfig } from './types';

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://untelevised.media').replace(/\/$/, '');
}

// ---------------------------------------------------------------------------
// Subscribe
// ---------------------------------------------------------------------------

export interface SubscribeInput {
  email: string;
  firstName?: string;
  gdprConsent: boolean;
  source?: string;
}

export interface SubscribeResult {
  success: boolean;
  message: string;
}

export async function subscribeToList(
  config: NewsletterConfig,
  input: SubscribeInput
): Promise<SubscribeResult> {
  const { email, firstName, gdprConsent, source } = input;

  // Avoid email enumeration: return the same message whether email is new or already active.
  const existing = await client.fetch<{ _id: string; status?: string } | null>(
    `*[_type == $schemaType && email == $email][0]{ _id, status }`,
    { schemaType: config.schemaType, email },
    { cache: 'no-store', next: { revalidate: 0 } }
  );

  if (existing?.status === 'active') {
    return { success: true, message: 'Check your inbox to confirm your subscription.' };
  }

  const confirmToken = crypto.randomUUID();
  const confirmUrl = `${siteUrl()}${config.confirmRoute}?token=${confirmToken}`;
  const docId = `${config.schemaType}_${email.replace(/[^a-z0-9]/g, '_')}`;

  if (existing) {
    // Re-subscribe (pending or unsubscribed) — reset token and status.
    await writeClient
      .patch(existing._id)
      .set({
        status: 'pending',
        confirmToken,
        gdprConsent,
        submittedAt: new Date().toISOString(),
        ...(firstName ? { firstName } : {}),
        ...(source ? { source } : {}),
      })
      .unset(['confirmedAt', 'unsubscribedAt', 'unsubscribeToken'])
      .commit();
  } else {
    await writeClient.createIfNotExists({
      _id: docId,
      _type: config.schemaType,
      email,
      status: 'pending',
      confirmToken,
      gdprConsent,
      submittedAt: new Date().toISOString(),
      ...(firstName ? { firstName } : {}),
      ...(source ? { source } : {}),
    });
  }

  if (isConfigured()) {
    try {
      await sendConfirmEmail({
        to: email,
        firstName,
        confirmUrl,
        listName: config.listName,
        fromName: config.fromName,
        tagline: config.tagline,
        brandColor: config.brandColor,
      });
    } catch (err) {
      console.error(`[newsletter/subscribe][${config.schemaType}] Confirm email failed:`, err);
      // Don't block the user — Sanity doc is created; they can try again.
    }
  }

  return { success: true, message: 'Check your inbox to confirm your subscription.' };
}

// ---------------------------------------------------------------------------
// Confirm
// ---------------------------------------------------------------------------

export interface ConfirmResult {
  redirectUrl: string;
}

export async function confirmSubscription(
  config: NewsletterConfig,
  token: string
): Promise<ConfirmResult> {
  const subscriber = await client.fetch<{
    _id: string;
    email: string;
    firstName?: string;
  } | null>(
    `*[_type == $schemaType && confirmToken == $tok && status == "pending"][0]{ _id, email, firstName }`,
    { schemaType: config.schemaType, tok: token }
  );

  if (!subscriber) {
    const errorUrl = config.confirmRedirectUrl.replace('subscribed=1', 'subscribed=error');
    return { redirectUrl: `${siteUrl()}${errorUrl}` };
  }

  const unsubscribeToken = crypto.randomUUID();

  await writeClient
    .patch(subscriber._id)
    .set({
      status: 'active',
      confirmedAt: new Date().toISOString(),
      unsubscribeToken,
    })
    .unset(['confirmToken'])
    .commit();

  // Send welcome email (non-fatal)
  if (isConfigured()) {
    const unsubscribeUrl = `${siteUrl()}${config.unsubscribeRoute}?token=${unsubscribeToken}`;
    try {
      await sendWelcomeEmail({
        to: subscriber.email,
        firstName: subscriber.firstName,
        listName: config.listName,
        fromName: config.fromName,
        tagline: config.tagline,
        brandColor: config.brandColor,
        missionCopy: config.missionCopy,
        ctaUrl: config.ctaUrl,
        ctaText: config.ctaText,
        unsubscribeUrl,
      });
    } catch (err) {
      console.error(`[newsletter/confirm][${config.schemaType}] Welcome email failed:`, err);
    }
  }

  return { redirectUrl: `${siteUrl()}${config.confirmRedirectUrl}` };
}

// ---------------------------------------------------------------------------
// Unsubscribe
// ---------------------------------------------------------------------------

export interface UnsubscribeResult {
  redirectUrl: string;
}

export async function unsubscribeFromList(
  config: NewsletterConfig,
  token: string
): Promise<UnsubscribeResult> {
  const subscriber = await client.fetch<{ _id: string } | null>(
    `*[_type == $schemaType && unsubscribeToken == $tok && status == "active"][0]{ _id }`,
    { schemaType: config.schemaType, tok: token }
  );

  // Token not found or already unsubscribed — silently succeed to avoid enumeration.
  if (!subscriber) {
    return { redirectUrl: `${siteUrl()}${config.unsubscribeRedirectUrl}` };
  }

  await writeClient
    .patch(subscriber._id)
    .set({
      status: 'unsubscribed',
      unsubscribedAt: new Date().toISOString(),
    })
    .unset(['unsubscribeToken'])
    .commit();

  return { redirectUrl: `${siteUrl()}${config.unsubscribeRedirectUrl}` };
}
