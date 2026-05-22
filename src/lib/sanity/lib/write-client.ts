// src/lib/sanity/lib/write-client.ts
// Write-enabled Sanity client for server-side mutations (Server Actions, API routes).
// NEVER import this on the client — the write token is server-only.
import 'server-only';

import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

const writeToken = process.env.SANITY_API_WRITE_TOKEN;

if (!writeToken) {
  throw new Error('Missing environment variable: SANITY_API_WRITE_TOKEN');
}

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // mutations always go to the live API
  token: writeToken,
});
