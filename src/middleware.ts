// src/middleware.ts
import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getRoleFromMeta } from '@/lib/auth/roles-utils';

const isAdminRoute = createRouteMatcher(['/admin(/.*)?']);
const isPortalRoute = createRouteMatcher(['/portal(/.*)?', '/api/portal(/.*)?']);
const isPortalOrdersRoute = createRouteMatcher([
  '/portal/orders(/.*)?',
  '/api/portal/orders(/.*)?',
]);

export default clerkMiddleware(async (auth, req) => {
  // ── Legacy /admin route guard ──────────────────────────────────────────────
  if (isAdminRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const adminValue = user.publicMetadata?.admin;
    const isAdmin = adminValue === true || adminValue === 'true';
    if (!isAdmin) return NextResponse.redirect(new URL('/', req.url));
  }

  // ── Portal route guard ─────────────────────────────────────────────────────
  if (isPortalRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = getRoleFromMeta((user.publicMetadata ?? {}) as Record<string, unknown>);

    // No role → no portal access
    if (!role) return NextResponse.redirect(new URL('/', req.url));

    // Sales role: only /portal/orders (and sub-paths) is allowed
    if (role === 'sales' && !isPortalOrdersRoute(req)) {
      return NextResponse.redirect(new URL('/portal/orders', req.url));
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
