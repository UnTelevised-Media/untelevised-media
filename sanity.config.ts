/**
 * Root-level Sanity config used exclusively by the Sanity CLI for
 * schema extraction and TypeGen (`pnpm sanity typegen generate`).
 *
 * The live studio config lives at src/lib/sanity/sanity.config.ts and
 * is mounted in Next.js via src/app/studio/[[...tool]]/page.tsx.
 * This file is a minimal duplicate to satisfy the CLI's project-root lookup.
 */
import { defineConfig } from 'sanity';
import { schemaTypes } from './src/models/schema/index';

export default defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  schema: {
    types: schemaTypes,
  },
});
