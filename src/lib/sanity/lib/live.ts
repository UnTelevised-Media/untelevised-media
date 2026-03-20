// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { defineLive } from 'next-sanity/live';
import { client } from './client';

// Read the token directly from env here — the readToken export from tokens.ts
// has experimental_taintUniqueValue applied to it, which prevents React from
// passing that value to client components. defineLive intentionally sends
// browserToken to the browser; sourcing it here bypasses the taint check.
const serverToken = process.env.SANITY_API_READ_TOKEN;

const { sanityFetch: _sanityFetch, SanityLive } = defineLive({
  // Live content API requires the experimental vX API version
  client: client.withConfig({ apiVersion: 'vX' }),
  // serverToken: used server-side for sanityFetch (can access draft content)
  serverToken,
  // browserToken: used by <SanityLive /> to subscribe to live content updates
  // in the browser. Must be set for real-time updates to work in production.
  browserToken: serverToken,
});

export { SanityLive };

// Hard timeout so a slow/unresponsive Sanity Live API never hangs the
// Vercel serverless function long enough to 502. 8 s is well within the
// 30 s function limit and gives callers time to render a graceful fallback.
const FETCH_TIMEOUT_MS = 8_000;

export const sanityFetch: typeof _sanityFetch = (options) =>
  Promise.race([
    _sanityFetch(options),
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `[sanityFetch] timed out after ${FETCH_TIMEOUT_MS}ms — Sanity Live API may be slow or unreachable`
            )
          ),
        FETCH_TIMEOUT_MS
      )
    ),
  ]);
