// src/app/api/newsletter-subscribe/route.ts
// News newsletter subscribe endpoint — double opt-in via Resend.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { subscribeToList } from '@/lib/newsletter/service';
import { NEWS_NEWSLETTER } from '@/lib/newsletter/types';
import { makeRatelimiter } from '@/lib/bookstore/ratelimit';

const newsletterLimiter = makeRatelimiter(5, 300);

function getIp(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

const schema = z.object({
  email: z.string().email('Valid email address required').toLowerCase().trim(),
  firstName: z.string().max(100).trim().optional(),
  gdprConsent: z.boolean().refine((v) => v === true, {
    message: 'You must consent to receive emails',
  }),
  source: z.enum(['homepage', 'article', 'footer', 'support']).optional(),
});

export async function POST(req: NextRequest) {
  if (newsletterLimiter) {
    const result = await newsletterLimiter.limit(`newsletter:${getIp(req)}`);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Too many requests — please try again later' },
        { status: 429 }
      );
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  try {
    const result = await subscribeToList(NEWS_NEWSLETTER, parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[newsletter-subscribe]', err);
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
