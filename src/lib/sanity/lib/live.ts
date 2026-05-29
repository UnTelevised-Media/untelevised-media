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

// Hard timeout so a slow/unresponsive Sanity Live API never hangs a
// Vercel serverless function past its limit. 15 s gives the origin time
// to respond on cold CDN misses while leaving headroom in Vercel's 30 s
// default. Structural layout data (Nav, Footer) should use fetch.ts instead.
const FETCH_TIMEOUT_MS = 15_000;

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
