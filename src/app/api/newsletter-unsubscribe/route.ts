/* eslint-disable import/prefer-default-export */
// src/app/api/newsletter-unsubscribe/route.ts
// News newsletter unsubscribe â€” validates token, marks subscriber inactive.
import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeFromList } from '@/services/newsletter/service';
import { NEWS_NEWSLETTER } from '@/models/types/newsletter';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://untelevised.media').replace(
    /\/$/,
    ''
  );

  if (!token) {
    return NextResponse.redirect(new URL('/?unsubscribed=1', siteUrl));
  }

  try {
    const { redirectUrl } = await unsubscribeFromList(NEWS_NEWSLETTER, token);
    return NextResponse.redirect(new URL(redirectUrl));
  } catch (err) {
    console.error('[newsletter-unsubscribe]', err);
    return NextResponse.redirect(new URL('/?unsubscribed=1', siteUrl));
  }
}
