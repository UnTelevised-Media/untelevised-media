import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      view_count: {
        Row: {
          id: number;
          slug: string;
          ip: string | null;
          ip_hash: string | null;
          city: string | null;
          state_province: string | null;
          country: string | null;
          viewed_at: string;
          created_date: string;
        };
        Insert: {
          slug: string;
          ip?: string | null;
          ip_hash?: string | null;
          city?: string | null;
          state_province?: string | null;
          country?: string | null;
          viewed_at?: string;
          created_date?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          ip?: string | null;
          ip_hash?: string | null;
          city?: string | null;
          state_province?: string | null;
          country?: string | null;
          viewed_at?: string;
          created_date?: string;
        };
      };
    };
  };
};

let anonClient: SupabaseClient<Database> | null = null;
let serverClient: SupabaseClient<Database> | null = null;

// Lazy-load public client for anonymous operations
export function getAnonClient(): SupabaseClient<Database> {
  if (anonClient) {
    return anonClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  anonClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return anonClient;
}

// Lazy-load server-only client with service role key for privileged operations
export function getServerClient(): SupabaseClient<Database> {
  if (serverClient) {
    return serverClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  serverClient = createClient<Database>(supabaseUrl, serviceRoleKey);
  return serverClient;
}
