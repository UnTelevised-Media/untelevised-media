// src/lib/auth/roles-utils.ts
// Pure, framework-agnostic role utilities — no Clerk server imports.
// These are safe to import in any context (server, client, tests).
//
// Role hierarchy: admin > editor > author; sales is a restricted peer (orders only).

export type PortalRole = 'admin' | 'editor' | 'author' | 'sales';

export interface UserWithRole {
  id: string;
  role: PortalRole | null;
}

/**
 * Extract the portal role from a Clerk publicMetadata object.
 * Works with any plain object — no Clerk types required.
 */
export function getRoleFromMeta(meta: Record<string, unknown>): PortalRole | null {
  const role = meta?.role;
  if (role === 'admin' || role === 'editor' || role === 'author' || role === 'sales') {
    return role as PortalRole;
  }
  // Backwards-compat: legacy `admin: true` flag is treated as admin role
  if (meta?.admin === true || meta?.admin === 'true') return 'admin';
  return null;
}

/**
 * Check if a resolved role satisfies the minimum required role.
 * Hierarchy: admin > editor > author; sales is a peer of author (neither contains the other).
 */
export function hasRole(role: PortalRole | null, required: PortalRole): boolean {
  if (role === null) return false;
  if (role === 'admin') return true;
  if (required === 'admin') return false;
  if (required === 'editor') return role === 'editor';
  if (required === 'author') return role === 'editor' || role === 'author';
  // required === 'sales' — sales satisfies only 'sales' checks
  if (required === 'sales') return role === 'sales' || role === 'admin';
  return false;
}

/** Returns true if the role has any portal access. */
export function hasAnyPortalRole(role: PortalRole | null): boolean {
  return role !== null;
}

/** Returns true if the role is the restricted sales role (orders only). */
export function isSalesOnly(role: PortalRole | null): boolean {
  return role === 'sales';
}
