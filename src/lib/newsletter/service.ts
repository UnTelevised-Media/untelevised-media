// src/lib/newsletter/service.ts
// Shared subscribe / confirm / unsubscribe logic for both newsletter lists.
// API routes import this and pass a NewsletterConfig; no list-specific logic lives here.
import 'server-only';

import { Resend } from 'resend';
import { writeClient } from '@/lib/sanity/lib/write-client';
import { client } from '@/lib/sanity/lib/client';
import { render } from '@react-email/components';
import ConfirmSubscriptionEmail from '@/emails/ConfirmSubscriptionEmail';
import WelcomeEmail from '@/emails/WelcomeEmail';
import type { NewsletterConfig } from './types';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

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
  error?: string;
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
    // Re-subscribe (pending or unsubscribed) — reset token and status
    await writeClient
      .patch(existing._id)
      .set({
        firstName: firstName ?? null,
        status: 'pending',
        confirmToken,
        gdprConsent,
        source: source ?? null,
        submittedAt: new Date().toISOString(),
        confirmedAt: null,
        unsubscribedAt: null,
        resendContactId: null,
        unsubscribeToken: null,
      })
      .commit();
  } else {
    await writeClient.createIfNotExists({
      _id: docId,
      _type: config.schemaType,
      email,
      firstName: firstName ?? null,
      status: 'pending',
      confirmToken,
      gdprConsent,
      source: source ?? null,
      submittedAt: new Date().toISOString(),
    });
  }

  const fromEmail = process.env[config.fromEmailEnvKey] ?? 'newsletter@untelevised.media';

  try {
    const resend = getResend();
    const html = await render(
      ConfirmSubscriptionEmail({
        firstName,
        confirmUrl,
        listName: config.listName,
        brandColor: config.brandColor,
      })
    );
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Confirm your ${config.listName} subscription`,
      html,
    });
  } catch (err) {
    console.error(`[newsletter/subscribe][${config.schemaType}] Email send failed:`, err);
    // Don't block the user — Sanity doc is created; they can try again.
  }

  return { success: true, message: 'Check your inbox to confirm your subscription.' };
}

// ---------------------------------------------------------------------------
// Confirm
// ---------------------------------------------------------------------------

export interface ConfirmResult {
  redirectUrl: string;
  error?: string;
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
    `*[_type == $schemaType && confirmToken == $token && status == "pending"][0]{ _id, email, firstName }`,
    { schemaType: config.schemaType, token },
    { cache: 'no-store', next: { revalidate: 0 } }
  );

  if (!subscriber) {
    return {
      redirectUrl: `${config.confirmRedirectUrl.replace(/subscribed=1/, 'subscribed=error')}`,
      error: 'Invalid or expired token',
    };
  }

  const unsubscribeToken = crypto.randomUUID();

  await writeClient
    .patch(subscriber._id)
    .set({
      status: 'active',
      confirmedAt: new Date().toISOString(),
      confirmToken: null,
      unsubscribeToken,
    })
    .commit();

  // Add to Resend audience (non-fatal)
  const audienceId = process.env[config.audienceIdEnvKey];
  let resendContactId: string | undefined;
  if (audienceId) {
    try {
      const resend = getResend();
      const contact = await resend.contacts.create({
        audienceId,
        email: subscriber.email,
        firstName: subscriber.firstName ?? undefined,
        unsubscribed: false,
      });
      resendContactId = contact.data?.id;
      if (resendContactId) {
        await writeClient.patch(subscriber._id).set({ resendContactId }).commit();
      }
    } catch (err) {
      console.error(`[newsletter/confirm][${config.schemaType}] Resend contact failed:`, err);
    }
  }

  // Send welcome email (non-fatal)
  const fromEmail = process.env[config.fromEmailEnvKey] ?? 'newsletter@untelevised.media';
  const unsubscribeUrl = `${siteUrl()}${config.unsubscribeRoute}?token=${unsubscribeToken}`;
  try {
    const resend = getResend();
    const html = await render(
      WelcomeEmail({
        firstName: subscriber.firstName,
        listName: config.listName,
        brandColor: config.brandColor,
        missionCopy: config.missionCopy,
        unsubscribeUrl,
      })
    );
    await resend.emails.send({
      from: fromEmail,
      to: subscriber.email,
      subject: `Welcome to ${config.listName}`,
      html,
    });
  } catch (err) {
    console.error(`[newsletter/confirm][${config.schemaType}] Welcome email failed:`, err);
  }

  return { redirectUrl: `${siteUrl()}${config.confirmRedirectUrl}` };
}

// ---------------------------------------------------------------------------
// Unsubscribe
// ---------------------------------------------------------------------------

export interface UnsubscribeResult {
  redirectUrl: string;
  error?: string;
}

export async function unsubscribeFromList(
  config: NewsletterConfig,
  token: string
): Promise<UnsubscribeResult> {
  const subscriber = await client.fetch<{
    _id: string;
    resendContactId?: string;
  } | null>(
    `*[_type == $schemaType && unsubscribeToken == $token && status == "active"][0]{ _id, resendContactId }`,
    { schemaType: config.schemaType, token },
    { cache: 'no-store', next: { revalidate: 0 } }
  );

  if (!subscriber) {
    // Token not found or already unsubscribed — redirect as success to avoid enumeration.
    return { redirectUrl: `${siteUrl()}${config.unsubscribeRedirectUrl}` };
  }

  await writeClient
    .patch(subscriber._id)
    .set({
      status: 'unsubscribed',
      unsubscribedAt: new Date().toISOString(),
      unsubscribeToken: null,
    })
    .commit();

  // Remove from Resend audience (non-fatal)
  const audienceId = process.env[config.audienceIdEnvKey];
  if (audienceId && subscriber.resendContactId) {
    try {
      const resend = getResend();
      await resend.contacts.update({
        audienceId,
        id: subscriber.resendContactId,
        unsubscribed: true,
      });
    } catch (err) {
      console.error(`[newsletter/unsubscribe][${config.schemaType}] Resend update failed:`, err);
    }
  }

  return { redirectUrl: `${siteUrl()}${config.unsubscribeRedirectUrl}` };
}
