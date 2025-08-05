// src\lib\sanity\lib\tokens.ts
import 'server-only';

import { experimental_taintUniqueValue } from 'react';

export const token = process.env.SANITY_API_READ_TOKEN;

// Also export as readToken for compatibility with other files
export const readToken = token;

// Preview secret for draft mode
export const previewSecret = process.env.SANITY_PREVIEW_SECRET;

if (!token) {
  throw new Error('Missing SANITY_API_READ_TOKEN');
}

experimental_taintUniqueValue(
  'Do not pass the sanity API read token to the client.',
  process,
  token
);
