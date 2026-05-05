// src/app/api/bookstore/newsletter/route.ts
// Bookstore newsletter signup endpoint.
// POST { email, source? } → creates bookstoreSubscriber document in Sanity.
// Rate-limited: 5 submissions / 60s per IP (via Upstash, fails open if not configured).
// Duplicate email check: skips if already subscribed.

import { NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/lib/write-client';
import { client } from '@/lib/sanity/lib/client';
import { makeRatelimiter } from '@/lib/bookstore/ratelimit';

const newsletterLimiter = makeRatelimiter(5, 60);

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  let body: { email?: string; source?: string };
  try {
    body = (await req.json()) as { email?: string; source?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const source = body.source ?? 'bookstore-home';

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Valid email address required' }, { status: 400 });
  }

  // Check for existing subscription
  const existing = await client.fetch<number>(
    `count(*[_type == "bookstoreSubscriber" && email == $email])`,
    { email },
    { cache: 'no-store' }
  );

  if (existing > 0) {
    return NextResponse.json({ ok: true, alreadySubscribed: true });
  }

  await writeClient.create({
    _type: 'bookstoreSubscriber',
    email,
    submittedAt: new Date().toISOString(),
    source,
  });

  return NextResponse.json({ ok: true });
}
