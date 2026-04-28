// src/lib/auth/roles.ts
// Server-side role-based access control helpers.
// Roles are stored in Clerk publicMetadata.role — set only by admin server actions.
// For pure utilities (no Clerk context), see roles-utils.ts.

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { User } from '@clerk/nextjs/server';
import { getRoleFromMeta, hasRole, isSalesOnly } from './roles-utils';

export type { PortalRole, UserWithRole } from './roles-utils';
export { getRoleFromMeta, hasRole, isSalesOnly } from './roles-utils';

export function getRoleFromUser(user: User): import('./roles-utils').PortalRole | null {
  return getRoleFromMeta((user.publicMetadata ?? {}) as Record<string, unknown>);
}

export async function getCurrentRole(): Promise<import('./roles-utils').PortalRole | null> {
  const user = await currentUser();
  if (!user) return null;
  return getRoleFromUser(user);
}

export async function getCurrentUserWithRole(): Promise<
  import('./roles-utils').UserWithRole | null
> {
  const user = await currentUser();
  if (!user) return null;
  return { id: user.id, role: getRoleFromUser(user) };
}

export async function requireRole(
  role: import('./roles-utils').PortalRole
): Promise<import('./roles-utils').UserWithRole> {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/portal');

  const user = await currentUser();
  if (!user) redirect('/sign-in?redirect_url=/portal');

  const userRole = getRoleFromUser(user);
  if (!hasRole(userRole, role)) redirect('/');

  return { id: user.id, role: userRole };
}

export async function requireAdmin(): Promise<import('./roles-utils').UserWithRole> {
  return requireRole('admin');
}

export async function requireEditor(): Promise<import('./roles-utils').UserWithRole> {
  return requireRole('editor');
}

export async function requireAuthor(): Promise<import('./roles-utils').UserWithRole> {
  return requireRole('author');
}

/** Require at least portal access (any role including sales). */
export async function requireAnyPortalRole(): Promise<import('./roles-utils').UserWithRole> {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/portal');

  const user = await currentUser();
  if (!user) redirect('/sign-in?redirect_url=/portal');

  const userRole = getRoleFromUser(user);
  if (!userRole) redirect('/');

  // Sales role can only access orders
  if (isSalesOnly(userRole)) {
    // Will be enforced per-page; just ensure they're logged in with a role
  }

  return { id: user.id, role: userRole };
}

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
  return role !== null && role !== 'sales';
}

export async function isSales(): Promise<boolean> {
  const role = await getCurrentRole();
  return role === 'sales' || role === 'admin';
}
