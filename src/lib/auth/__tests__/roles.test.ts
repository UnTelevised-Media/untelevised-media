// src/lib/auth/__tests__/roles.test.ts
// Unit tests for the pure role utilities in roles-utils.ts.
// getRoleFromMeta and hasRole are pure functions — no Clerk context, no mocks needed.
// Async server helpers (requireRole, isAdmin, etc.) require a live Clerk environment
// and are covered by end-to-end tests, not unit tests.

import { getRoleFromMeta, hasRole } from '../roles-utils';

// ---------------------------------------------------------------------------
// getRoleFromMeta
// ---------------------------------------------------------------------------
describe('getRoleFromMeta', () => {
  it('returns "admin" when role is "admin"', () => {
    expect(getRoleFromMeta({ role: 'admin' })).toBe('admin');
  });

  it('returns "editor" when role is "editor"', () => {
    expect(getRoleFromMeta({ role: 'editor' })).toBe('editor');
  });

  it('returns "author" when role is "author"', () => {
    expect(getRoleFromMeta({ role: 'author' })).toBe('author');
  });

  it('returns "admin" for legacy admin === true', () => {
    expect(getRoleFromMeta({ admin: true })).toBe('admin');
  });

  it('returns "admin" for legacy admin === "true" (string)', () => {
    expect(getRoleFromMeta({ admin: 'true' })).toBe('admin');
  });

  it('returns null for unknown role value', () => {
    expect(getRoleFromMeta({ role: 'viewer' })).toBeNull();
  });

  it('returns null for empty metadata', () => {
    expect(getRoleFromMeta({})).toBeNull();
  });

  it('prefers role field over legacy admin field when both present', () => {
    expect(getRoleFromMeta({ role: 'editor', admin: true })).toBe('editor');
  });
});

// ---------------------------------------------------------------------------
// hasRole — role hierarchy enforcement
// ---------------------------------------------------------------------------
describe('hasRole', () => {
  describe('null role fails all checks', () => {
    it('null vs author', () => expect(hasRole(null, 'author')).toBe(false));
    it('null vs editor', () => expect(hasRole(null, 'editor')).toBe(false));
    it('null vs admin', () => expect(hasRole(null, 'admin')).toBe(false));
  });

  describe('admin passes every check', () => {
    it('admin vs author', () => expect(hasRole('admin', 'author')).toBe(true));
    it('admin vs editor', () => expect(hasRole('admin', 'editor')).toBe(true));
    it('admin vs admin', () => expect(hasRole('admin', 'admin')).toBe(true));
  });

  describe('editor passes editor and author, not admin', () => {
    it('editor vs author', () => expect(hasRole('editor', 'author')).toBe(true));
    it('editor vs editor', () => expect(hasRole('editor', 'editor')).toBe(true));
    it('editor vs admin', () => expect(hasRole('editor', 'admin')).toBe(false));
  });

  describe('author passes only author check', () => {
    it('author vs author', () => expect(hasRole('author', 'author')).toBe(true));
    it('author vs editor', () => expect(hasRole('author', 'editor')).toBe(false));
    it('author vs admin', () => expect(hasRole('author', 'admin')).toBe(false));
  });
});
