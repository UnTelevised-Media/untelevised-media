// src/lib/bookstore/supabase.ts
// Typed Supabase clients for the untelevised-shop project.
// shopClient     — anon key, safe for client-side authenticated reads (RLS enforced)
// shopServiceClient — service role key, server-only writes, bypasses RLS
// TODO: fill SUPABASE_SHOP_URL, SUPABASE_SHOP_ANON_KEY, SUPABASE_SHOP_SERVICE_ROLE_KEY in .env.local

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const shopUrl = process.env.SUPABASE_SHOP_URL ?? '';
const shopAnonKey = process.env.SUPABASE_SHOP_ANON_KEY ?? '';
const shopServiceKey = process.env.SUPABASE_SHOP_SERVICE_ROLE_KEY ?? '';

if (process.env.NODE_ENV === 'production' && !shopUrl) {
  console.warn('[shop/supabase] SUPABASE_SHOP_URL is not set — shop features will not function');
}

/** Anon client — for authenticated client reads (RLS enforced). */
export const shopClient = createClient<Database>(shopUrl, shopAnonKey, {
  auth: { persistSession: false },
});

/** Service-role client — server-only. Never import from client components. */
export const shopServiceClient = createClient<Database>(shopUrl, shopServiceKey, {
  auth: { persistSession: false },
});
