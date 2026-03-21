// src/lib/algolia/client.ts
// SERVER-ONLY — never import this in 'use client' components. Admin key must stay server-side.
import 'server-only';
import { algoliasearch } from 'algoliasearch';

// Lazily initialised to allow builds without env vars — will throw at runtime if missing.
let _adminClient: ReturnType<typeof algoliasearch> | undefined;

export function getAdminClient() {
  if (!_adminClient) {
    _adminClient = algoliasearch(
      process.env.ALGOLIA_APP_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!,
    );
  }
  return _adminClient;
}

export const adminClient = {
  saveObject: (...args: Parameters<ReturnType<typeof algoliasearch>['saveObject']>) =>
    getAdminClient().saveObject(...args),
  deleteObject: (...args: Parameters<ReturnType<typeof algoliasearch>['deleteObject']>) =>
    getAdminClient().deleteObject(...args),
};

export const ARTICLES_INDEX = 'untele_articles';
export const LIVE_EVENTS_INDEX = 'untele_live_events';
