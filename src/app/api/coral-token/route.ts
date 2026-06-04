// src/app/api/coral-token/route.ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

/**
 * GET /api/coral-token
 *
 * Verifies the active Clerk session and mints a short-lived HS256 JWT that
 * Coral uses for SSO.
 *
 * Payload structure follows https://docs.coralproject.net/sso — all user
 * fields must be nested under a `user` object, NOT at the top level.
 *
 * Unauthenticated requests receive { token: null } so CommentsSection
 * can render a guest view without a 401.
 */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ token: null });
  }

  const secret = process.env.CORAL_SSO_SECRET;
  const keyId = process.env.CORAL_SSO_KEY_ID;
  if (!secret || !keyId) {
    console.error('[coral-token] CORAL_SSO_SECRET or CORAL_SSO_KEY_ID is not set');
    return NextResponse.json({ token: null }, { status: 500 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ token: null });
  }

  const email = user.emailAddresses[0]?.emailAddress ?? '';
  const username = user.username ?? user.firstName ?? user.lastName ?? 'Reader';

  // Clerk publicMetadata.role === 'admin' | 'staff' → Coral MODERATOR
  const clerkRole = (user.publicMetadata as { role?: string })?.role;
  const coralRole = clerkRole === 'admin' || clerkRole === 'staff' ? 'MODERATOR' : undefined;

  // Coral requires all user fields nested under `user` — NOT top-level claims.
  // See: https://docs.coralproject.net/sso
  const coralUser: Record<string, unknown> = {
    id: userId,
    email,
    username,
  };
  if (coralRole) coralUser.role = coralRole;

  const encodedSecret = new TextEncoder().encode(secret);

  const token = await new SignJWT({ user: coralUser })
    .setProtectedHeader({ alg: 'HS256', kid: keyId })
    .setJti(randomUUID()) // enables logout via jti
    .setIssuedAt() // enables automatic user detail sync in Coral
    .setExpirationTime('24h')
    .sign(encodedSecret);

  // Token is valid for 24 h; cache privately for 5 min so repeated article
  // page loads in the same session don't each hit Clerk's API.
  return NextResponse.json(
    { token },
    {
      headers: { 'Cache-Control': 'private, max-age=300, stale-while-revalidate=600' },
    }
  );
}
