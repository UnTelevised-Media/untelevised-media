<!-- GitHub Issue: #27 -->

## Problem

UnTelevised Media has a `newsletterSubscribe` Sanity schema that stores email addresses — but the signup form is entirely disconnected from any email service provider. Subscribers who enter their email receive no confirmation, are never sent a welcome email, and receive no newsletters. The data being collected is essentially inert.

Email list ownership is the single most algorithm-independent distribution channel available to an independent outlet. Social platforms demonetize, shadow-ban, and deplatform. Search rankings fluctuate. An engaged email list is owned infrastructure. For an outlet covering contentious topics, maintaining a direct reader relationship through email is existentially important.

Additionally, collecting email addresses without a functional double opt-in and unsubscribe mechanism is a GDPR / CAN-SPAM compliance violation. The current non-functional signup creates legal exposure without any benefit.

## Background & Context

The existing `newsletterSubscribe` schema at `src/models/schema/newsletterSubscribe.ts` only stores `email` and `submittedAt`. It needs to be upgraded to support double opt-in state, confirmation tokens, first name, GDPR consent flag, and active/unsubscribed status.

The project uses `react-hook-form` and `zod` for form validation (already in use in `secure-contact`). The API route pattern established by `src/app/api/secure-contact/route.ts` uses `sanityClient.create()` directly and can be followed as a template. The recommended email service provider is **Resend** — developer-friendly, generous free tier (3,000 emails/month), first-class React Email template support.

The `NewsletterSignup` component should be placed in 4 locations: homepage, article pages (below body), footer (compact), and `/support` page.

## Architecture

```
User fills in form
  └── NewsletterSignup component (react-hook-form + zod)
        │ POST { email, firstName, gdprConsent }
        ▼
  /api/newsletter-subscribe (route.ts)
        ├── Validate with zod
        ├── Check for duplicate (query Sanity)
        ├── Generate confirmation token (crypto.randomUUID)
        ├── Create Sanity doc { email, firstName, status: 'pending', confirmToken, gdprConsent }
        ├── Send confirmation email via Resend
        │     └── emails/ConfirmSubscriptionEmail.tsx (React Email)
        │           contains link: /api/newsletter-confirm?token=[token]
        └── Return { success: true, message: 'Check your inbox' }

User clicks confirmation link in email
  └── /api/newsletter-confirm?token=[token] (route.ts)
        ├── Find Sanity doc where confirmToken == token && status == 'pending'
        ├── Patch doc: { status: 'active', confirmedAt: now }
        ├── Add to Resend audience
        ├── Send welcome email
        │     └── emails/WelcomeEmail.tsx
        └── Redirect to /?subscribed=1 (shows success banner)

Resend Audience
  └── Synced on confirmation — used for newsletter sends
```

## Proposed Solution

### Step 1 — Upgrade Sanity Schema

```typescript
// src/models/schema/newsletterSubscribe.ts — full replacement
import { defineField, defineType } from 'sanity';
import { Mail } from 'lucide-react';

export default defineType({
  name: 'newsletterSubscribe',
  title: 'Newsletter Subscriber',
  type: 'document',
  icon: Mail,
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'firstName',
      title: 'First Name',
      type: 'string',
      description: 'Optional — used for email personalization',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending (awaiting confirmation)', value: 'pending' },
          { title: 'Active (confirmed)', value: 'active' },
          { title: 'Unsubscribed', value: 'unsubscribed' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'confirmToken',
      title: 'Confirmation Token',
      type: 'string',
      description: 'Single-use token for double opt-in email confirmation',
      readOnly: true,
    }),
    defineField({
      name: 'gdprConsent',
      title: 'GDPR Consent',
      type: 'boolean',
      initialValue: false,
      description: 'Subscriber explicitly consented to receive emails',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
    }),
    defineField({
      name: 'confirmedAt',
      title: 'Confirmed At',
      type: 'datetime',
    }),
    defineField({
      name: 'unsubscribedAt',
      title: 'Unsubscribed At',
      type: 'datetime',
    }),
    defineField({
      name: 'resendContactId',
      title: 'Resend Contact ID',
      type: 'string',
      readOnly: true,
      description: 'ID returned by Resend API after adding contact to audience',
    }),
    defineField({
      name: 'source',
      title: 'Signup Source',
      type: 'string',
      description: 'Where on the site this subscriber signed up',
      options: {
        list: ['homepage', 'article', 'footer', 'support'],
        layout: 'dropdown',
      },
    }),
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'status',
    },
    prepare({ title, subtitle }) {
      const emoji = subtitle === 'active' ? '✅' : subtitle === 'pending' ? '⏳' : '🚫';
      return { title, subtitle: `${emoji} ${subtitle}` };
    },
  },
});
```

### Step 2 — Environment Variables

```env
# .env.local (add to .env.example too)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_AUDIENCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEWSLETTER_FROM_EMAIL=newsletter@untelevised.media
NEWSLETTER_CONFIRM_FROM_EMAIL=noreply@untelevised.media
NEXT_PUBLIC_SITE_URL=https://untelevised.media
```

### Step 3 — Subscribe API Route

```typescript
// src/app/api/newsletter-subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import sanityClient from '@/lib/sanity/lib/client';
import ConfirmSubscriptionEmail from '@/emails/ConfirmSubscriptionEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().max(100).optional(),
  gdprConsent: z.boolean().refine((v) => v === true, {
    message: 'You must consent to receive emails',
  }),
  source: z.enum(['homepage', 'article', 'footer', 'support']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    const { email, firstName, gdprConsent, source } = parsed.data;

    // Check for existing active subscription
    const existing = await sanityClient.fetch(
      `*[_type == 'newsletterSubscribe' && email == $email && status == 'active'][0]._id`,
      { email }
    );

    if (existing) {
      // Return success to avoid email enumeration
      return NextResponse.json({
        success: true,
        message: 'Check your inbox to confirm your subscription.',
      });
    }

    // Generate confirmation token
    const confirmToken = crypto.randomUUID();
    const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter-confirm?token=${confirmToken}`;

    // Create Sanity document
    await sanityClient.create({
      _type: 'newsletterSubscribe',
      email,
      firstName: firstName ?? null,
      status: 'pending',
      confirmToken,
      gdprConsent,
      source: source ?? 'homepage',
      submittedAt: new Date().toISOString(),
    });

    // Send confirmation email
    await resend.emails.send({
      from: process.env.NEWSLETTER_CONFIRM_FROM_EMAIL!,
      to: email,
      subject: 'Confirm your UnTelevised Media subscription',
      react: ConfirmSubscriptionEmail({ firstName, confirmUrl }),
    });

    return NextResponse.json({
      success: true,
      message: 'Check your inbox to confirm your subscription.',
    });
  } catch (error) {
    console.error('[newsletter-subscribe]', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
```

### Step 4 — Confirmation API Route

```typescript
// src/app/api/newsletter-confirm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import sanityClient from '@/lib/sanity/lib/client';
import WelcomeEmail from '@/emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(
      new URL('/?subscribed=error', process.env.NEXT_PUBLIC_SITE_URL!)
    );
  }

  // Find pending subscriber with this token
  const subscriber = await sanityClient.fetch(
    `*[_type == 'newsletterSubscribe' && confirmToken == $token && status == 'pending'][0]`,
    { token }
  );

  if (!subscriber) {
    return NextResponse.redirect(
      new URL('/?subscribed=error', process.env.NEXT_PUBLIC_SITE_URL!)
    );
  }

  // Activate subscriber
  await sanityClient.patch(subscriber._id).set({
    status: 'active',
    confirmedAt: new Date().toISOString(),
  }).commit();

  // Add to Resend audience
  let resendContactId: string | undefined;
  try {
    const contact = await resend.contacts.create({
      audienceId: process.env.RESEND_AUDIENCE_ID!,
      email: subscriber.email,
      firstName: subscriber.firstName ?? undefined,
      unsubscribed: false,
    });
    resendContactId = contact.data?.id;
    if (resendContactId) {
      await sanityClient.patch(subscriber._id).set({ resendContactId }).commit();
    }
  } catch (err) {
    console.error('[newsletter-confirm] Resend contact creation failed:', err);
    // Non-fatal — subscriber is active in Sanity even if Resend sync fails
  }

  // Send welcome email
  try {
    await resend.emails.send({
      from: process.env.NEWSLETTER_FROM_EMAIL!,
      to: subscriber.email,
      subject: 'Welcome to UnTelevised Media',
      react: WelcomeEmail({ firstName: subscriber.firstName }),
    });
  } catch (err) {
    console.error('[newsletter-confirm] Welcome email failed:', err);
  }

  return NextResponse.redirect(
    new URL('/?subscribed=1', process.env.NEXT_PUBLIC_SITE_URL!)
  );
}
```

### Step 5 — Email Templates

```tsx
// emails/ConfirmSubscriptionEmail.tsx
import {
  Body, Button, Container, Head, Heading, Html,
  Preview, Section, Text, Hr,
} from '@react-email/components';

interface Props {
  firstName?: string;
  confirmUrl: string;
}

export default function ConfirmSubscriptionEmail({ firstName, confirmUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Confirm your UnTelevised Media subscription</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '580px', margin: '0 auto', padding: '20px' }}>
          <Heading style={{ color: '#D70606', fontWeight: 900, textTransform: 'uppercase' }}>
            CONFIRM YOUR SUBSCRIPTION
          </Heading>
          <Text>
            {firstName ? `Hey ${firstName},` : 'Hey,'}{' '}
            you&apos;re one click away from independent news delivered to your inbox.
          </Text>
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button
              href={confirmUrl}
              style={{
                backgroundColor: '#D70606',
                color: '#ffffff',
                padding: '12px 24px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textDecoration: 'none',
              }}
            >
              CONFIRM SUBSCRIPTION
            </Button>
          </Section>
          <Hr />
          <Text style={{ color: '#888', fontSize: '12px' }}>
            If you did not sign up for UnTelevised Media updates, you can ignore this email.
            This link expires in 48 hours.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

```tsx
// emails/WelcomeEmail.tsx
import {
  Body, Button, Container, Head, Heading, Html,
  Preview, Text, Hr,
} from '@react-email/components';

interface Props {
  firstName?: string;
}

export default function WelcomeEmail({ firstName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to UnTelevised Media — Unfiltered. Uncensored. Uncompromising.</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '580px', margin: '0 auto', padding: '20px' }}>
          <Heading style={{ color: '#D70606', fontWeight: 900, textTransform: 'uppercase' }}>
            WELCOME TO UNTELEVISED MEDIA
          </Heading>
          <Text>
            {firstName ? `Welcome, ${firstName}.` : 'Welcome.'}{' '}
            You&apos;re now subscribed to independent journalism — unfiltered, uncensored, and uncompromising.
          </Text>
          <Text>
            We cover breaking news, live events, investigative reporting, and stories that mainstream
            media ignores. You&apos;ll hear from us when there&apos;s something worth reading.
          </Text>
          <Button
            href="https://untelevised.media"
            style={{
              backgroundColor: '#D70606',
              color: '#ffffff',
              padding: '12px 24px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textDecoration: 'none',
            }}
          >
            READ THE LATEST
          </Button>
          <Hr />
          <Text style={{ color: '#888', fontSize: '12px' }}>
            You&apos;re receiving this because you subscribed at untelevised.media.{' '}
            <a href="https://untelevised.media/unsubscribe" style={{ color: '#888' }}>
              Unsubscribe
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

### Step 6 — NewsletterSignup Component

```tsx
// src/components/global/NewsletterSignup.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  firstName: z.string().max(100).optional(),
  gdprConsent: z.boolean().refine((v) => v === true, {
    message: 'You must agree to receive emails',
  }),
});

type FormValues = z.infer<typeof schema>;

interface NewsletterSignupProps {
  variant?: 'full' | 'compact';
  source?: 'homepage' | 'article' | 'footer' | 'support';
}

export function NewsletterSignup({
  variant = 'full',
  source = 'homepage',
}: NewsletterSignupProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setState('loading');
    setErrorMessage('');
    try {
      const res = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to subscribe');
      setState('success');
      reset();
    } catch (err) {
      setState('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    }
  }

  if (state === 'success') {
    return (
      <div className="border border-green-500 bg-green-50 dark:bg-green-950/40 p-4 text-sm text-green-800 dark:text-green-200">
        <p className="font-black uppercase tracking-widest text-xs mb-1">Check your inbox</p>
        <p>We sent you a confirmation email. Click the link to activate your subscription.</p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <div className="flex gap-0">
          <input
            {...register('email')}
            type="email"
            placeholder="your@email.com"
            className="flex-1 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-[#D70606] dark:text-white"
          />
          <button
            type="submit"
            disabled={state === 'loading'}
            className="bg-[#D70606] px-4 py-2 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60 hover:bg-red-700 transition-colors"
          >
            {state === 'loading' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              'Subscribe'
            )}
          </button>
        </div>
        <label className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400 cursor-pointer">
          <input
            {...register('gdprConsent')}
            type="checkbox"
            className="mt-0.5 accent-[#D70606]"
          />
          I agree to receive news from UnTelevised Media
        </label>
        {errors.email && (
          <p className="text-xs text-[#D70606]">{errors.email.message}</p>
        )}
        {errors.gdprConsent && (
          <p className="text-xs text-[#D70606]">{errors.gdprConsent.message}</p>
        )}
        {state === 'error' && (
          <p className="text-xs text-[#D70606]">{errorMessage}</p>
        )}
      </form>
    );
  }

  return (
    <section className="my-10 border border-neutral-200 dark:border-neutral-700 p-6">
      <div className="mb-4 bg-[#D70606] px-3 py-2 inline-block">
        <p className="text-xs font-black uppercase tracking-widest text-white">
          Stay Informed
        </p>
      </div>
      <h2 className="text-xl font-black uppercase tracking-tight mb-2">
        Get the news. Own it.
      </h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
        Independent journalism, direct to your inbox. No algorithms. No corporate filter.
        Unsubscribe any time.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            {...register('firstName')}
            type="text"
            placeholder="First name (optional)"
            className="flex-1 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-3 py-2.5 text-sm outline-none focus:border-[#D70606] dark:text-white"
          />
          <input
            {...register('email')}
            type="email"
            placeholder="your@email.com"
            className="flex-1 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-3 py-2.5 text-sm outline-none focus:border-[#D70606] dark:text-white"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-[#D70606]">{errors.email.message}</p>
        )}
        <label className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
          <input
            {...register('gdprConsent')}
            type="checkbox"
            className="mt-0.5 accent-[#D70606]"
          />
          I agree to receive news and updates from UnTelevised Media. You can unsubscribe at any time.
        </label>
        {errors.gdprConsent && (
          <p className="text-xs text-[#D70606]">{errors.gdprConsent.message}</p>
        )}
        {state === 'error' && (
          <p className="text-xs text-[#D70606]">{errorMessage}</p>
        )}
        <button
          type="submit"
          disabled={state === 'loading'}
          className="bg-[#D70606] py-3 px-6 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60 hover:bg-red-700 transition-colors inline-flex items-center gap-2"
        >
          {state === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
          Subscribe Free
        </button>
      </form>
    </section>
  );
}
```

## Implementation Plan

1. **Install deps** — `pnpm add resend @react-email/components`
2. **Schema upgrade** — Replace `newsletterSubscribe.ts` with the upgraded version (Step 1).
3. **Env vars** — Add `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, `NEWSLETTER_FROM_EMAIL`, `NEWSLETTER_CONFIRM_FROM_EMAIL` to `.env.local` and `.env.example`.
4. **Subscribe route** — Create `src/app/api/newsletter-subscribe/route.ts`.
5. **Confirm route** — Create `src/app/api/newsletter-confirm/route.ts`.
6. **Email templates** — Create `emails/ConfirmSubscriptionEmail.tsx` and `emails/WelcomeEmail.tsx`.
7. **Component** — Create `src/components/global/NewsletterSignup.tsx` with `full` and `compact` variants.
8. **Placement** — Add to homepage, article page, footer (compact), support page.
9. **QA** — End-to-end test the double opt-in flow; verify Sanity doc status changes; verify Resend audience sync.

## Files Affected

- `src/models/schema/newsletterSubscribe.ts` — upgraded schema
- `src/app/api/newsletter-subscribe/route.ts` — **new file**
- `src/app/api/newsletter-confirm/route.ts` — **new file**
- `emails/ConfirmSubscriptionEmail.tsx` — **new file**
- `emails/WelcomeEmail.tsx` — **new file**
- `src/components/global/NewsletterSignup.tsx` — **new file**
- `src/app/(user)/page.tsx` — add `<NewsletterSignup />` between feed sections
- `src/app/(user)/articles/[slug]/page.tsx` — add `<NewsletterSignup source="article" />` after body
- `src/components/global/Footer.tsx` — add `<NewsletterSignup variant="compact" source="footer" />`
- `src/app/(user)/support/page.tsx` — add `<NewsletterSignup source="support" />`
- `.env.example` — add new env vars

## Deliverables Checklist

### Dependencies
- [ ] `resend` package installed
- [ ] `@react-email/components` package installed

### Schema
- [ ] `newsletterSubscribe` upgraded with: `firstName`, `status`, `confirmToken`, `gdprConsent`, `confirmedAt`, `unsubscribedAt`, `resendContactId`, `source`
- [ ] Preview shows email + status emoji

### API Routes
- [ ] `/api/newsletter-subscribe` validates with zod, deduplicates, creates Sanity doc, sends confirmation email
- [ ] `/api/newsletter-confirm` finds pending subscriber, patches to active, adds to Resend audience, sends welcome email
- [ ] Both routes return correct HTTP status codes
- [ ] Email enumeration protected (no different response for existing subscribers)
- [ ] Resend failure is non-fatal for confirmation route

### Email Templates
- [ ] `ConfirmSubscriptionEmail` renders with confirmation button
- [ ] `WelcomeEmail` renders with mission copy and CTA
- [ ] Both templates use `#D70606` brand red
- [ ] Both templates have unsubscribe link text

### Component
- [ ] `NewsletterSignup` `full` variant: first name + email + GDPR checkbox + submit
- [ ] `NewsletterSignup` `compact` variant: email + GDPR checkbox inline
- [ ] Loading state with spinner during submission
- [ ] Success state with "Check your inbox" message
- [ ] Error state with human-readable message
- [ ] GDPR checkbox present and required
- [ ] Dark mode verified

### Placement
- [ ] Full variant on homepage between feed sections
- [ ] Full variant on article pages below body (`source="article"`)
- [ ] Compact variant in Footer (`source="footer"`)
- [ ] Full variant on `/support` page (`source="support"`)

### QA
- [ ] Full end-to-end flow tested: subscribe → confirmation email received → click link → status = active in Sanity → contact in Resend audience → welcome email received
- [ ] Duplicate subscription handled silently
- [ ] Invalid email rejected with error message
- [ ] GDPR checkbox unchecked prevented with error message
- [ ] Resend env vars documented in `.env.example`
