// src/lib/portal/__tests__/rate-limit.test.ts
// Tests for rate-limit module graceful degradation when Upstash is not configured.
// The actual Redis path is NOT tested here (requires live Upstash credentials).
// NOTE: We mock the environment to simulate the "not configured" path — this is
// the only case where a mock is justified: testing env-gated startup behaviour
// without requiring real external infrastructure.

// Ensure env vars are absent so getRatelimit() returns null
const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;

beforeAll(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

afterAll(() => {
  if (originalUrl) process.env.UPSTASH_REDIS_REST_URL = originalUrl;
  if (originalToken) process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
});

// Must be required after env is set to avoid module-level caching
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { checkRateLimit } = require('../rate-limit') as typeof import('../rate-limit');

describe('checkRateLimit — no Upstash configured', () => {
  it('always returns allowed:true when env vars are missing', async () => {
    const result = await checkRateLimit('user_test_123');
    expect(result.allowed).toBe(true);
  });

  it('returns allowed:true for any identifier', async () => {
    const result = await checkRateLimit('attacker_user_99');
    expect(result.allowed).toBe(true);
  });
});
