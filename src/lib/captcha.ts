// src/lib/captcha.ts
// Cloudflare Turnstile server-side token verifier.
// Fails open when TURNSTILE_SECRET_KEY is not configured so local dev
// and staging environments without keys don't break.

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
}

export async function verifyCaptcha(token: string | null | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // fail open in dev / misconfigured envs

  if (!token) return false;

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
      cache: 'no-store',
    });
    const data = (await res.json()) as TurnstileResponse;
    return data.success === true;
  } catch {
    return true; // fail open on network error — don't block legit users
  }
}
