// src/lib/membership/supabase.ts
// Typed Supabase clients for the untelevised-membership project.
// membershipAnonClient    — anon key, safe for public active-count reads (RLS enforced)
// membershipServiceClient — service role key, server-only writes, bypasses RLS

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { MembershipDatabase } from './database.types';

function getMembershipUrl(): string {
  return process.env.SUPABASE_MEMBERSHIP_URL ?? '';
}

let _anonClient: SupabaseClient<MembershipDatabase> | null = null;
let _serviceClient: SupabaseClient<MembershipDatabase> | null = null;

/** Anon client — for public reads gated by RLS (e.g. active member count). */
export function getMembershipAnonClient(): SupabaseClient<MembershipDatabase> {
  if (!_anonClient) {
    const url = getMembershipUrl();
    if (!url) throw new Error('[membership/supabase] SUPABASE_MEMBERSHIP_URL is not set');
    _anonClient = createClient<MembershipDatabase>(
      url,
      process.env.SUPABASE_MEMBERSHIP_ANON_KEY ?? '',
      { auth: { persistSession: false } }
    );
  }
  return _anonClient;
}

/** Service-role client — server-only. Never import from client components. */
export function getMembershipServiceClient(): SupabaseClient<MembershipDatabase> {
  if (!_serviceClient) {
    const url = getMembershipUrl();
    if (!url) throw new Error('[membership/supabase] SUPABASE_MEMBERSHIP_URL is not set');
    _serviceClient = createClient<MembershipDatabase>(
      url,
      process.env.SUPABASE_MEMBERSHIP_SERVICE_ROLE_KEY ?? '',
      { auth: { persistSession: false } }
    );
  }
  return _serviceClient;
}

export const membershipAnonClient = new Proxy({} as SupabaseClient<MembershipDatabase>, {
  get(_, prop) {
    return (getMembershipAnonClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const membershipServiceClient = new Proxy({} as SupabaseClient<MembershipDatabase>, {
  get(_, prop) {
    return (getMembershipServiceClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
