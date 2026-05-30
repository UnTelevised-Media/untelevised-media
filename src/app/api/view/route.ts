import { NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/lib/write-client';

// Best-effort in-memory rate limit — resets on cold start (acceptable for MVP).
// Key: "ip:slug", Value: timestamp of last view
const rateLimitCache = new Map<string, number>();
const RATE_LIMIT_MS = 24 * 60 * 60 * 1000; // 24 hours

function isRateLimited(ip: string, slug: string): boolean {
  const key = `${ip}:${slug}`;
  const lastSeen = rateLimitCache.get(key);
  if (!lastSeen) return false;
  return Date.now() - lastSeen < RATE_LIMIT_MS;
}

function recordView(ip: string, slug: string): void {
  const key = `${ip}:${slug}`;
  rateLimitCache.set(key, Date.now());
  // Prune stale entries to prevent unbounded memory growth
  if (rateLimitCache.size > 10_000) {
    const cutoff = Date.now() - RATE_LIMIT_MS;
    for (const [k, v] of rateLimitCache.entries()) {
      if (v < cutoff) rateLimitCache.delete(k);
    }
  }
}

export async function POST(request: NextRequest) {
  let body: { slug?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { slug } = body;

  if (!slug || typeof slug !== 'string' || slug.length > 200) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  // Only allow URL-safe article slug characters
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (isRateLimited(ip, slug)) {
    return NextResponse.json({ skipped: true, reason: 'rate_limited' });
  }

  try {
    const article = await writeClient.fetch<{ _id: string } | null>(
      `*[_type == "article" && slug.current == $slug][0]{ _id }`,
      { slug }
    );

    if (!article?._id) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    await writeClient
      .patch(article._id)
      .setIfMissing({ viewCount: 0 })
      .inc({ viewCount: 1 })
      .commit({ visibility: 'async' });

    recordView(ip, slug);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/view] Failed to increment view count:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
