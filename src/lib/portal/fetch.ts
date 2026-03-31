// src/lib/portal/fetch.ts
// Sanity fetch helper for portal queries — always uses the read token
// to support draft content preview in the portal.
import 'server-only';

import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '@/lib/sanity/env';
import { readToken } from '@/lib/sanity/lib/tokens';

/** Portal client — authenticated with read token so draft docs are visible. */
export const portalClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: readToken ?? undefined,
});
