import { NextRequest, NextResponse } from 'next/server';
import { queueViewEvent } from '@/lib/viewCount/batchQueue';

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
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { slug } = body;

  // Validate slug
  if (!slug || typeof slug !== 'string' || slug.length > 200) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  // Only allow URL-safe article slug characters
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 });
  }

  try {
    const ip = getIP(request);
    queueViewEvent(slug, ip);

    return NextResponse.json({ queued: true });
  } catch (err) {
    console.error('[/api/view-queue] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
