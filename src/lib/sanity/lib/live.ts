// src/lib/sanity/lib/live.ts
// SanityLive has been removed — public pages use on-demand ISR via fetch.ts.
// This file is kept as a re-export shim so any remaining import paths resolve
// without errors during the migration. Remove once all imports are updated.
export { sanityFetch } from './fetch';

// SanityLive is a no-op stub so layout files compile until their imports are
// updated in the same PR. It renders nothing.
export function SanityLive() {
  return null;
}
