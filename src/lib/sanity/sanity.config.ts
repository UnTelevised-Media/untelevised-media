'use client';

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `\src\app\studio\[[...tool]]\page.tsx` route
 */

import { colorInput } from '@sanity/color-input';
import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './env';
import { schemaTypes } from '@/models/schema/index'; // Changed from schemaTypes.d.ts to schemas/index.ts
// eslint-disable-next-line import/no-named-as-default
import structure from './structure';
import { generatePreviewUrl } from '@/components/sanity/PreviewLink';

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema: {
    types: schemaTypes, // Use schemaTypes array
  },
  plugins: [
    colorInput(),
    structureTool({ structure }),
    // Presentation tool for live preview
    presentationTool({
      previewUrl: generatePreviewUrl,
      name: 'preview',
      title: 'Preview',
      icon: () => '👁️',
    }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
