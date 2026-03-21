// src/app/api/coral-token/route.ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';

/**
 * GET /api/coral-token
 *
 * Verifies the active Clerk session and mints a short-lived HS256 JWT that
 * Coral uses for SSO. Unauthenticated requests receive { token: null } so
 * the CommentsSection can render a guest view without a 401.
 */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ token: null });
  }

  const secret = process.env.CORAL_SSO_SECRET;
  if (!secret) {
    console.error('[coral-token] CORAL_SSO_SECRET is not set');
    return NextResponse.json({ token: null }, { status: 500 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ token: null });
  }

  const email = user.emailAddresses[0]?.emailAddress ?? '';
  const username = user.username ?? user.firstName ?? user.lastName ?? 'Reader';

  // Determine Coral role — Clerk publicMetadata.role === 'admin' | 'staff' → moderator
  const clerkRole = (user.publicMetadata as { role?: string })?.role;
  const coralRole = clerkRole === 'admin' || clerkRole === 'staff' ? 'MODERATOR' : undefined;

  const payload: Record<string, unknown> = {
    sub: userId,
    email,
    username,
  };
  if (coralRole) payload.role = coralRole;

  const encodedSecret = new TextEncoder().encode(secret);

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(encodedSecret);

  return NextResponse.json({ token });
}
