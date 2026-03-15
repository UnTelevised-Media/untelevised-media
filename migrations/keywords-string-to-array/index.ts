/**
 * Migration: keywords string → array
 *
 * Converts the `keywords` field on all `article` documents from a plain
 * comma-separated string to a string array.
 *
 * Original values are preserved — each keyword is trimmed and empty segments
 * are discarded. Documents without a `keywords` value are skipped.
 *
 * Run with:
 *   pnpm sanity migration run keywords-string-to-array
 *
 * Dry-run (no writes):
 *   pnpm sanity migration run keywords-string-to-array --dry-run
 */
import { at, defineMigration, patch, set } from 'sanity/migrate';

export default defineMigration({
  title: 'keywords: string → array',
  documentTypes: ['article'],

  migrate: {
    document(doc) {
      // Skip if already an array or no value set
      if (!doc.keywords || Array.isArray(doc.keywords)) return;
      if (typeof doc.keywords !== 'string') return;

      const keywords: string[] = doc.keywords
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean);

      // If splitting produced nothing useful, set empty array
      return patch(doc._id, [at('keywords', set(keywords))]);
    },
  },
});
