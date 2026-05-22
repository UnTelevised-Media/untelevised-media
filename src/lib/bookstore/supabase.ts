// src/lib/bookstore/supabase.ts
// Typed Supabase clients for the untelevised-shop project.
// shopClient        — anon key, safe for client-side authenticated reads (RLS enforced)
// shopServiceClient — service role key, server-only writes, bypasses RLS
// TODO: fill SUPABASE_SHOP_URL, SUPABASE_SHOP_ANON_KEY, SUPABASE_SHOP_SERVICE_ROLE_KEY in .env.local

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

function getShopUrl() {
  return process.env.SUPABASE_SHOP_URL ?? '';
}

// Lazy singletons — only instantiated on first use so missing env vars don't crash the build.
let _shopClient: SupabaseClient<Database> | null = null;
let _shopServiceClient: SupabaseClient<Database> | null = null;

/** Anon client — for authenticated client reads (RLS enforced). */
export function getShopClient(): SupabaseClient<Database> {
  if (!_shopClient) {
    const url = getShopUrl();
    if (!url) throw new Error('[shop/supabase] SUPABASE_SHOP_URL is not set');
    _shopClient = createClient<Database>(url, process.env.SUPABASE_SHOP_ANON_KEY ?? '', {
      auth: { persistSession: false },
    });
  }
  return _shopClient;
}

/** Service-role client — server-only. Never import from client components. */
export function getShopServiceClient(): SupabaseClient<Database> {
  if (!_shopServiceClient) {
    const url = getShopUrl();
    if (!url) throw new Error('[shop/supabase] SUPABASE_SHOP_URL is not set');
    _shopServiceClient = createClient<Database>(
      url,
      process.env.SUPABASE_SHOP_SERVICE_ROLE_KEY ?? '',
      { auth: { persistSession: false } }
    );
  }
  return _shopServiceClient;
}

// ---------------------------------------------------------------------------
// Audit logging — fire-and-forget, never throws
// ---------------------------------------------------------------------------

export async function writeAuditLog(params: {
  eventType: string;
  userId?: string;
  orderId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}) {
  try {
    await getShopServiceClient()
      .from('audit_logs')
      .insert({
        event_type: params.eventType,
        user_id: params.userId ?? null,
        order_id: params.orderId ?? null,
        ip_address: params.ipAddress ?? null,
        user_agent: params.userAgent ?? null,
        details: params.details ?? null,
      });
  } catch {
    // Audit failure must never break the request
  }
}

// Convenience proxies that match the old API surface so callers can chain immediately.
// These throw at call time (not import time) if env vars are missing.
export const shopClient = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    return (getShopClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const shopServiceClient = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    return (getShopServiceClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
