// src/app/api/bookstore/newsletter/unsubscribe/route.ts
// Bookstore newsletter unsubscribe — validates token, marks subscriber inactive.
import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeFromList } from '@/lib/newsletter/service';
import { BOOKSTORE_NEWSLETTER } from '@/lib/newsletter/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://untelevised.media').replace(
    /\/$/,
    ''
  );

  if (!token) {
    return NextResponse.redirect(new URL('/bookstore?unsubscribed=1', siteUrl));
  }

  try {
    const { redirectUrl } = await unsubscribeFromList(BOOKSTORE_NEWSLETTER, token);
    return NextResponse.redirect(new URL(redirectUrl));
  } catch (err) {
    console.error('[bookstore/newsletter/unsubscribe]', err);
    return NextResponse.redirect(new URL('/bookstore?unsubscribed=1', siteUrl));
  }
}
