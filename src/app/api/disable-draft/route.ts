/* eslint-disable import/prefer-default-export */
// src/app/api/disable-draft/route.ts

import { draftMode } from 'next/headers';
import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  // Disable draft mode
  const draft = await draftMode();
  draft.disable();

  // Get the redirect URL from query params or default to home
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get('redirect') ?? '/';

  // Redirect to the specified path
  redirect(redirectTo);
}
