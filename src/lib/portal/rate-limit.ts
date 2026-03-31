// src/lib/portal/rate-limit.ts
// Rate limiting for portal write endpoints using Upstash Redis.
// Gracefully degrades when UPSTASH env vars are not configured (development mode).
import 'server-only';

let _ratelimit: import('@upstash/ratelimit').Ratelimit | null = null;

async function getRatelimit() {
  if (_ratelimit) return _ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Not configured — skip rate limiting (dev / test environments)
    return null;
  }

  const { Ratelimit } = await import('@upstash/ratelimit');
  const { Redis } = await import('@upstash/redis');

  _ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    // 30 write operations per minute per user
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: false,
  });

  return _ratelimit;
}

/**
 * Check the rate limit for a given identifier (typically Clerk userId).
 * Returns { allowed: true } when under limit, or { allowed: false, retryAfter } when exceeded.
 * If Upstash is not configured, always returns { allowed: true } (graceful degradation).
 */
export async function checkRateLimit(
  identifier: string
): Promise<{ allowed: true } | { allowed: false; retryAfter: number }> {
  const limiter = await getRatelimit();
  if (!limiter) return { allowed: true };

  const { success, reset } = await limiter.limit(`portal_write:${identifier}`);
  if (success) return { allowed: true };

  const retryAfter = Math.ceil((reset - Date.now()) / 1000);
  return { allowed: false, retryAfter };
}
