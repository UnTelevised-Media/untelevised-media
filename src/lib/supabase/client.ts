import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for public/anonymous operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-only client with service role key for privileged operations
export function getServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  }

  return createClient(supabaseUrl || '', serviceRoleKey);
}

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
