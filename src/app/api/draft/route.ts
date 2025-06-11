/* eslint-disable import/prefer-default-export */
// src/app/api/draft/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { client } from '@/lib/sanity/lib/client';
import { readToken as token } from '@/lib/sanity/lib/tokens';

const clientWithToken = client.withConfig({ token });

export async function GET(req: NextRequest, res: NextResponse) {
  // Ensure req.url is defined before passing it to validatePreviewUrl
  const url = req.url || '';
  const { isValid, redirectTo = '/' } = await validatePreviewUrl(
    clientWithToken,
    url // Use the guaranteed non-undefined url here
  );

  if (!isValid) {
    return new Response('Invalid secret', { status: 401 });
  }

  // Enable draft mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to root path if (redirectTo) {
  redirect(redirectTo);
}
