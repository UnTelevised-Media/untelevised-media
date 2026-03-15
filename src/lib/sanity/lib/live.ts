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

export const { sanityFetch, SanityLive } = defineLive({
  // Live content API requires the experimental vX API version
  client: client.withConfig({ apiVersion: 'vX' }),
  // serverToken: used server-side for sanityFetch (can access draft content)
  serverToken,
  // browserToken: used by <SanityLive /> to subscribe to live content updates
  // in the browser. Must be set for real-time updates to work in production.
  browserToken: serverToken,
});
