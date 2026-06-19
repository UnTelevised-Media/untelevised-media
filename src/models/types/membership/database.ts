// src/lib/membership/database.types.ts
// Type stubs for the untelevised-membership Supabase project.
// Replace with output of `supabase gen types typescript --project-id <membership-project-id>`
// once the project is created and the schema is applied.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MembershipTier = 'supporter' | 'contributor' | 'patron';
export type MembershipStatus = 'active' | 'cancelled' | 'past_due' | 'incomplete';

export interface MembershipDatabase {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          clerk_user_id: string | null;
          email: string;
          stripe_customer_id: string;
          stripe_subscription_id: string | null;
          tier: MembershipTier;
          status: MembershipStatus;
          member_since: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id?: string | null;
          email: string;
          stripe_customer_id: string;
          stripe_subscription_id?: string | null;
          tier: MembershipTier;
          status?: MembershipStatus;
          member_since?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string | null;
          email?: string;
          stripe_customer_id?: string;
          stripe_subscription_id?: string | null;
          tier?: MembershipTier;
          status?: MembershipStatus;
          member_since?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      membership_tier: MembershipTier;
      membership_status: MembershipStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
