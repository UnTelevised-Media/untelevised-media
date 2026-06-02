// src/lib/membership/access.ts
// Server-only helper — check whether the current Clerk user has an active membership.
// Never import this from client components.

import { auth } from '@clerk/nextjs/server';
import { getMembershipAnonClient } from './supabase';
import type { MembershipTier } from './database.types';

/**
 * Returns the membership tier for the currently authenticated Clerk user,
 * or null if they are not signed in or have no active membership.
 */
export async function getMembershipTier(): Promise<MembershipTier | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const { data, error } = await getMembershipAnonClient()
    .from('members')
    .select('tier')
    .eq('clerk_user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('[membership/access] getMembershipTier error:', error.message);
    return null;
  }

  return (data?.tier as MembershipTier) ?? null;
}

/** Returns true if the user has any active membership tier. */
export async function isMember(): Promise<boolean> {
  return (await getMembershipTier()) !== null;
}

/** Returns true if the user is a Contributor or Patron (paid-access tiers). */
export async function hasFullAccess(): Promise<boolean> {
  const tier = await getMembershipTier();
  return tier === 'contributor' || tier === 'patron';
}
