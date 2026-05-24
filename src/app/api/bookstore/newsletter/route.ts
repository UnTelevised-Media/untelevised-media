// src/app/api/bookstore/newsletter/route.ts
// Bookstore newsletter subscribe endpoint — double opt-in via Resend.
// Upgraded from bare Sanity write to full double opt-in flow.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { subscribeToList } from '@/lib/newsletter/service';
import { BOOKSTORE_NEWSLETTER } from '@/lib/newsletter/types';
import { makeRatelimiter } from '@/lib/bookstore/ratelimit';

const newsletterLimiter = makeRatelimiter(5, 60);

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
  source: z.enum(['bookstore-home', 'bookstore-about', 'book-detail']).optional(),
});

export async function POST(req: NextRequest) {
  if (newsletterLimiter) {
    const result = await newsletterLimiter.limit(`bookstore-newsletter:${getIp(req)}`);
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
    const result = await subscribeToList(BOOKSTORE_NEWSLETTER, {
      ...parsed.data,
      source: parsed.data.source ?? 'bookstore-home',
    });
    return NextResponse.json({ ok: result.success, message: result.message });
  } catch (err) {
    console.error('[bookstore/newsletter]', err);
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
  }
}
