// src/lib/auth/roles.ts
// Server-side role-based access control helpers for the Author Portal.
// Roles are stored in Clerk publicMetadata.role — set only by admin server actions.
// For pure utilities (no Clerk context), see roles-utils.ts.

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { User } from '@clerk/nextjs/server';
import { getRoleFromMeta, hasRole } from './roles-utils';

export type { PortalRole, UserWithRole } from './roles-utils';
export { getRoleFromMeta, hasRole } from './roles-utils';

/** Extract the portal role from a full Clerk User object. */
export function getRoleFromUser(user: User): import('./roles-utils').PortalRole | null {
  return getRoleFromMeta((user.publicMetadata ?? {}) as Record<string, unknown>);
}

// ---------------------------------------------------------------------------
// Server-side helpers (use inside Server Components / Server Actions / Route Handlers)
// ---------------------------------------------------------------------------

/** Returns the current user's resolved portal role, or null if not authenticated / no role. */
export async function getCurrentRole(): Promise<import('./roles-utils').PortalRole | null> {
  const user = await currentUser();
  if (!user) return null;
  return getRoleFromUser(user);
}

/** Returns the current user mapped to { id, role }. Returns null if not signed in. */
export async function getCurrentUserWithRole(): Promise<
  import('./roles-utils').UserWithRole | null
> {
  const user = await currentUser();
  if (!user) return null;
  return { id: user.id, role: getRoleFromUser(user) };
}

/**
 * Require the current user to have at least the given role.
 * Redirects to /sign-in if not authenticated, or / if lacking the role.
 * Use this at the top of Server Components or Server Actions that need role-gating.
 */
export async function requireRole(
  role: import('./roles-utils').PortalRole
): Promise<import('./roles-utils').UserWithRole> {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in?redirect_url=/portal');
  }

  const user = await currentUser();
  if (!user) redirect('/sign-in?redirect_url=/portal');

  const userRole = getRoleFromUser(user);
  if (!hasRole(userRole, role)) {
    redirect('/');
  }

  return { id: user.id, role: userRole };
}

/** Convenience wrapper — require admin role. */
export async function requireAdmin(): Promise<import('./roles-utils').UserWithRole> {
  return requireRole('admin');
}

/** Convenience wrapper — require editor or above. */
export async function requireEditor(): Promise<import('./roles-utils').UserWithRole> {
  return requireRole('editor');
}

/** Convenience wrapper — require author or above. */
export async function requireAuthor(): Promise<import('./roles-utils').UserWithRole> {
  return requireRole('author');
}

// ---------------------------------------------------------------------------
// Boolean predicates (non-throwing — return false instead of redirecting)
// ---------------------------------------------------------------------------

export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentRole();
  return role === 'admin';
}

export async function isEditor(): Promise<boolean> {
  const role = await getCurrentRole();
  return role === 'editor' || role === 'admin';
}

export async function isAuthor(): Promise<boolean> {
  const role = await getCurrentRole();
  return role !== null;
}
