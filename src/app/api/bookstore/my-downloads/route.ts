// src/app/api/bookstore/my-downloads/route.ts
// GET /api/bookstore/my-downloads — returns the authenticated user's digital download records.
//
// SERVICE ROLE JUSTIFICATION:
// This route uses shopServiceClient (service role) because the app authenticates
// via Clerk, not Supabase Auth. Without a Supabase JWT from Clerk, the anon client
// sees auth.jwt() = null and Supabase RLS policies deny all reads.
//
// Application-level scoping replaces database-level RLS:
//   1. Clerk auth() verifies the request — fails fast with 401 if unauthenticated
//   2. Customer lookup is filtered by the Clerk-verified userId (clerk_user_id = userId)
//   3. Download lookup is filtered by the resolved customer.id
//
// This achieves the same row-level isolation as the RLS policies in
// 20260428000001_bookstore_schema.sql. The upgrade path to native Clerk+Supabase
// JWT integration is documented in 20260522000002_rls_service_role_documentation.sql.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getShopServiceClient } from '@/lib/bookstore/supabase';
import { checkDownloadRate } from '@/lib/bookstore/ratelimit';

export async function GET(req: NextRequest) {
  // Rate limit — same budget as the download endpoint (30 req/60 s per IP)
  const rl = await checkDownloadRate(req);
  if (rl.limited) {
    return NextResponse.json(
      { error: 'Too many requests — please wait a moment' },
      { status: 429 }
    );
  }

  // Step 1: Verify Clerk auth — this MUST happen before any service-role call.
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Steps 2 & 3: Resolve the Supabase customer ID for the verified Clerk user,
  // then fetch only that customer's downloads. Both queries are scoped by
  // the Clerk-verified identity — service role is never used with open WHERE clauses.
  const db = getShopServiceClient();

  const { data: customer } = await db
    .from('customers')
    .select('id')
    .eq('clerk_user_id', userId) // application-level scope: only this user's row
    .maybeSingle();

  if (!customer) return NextResponse.json({ downloads: [] });

  const { data: downloads, error } = await db
    .from('digital_downloads')
    .select(
      `
      id,
      order_item_id,
      download_count,
      max_downloads,
      expires_at,
      supabase_storage_path,
      order_items (
        book_title,
        format_label,
        order_id
      )
    `
    )
    .eq('customer_id', customer.id) // application-level scope: only this customer's downloads
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[my-downloads]', error.message);
    return NextResponse.json({ error: 'Failed to load downloads' }, { status: 500 });
  }

  return NextResponse.json({ downloads: downloads ?? [] });
}
