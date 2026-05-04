// src/app/api/bookstore/download/guest/route.ts
// GET /api/bookstore/download/guest?token=...
// Single-use download endpoint for guest (unauthenticated) purchasers.
// Validates the one-time token, generates a short-lived signed URL, marks token used.

import { NextRequest, NextResponse } from 'next/server';
import { shopServiceClient, writeAuditLog } from '@/lib/bookstore/supabase';
import { checkDownloadRate } from '@/lib/bookstore/ratelimit';

const SIGNED_URL_TTL_SECONDS = 15 * 60; // 15 minutes

export async function GET(req: NextRequest) {
  const rl = await checkDownloadRate(req);
  if (rl.limited) {
    return new NextResponse(
      buildErrorPage('Too many requests — please wait a moment and try again.', 'error'),
      { status: 429, headers: { 'Content-Type': 'text/html' } }
    );
  }

  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const { data: record, error } = await shopServiceClient
    .from('guest_download_tokens')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (error || !record) {
    return new NextResponse(buildErrorPage('Invalid or expired download link.', 'invalid'), {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Check expiry
  if (new Date(record.expires_at) < new Date()) {
    void writeAuditLog({ eventType: 'guest_download_expired', details: { token } });
    return new NextResponse(buildErrorPage('This download link has expired.', 'expired'), {
      status: 410,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Check download count
  if (record.download_count >= record.max_downloads) {
    void writeAuditLog({ eventType: 'guest_download_used', details: { token } });
    return new NextResponse(buildErrorPage('This download link has already been used.', 'used'), {
      status: 403,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // { download: filename } adds Content-Disposition: attachment so browser saves the file.
  const filename = record.supabase_storage_path.split('/').pop() ?? 'download';
  const { data: signedData, error: signError } = await shopServiceClient.storage
    .from('digital-books')
    .createSignedUrl(record.supabase_storage_path, SIGNED_URL_TTL_SECONDS, {
      download: filename,
    });

  if (signError || !signedData?.signedUrl) {
    console.error('[guest-download] Signed URL error:', signError?.message);
    return new NextResponse(
      buildErrorPage('Could not generate download link. Please contact support.', 'error'),
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }

  // Mark token as used
  const now = new Date().toISOString();
  await shopServiceClient
    .from('guest_download_tokens')
    .update({
      download_count: record.download_count + 1,
      downloaded_at: record.downloaded_at ?? now,
    })
    .eq('id', record.id);

  void writeAuditLog({
    eventType: 'guest_download_success',
    details: { token, bookTitle: record.book_title, guestEmail: record.guest_email },
  });

  // Redirect browser directly to the signed URL (auto-download)
  return NextResponse.redirect(signedData.signedUrl, 302);
}

function buildErrorPage(message: string, reason: 'expired' | 'used' | 'invalid' | 'error') {
  const resendForm =
    reason === 'expired' || reason === 'used'
      ? `
  <hr style="border:none;border-top:1px solid #eee;margin:1.5rem 0;" />
  <p style="font-size:0.8rem;color:#666;margin-bottom:1rem;">Need a fresh link? Enter your order number and email below.</p>
  <form id="resendForm" style="text-align:left;">
    <label style="font-size:0.75rem;font-weight:bold;display:block;margin-bottom:0.25rem;">Order Number</label>
    <input name="orderNumber" type="text" placeholder="UM-00001" required
      style="width:100%;box-sizing:border-box;padding:0.5rem;border:1px solid #ccc;margin-bottom:0.75rem;font-size:0.875rem;" />
    <label style="font-size:0.75rem;font-weight:bold;display:block;margin-bottom:0.25rem;">Email Address</label>
    <input name="guestEmail" type="email" placeholder="you@example.com" required
      style="width:100%;box-sizing:border-box;padding:0.5rem;border:1px solid #ccc;margin-bottom:1rem;font-size:0.875rem;" />
    <button type="submit"
      style="width:100%;background:#D70606;color:#fff;padding:0.65rem;font-size:0.75rem;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;border:none;cursor:pointer;">
      Send New Link
    </button>
    <p id="resendMsg" style="font-size:0.8rem;color:#555;margin-top:0.75rem;display:none;"></p>
  </form>
  <script>
    document.getElementById('resendForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = this.querySelector('button');
      const msg = document.getElementById('resendMsg');
      btn.textContent = 'Sending...';
      btn.disabled = true;
      try {
        const res = await fetch('/api/bookstore/download/guest-resend', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            orderNumber: this.orderNumber.value.trim(),
            guestEmail: this.guestEmail.value.trim()
          })
        });
        const data = await res.json();
        msg.textContent = data.message || 'Check your inbox for the new link.';
        msg.style.display = 'block';
        btn.style.display = 'none';
      } catch {
        msg.textContent = 'Something went wrong. Please try again.';
        msg.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Send New Link';
      }
    });
  </script>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Download Unavailable — UnTelevised Media</title>
  <style>
    body { font-family: sans-serif; background: #f8f8f8; color: #111; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #fff; border: 1px solid #e5e5e5; max-width: 480px; width: 100%; padding: 2rem; box-sizing: border-box; }
    h1 { font-size: 1.1rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #D70606; margin: 0 0 0.75rem; }
    p { font-size: 0.875rem; color: #555; margin: 0 0 0.5rem; line-height: 1.6; }
    a.btn { display: inline-block; background: #D70606; color: #fff; padding: 0.65rem 1.5rem; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Download Unavailable</h1>
    <p>${message}</p>
    ${resendForm}
    <hr style="border:none;border-top:1px solid #eee;margin:1.5rem 0;" />
    <p style="font-size:0.8rem;">Create a free account to access all your purchases anytime.</p>
    <a class="btn" href="/sign-up">Create Account</a>
  </div>
</body>
</html>`;
}
