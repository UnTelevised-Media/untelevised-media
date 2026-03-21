// src/lib/algolia/client.ts
// SERVER-ONLY — never import this in 'use client' components. Admin key must stay server-side.
import 'server-only';
import { algoliasearch } from 'algoliasearch';

const adminClient = algoliasearch(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_API_KEY!);

export { adminClient };
export const ARTICLES_INDEX = 'untele_articles';
export const LIVE_EVENTS_INDEX = 'untele_live_events';
