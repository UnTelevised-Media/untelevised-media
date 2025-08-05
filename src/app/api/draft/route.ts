/* eslint-disable import/prefer-default-export */
// src/app/api/draft/route.ts
import { NextRequest } from 'next/server';
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { client } from '@/lib/sanity/lib/client';
import { readToken as token } from '@/lib/sanity/lib/tokens';

const clientWithToken = client.withConfig({ token });

export async function GET(request: NextRequest) {
  // Validate the preview URL with Sanity
  const { isValid, redirectTo = '/' } = await validatePreviewUrl(clientWithToken, request.url);

  if (!isValid) {
    return new Response('Invalid secret', { status: 401 });
  }

  // Enable draft mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to the specified path
  redirect(redirectTo);
}
