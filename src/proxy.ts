// src/proxy.ts
import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { PortalRole } from '@/lib/auth/roles';

const isAdminRoute = createRouteMatcher(['/admin(/.*)?']);
const isPortalRoute = createRouteMatcher(['/portal(/.*)?', '/api/portal(/.*)?']);

/** Extract the portal role from raw Clerk publicMetadata (no User type import needed in edge). */
function getRoleFromMeta(meta: Record<string, unknown>): PortalRole | null {
  const role = meta?.role;
  if (role === 'admin' || role === 'editor' || role === 'author') return role as PortalRole;
  if (meta?.admin === true || meta?.admin === 'true') return 'admin';
  return null;
}

// Social media / link-preview crawlers must bypass Clerk entirely so they
// can read page HTML and og:image URLs without triggering auth challenges.
const SOCIAL_CRAWLERS =
  /facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|Googlebot-Image/i;

export const proxy = clerkMiddleware(async (auth, req) => {
  // Pass social crawlers straight through — no auth processing needed.
  const ua = req.headers.get('user-agent') ?? '';
  if (SOCIAL_CRAWLERS.test(ua)) {
    return NextResponse.next();
  }

  // -------------------------------------------------------------------------
  // Legacy /admin routes — kept exactly as before
  // -------------------------------------------------------------------------
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

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // -------------------------------------------------------------------------
  // Portal routes — require auth + any portal role (admin | editor | author)
  // -------------------------------------------------------------------------
  if (isPortalRoute(req)) {
    const { userId } = await auth();

    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Fetch fresh publicMetadata — never trust the JWT alone for role checks
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const meta = (user.publicMetadata ?? {}) as Record<string, unknown>;
    const role = getRoleFromMeta(meta);

    if (!role) {
      // Authenticated but has no portal role — redirect home
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
});

export const proxyConfig = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
