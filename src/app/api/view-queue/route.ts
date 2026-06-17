import { NextRequest, NextResponse } from 'next/server';
import { recordViewEvent } from '@/lib/supabase/viewEvents';

function getIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  let body: { slug?: unknown } = {};

  try {
    body = await request.json();
  } catch {
    console.error('[/api/view-queue] Failed to parse JSON');
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { slug } = body;

  // Validate slug
  if (!slug || typeof slug !== 'string' || slug.length > 200) {
    console.warn('[/api/view-queue] Invalid slug:', slug);
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  // Only allow URL-safe article slug characters
  if (!/^[a-z0-9-]+$/.test(slug)) {
    console.warn('[/api/view-queue] Invalid slug format:', slug);
    return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 });
  }

  try {
    const ip = getIP(request);
    console.log(`[/api/view-queue] Recording view: slug=${slug}, ip=${ip}`);

    // Write to Supabase (no batching needed — Supabase handles high write throughput)
    await recordViewEvent(slug, ip);

    console.log(`[/api/view-queue] View recorded successfully: ${slug}`);
    return NextResponse.json({ recorded: true });
  } catch (err) {
    console.error('[/api/view-queue] Failed to record view:', err);
    // Don't fail the request — view tracking is non-critical
    return NextResponse.json({ recorded: false, error: 'Could not record view' });
  }
}
