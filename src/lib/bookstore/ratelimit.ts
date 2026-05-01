// src/lib/bookstore/ratelimit.ts
// Upstash-backed rate limiting for bookstore API routes.
// Fails open (allows request) if UPSTASH_REDIS_REST_URL / _TOKEN are not set,
// so the app works without Redis and tightens up once credentials are added.

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function makeRatelimiter(requests: number, windowSeconds: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
    analytics: false,
  });
}

// Checkout: 10 requests per 60 s per IP
const checkoutLimiter = makeRatelimiter(10, 60);

// Download: 30 requests per 60 s per IP (users may batch downloads)
const downloadLimiter = makeRatelimiter(30, 60);

// Guest resend: 5 requests per 300 s per IP
const guestResendLimiter = makeRatelimiter(5, 300);

export type RateLimitResult = { limited: boolean; remaining?: number; reset?: number };

async function check(limiter: Ratelimit | null, key: string): Promise<RateLimitResult> {
  if (!limiter) {
    // Redis not configured — fail open, log once in dev
    if (process.env.NODE_ENV === 'development') {
      console.warn('[ratelimit] UPSTASH_REDIS_REST_URL not set — rate limiting disabled');
    }
    return { limited: false };
  }
  const result = await limiter.limit(key);
  return {
    limited: !result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export async function checkCheckoutRate(req: NextRequest): Promise<RateLimitResult> {
  return check(checkoutLimiter, `checkout:${getIp(req)}`);
}

export async function checkDownloadRate(req: NextRequest): Promise<RateLimitResult> {
  return check(downloadLimiter, `download:${getIp(req)}`);
}

export async function checkGuestResendRate(req: NextRequest): Promise<RateLimitResult> {
  return check(guestResendLimiter, `guest-resend:${getIp(req)}`);
}
