// src/lib/auth/roles-utils.ts
// Pure, framework-agnostic role utilities — no Clerk server imports.
// These are safe to import in any context (server, client, tests).

export type PortalRole = 'admin' | 'editor' | 'author';

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
  if (role === 'admin' || role === 'editor' || role === 'author') return role as PortalRole;
  // Backwards-compat: legacy `admin: true` flag is treated as admin role
  if (meta?.admin === true || meta?.admin === 'true') return 'admin';
  return null;
}

/**
 * Check if a resolved role satisfies the minimum required role.
 * Hierarchy: admin > editor > author
 */
export function hasRole(role: PortalRole | null, required: PortalRole): boolean {
  if (role === null) return false;
  if (role === 'admin') return true; // admin passes every check
  // At this point role is 'editor' | 'author'
  if (required === 'admin') return false;
  if (required === 'editor') return role === 'editor';
  // required === 'author' — both editor and author satisfy this
  return role === 'editor' || role === 'author';
}
