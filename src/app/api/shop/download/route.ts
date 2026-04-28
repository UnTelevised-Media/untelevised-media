// src/app/api/shop/download/route.ts
// GET /api/shop/download?order_item_id=...
// Validates the requesting user owns the download, checks limits and expiry,
// generates a short-lived Supabase Storage signed URL, increments download_count.
// Returns { url } for direct browser download.

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { shopServiceClient } from '@/lib/shop/supabase';

const SIGNED_URL_TTL_SECONDS = 15 * 60; // 15 minutes

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orderItemId = req.nextUrl.searchParams.get('order_item_id');
  if (!orderItemId) {
    return NextResponse.json({ error: 'Missing order_item_id' }, { status: 400 });
  }

  // Look up the customer row by clerk_user_id
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: customer } = await shopServiceClient
    .from('customers')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (!customer) {
    return NextResponse.json({ error: 'Customer record not found' }, { status: 404 });
  }

  // Fetch the download record — must belong to this customer
  const { data: download, error: dlError } = await shopServiceClient
    .from('digital_downloads')
    .select('*')
    .eq('order_item_id', orderItemId)
    .eq('customer_id', customer.id)
    .maybeSingle();

  if (dlError || !download) {
    return NextResponse.json({ error: 'Download record not found' }, { status: 404 });
  }

  // Check expiry
  if (download.expires_at && new Date(download.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Download link has expired' }, { status: 410 });
  }

  // Check download count
  if (download.download_count >= download.max_downloads) {
    return NextResponse.json({ error: 'Maximum downloads reached' }, { status: 403 });
  }

  if (!download.supabase_storage_path) {
    return NextResponse.json({ error: 'File not yet available' }, { status: 404 });
  }

  // Generate signed URL
  const { data: signedData, error: signError } = await shopServiceClient.storage
    .from('digital-books')
    .createSignedUrl(download.supabase_storage_path, SIGNED_URL_TTL_SECONDS);

  if (signError || !signedData?.signedUrl) {
    console.error('[shop/download] Signed URL error:', signError?.message);
    return NextResponse.json({ error: 'Could not generate download link' }, { status: 500 });
  }

  // Increment counter and update timestamps
  const now = new Date().toISOString();
  await shopServiceClient
    .from('digital_downloads')
    .update({
      download_count: download.download_count + 1,
      last_downloaded_at: now,
      ...(download.first_downloaded_at == null ? { first_downloaded_at: now } : {}),
    })
    .eq('id', download.id);

  return NextResponse.json({ url: signedData.signedUrl });
}
