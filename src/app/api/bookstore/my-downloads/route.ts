// src/app/api/bookstore/my-downloads/route.ts
// GET /api/bookstore/my-downloads — returns the authenticated user's digital download records.

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { shopServiceClient } from '@/lib/bookstore/supabase';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: customer } = await shopServiceClient
    .from('customers')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (!customer) return NextResponse.json({ downloads: [] });

  const { data: downloads, error } = await shopServiceClient
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
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[my-downloads]', error.message);
    return NextResponse.json({ error: 'Failed to load downloads' }, { status: 500 });
  }

  return NextResponse.json({ downloads: downloads ?? [] });
}
