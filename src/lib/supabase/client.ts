import 'server-only';

import { createClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      view_events: {
        Row: {
          id: number;
          slug: string;
          ip_hash: string;
          viewed_at: string;
          created_date: string;
        };
        Insert: {
          slug: string;
          ip_hash: string;
          viewed_at?: string;
          created_date?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          ip_hash?: string;
          viewed_at?: string;
          created_date?: string;
        };
      };
    };
  };
};

let anonClient: ReturnType<typeof createClient> | null = null;
let serverClient: ReturnType<typeof createClient> | null = null;

// Lazy-load public client for anonymous operations
export function getAnonClient() {
  if (anonClient) return anonClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  anonClient = createClient(supabaseUrl, supabaseAnonKey);
  return anonClient;
}

// Lazy-load server-only client with service role key for privileged operations
export function getServerClient() {
  if (serverClient) return serverClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  serverClient = createClient(supabaseUrl, serviceRoleKey);
  return serverClient;
}
