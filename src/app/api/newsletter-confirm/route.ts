// src/app/api/newsletter-confirm/route.ts
// News newsletter confirmation — validates token, activates subscriber, sends welcome email.
import { NextRequest, NextResponse } from 'next/server';
import { confirmSubscription } from '@/lib/newsletter/service';
import { NEWS_NEWSLETTER } from '@/lib/newsletter/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://untelevised.media').replace(
    /\/$/,
    ''
  );

  if (!token) {
    return NextResponse.redirect(new URL('/?subscribed=error', siteUrl));
  }

  try {
    const { redirectUrl } = await confirmSubscription(NEWS_NEWSLETTER, token);
    return NextResponse.redirect(new URL(redirectUrl));
  } catch (err) {
    console.error('[newsletter-confirm]', err);
    return NextResponse.redirect(new URL('/?subscribed=error', siteUrl));
  }
}
