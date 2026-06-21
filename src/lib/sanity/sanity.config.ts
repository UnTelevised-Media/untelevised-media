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
import { schemaTypes } from '@/models/schema/index';

import structure from './structure';
import { generatePreviewUrl } from './components/PreviewLink';

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
  },
  plugins: [
    colorInput(),
    structureTool({ structure }),
    presentationTool({
      previewUrl: generatePreviewUrl,
      name: 'preview',
      title: 'Preview',
      icon: () => '👁️',
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
