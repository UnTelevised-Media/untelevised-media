// src/app/api/bookstore/download/route.ts
// GET /api/bookstore/download?order_item_id=...
// Validates the requesting user owns the download, checks limits and expiry,
// atomically claims a download slot, then generates a short-lived signed URL.
// Returns { url } for direct browser download.

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { shopServiceClient, writeAuditLog } from '@/lib/bookstore/supabase';
import { checkDownloadRate } from '@/lib/bookstore/ratelimit';

const SIGNED_URL_TTL_SECONDS = 15 * 60; // 15 minutes

export async function GET(req: NextRequest) {
  const rl = await checkDownloadRate(req);
  if (rl.limited) {
    return NextResponse.json(
      { error: 'Too many requests — please wait a moment' },
      { status: 429 }
    );
  }

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

  // Check expiry before claiming a slot
  if (download.expires_at && new Date(download.expires_at) < new Date()) {
    void writeAuditLog({ eventType: 'download_expired', userId, details: { orderItemId } });
    return NextResponse.json({ error: 'Download link has expired' }, { status: 410 });
  }

  // Fast pre-check to return a clear error before the RPC call.
  // The RPC enforces the actual limit atomically; this check is only for UX.
  if (download.download_count >= download.max_downloads) {
    void writeAuditLog({ eventType: 'download_limit_reached', userId, details: { orderItemId } });
    return NextResponse.json({ error: 'Maximum downloads reached' }, { status: 403 });
  }

  if (!download.supabase_storage_path) {
    return NextResponse.json({ error: 'File not yet available' }, { status: 404 });
  }

  // Atomically claim a download slot via a stored procedure that uses FOR UPDATE.
  // This prevents the TOCTOU race where concurrent requests both read the same
  // count, both see it below the limit, and both succeed — exceeding the cap.
  const { data: allowed, error: rpcError } = await shopServiceClient.rpc(
    'increment_download_if_allowed',
    { p_download_id: download.id }
  );

  if (rpcError) {
    console.error('[shop/download] RPC error:', rpcError.message);
    return NextResponse.json({ error: 'Could not process download' }, { status: 500 });
  }

  if (!allowed) {
    void writeAuditLog({ eventType: 'download_limit_reached', userId, details: { orderItemId } });
    return NextResponse.json({ error: 'Maximum downloads reached' }, { status: 403 });
  }

  // Generate signed URL — { download: filename } adds Content-Disposition: attachment
  // so the browser saves the file instead of opening it in a tab.
  const filename = download.supabase_storage_path.split('/').pop() ?? 'download';
  const { data: signedData, error: signError } = await shopServiceClient.storage
    .from('digital-books')
    .createSignedUrl(download.supabase_storage_path, SIGNED_URL_TTL_SECONDS, {
      download: filename,
    });

  if (signError || !signedData?.signedUrl) {
    console.error('[shop/download] Signed URL error:', signError?.message);
    // The slot was already claimed; the user can retry and it will count against their limit.
    // This is intentional — storage errors are operational issues, not user errors.
    return NextResponse.json({ error: 'Could not generate download link' }, { status: 500 });
  }

  void writeAuditLog({
    eventType: 'download_success',
    userId,
    details: { orderItemId, downloadCount: download.download_count + 1 },
  });

  return NextResponse.json({ url: signedData.signedUrl });
}
