import { defineConfig } from 'sanity';
import { visionTool } from '@sanity/vision';
import { deskTool } from 'sanity/desk';
import { schemaTypes } from './schemas';
import { myTheme } from '#/theme';
import StudioNavbar from '@/components/studio/StudioNavbar';
import Logo from '@/components/global/Logo';
import { getDefaultDocumentNode } from '#/structure';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export default defineConfig({
  basePath: '/studio',
  name: 'UnTelevised_CMS_Studio',
  title: 'UnTelevised Studio',
  projectId,
  dataset,
  plugins: [
    deskTool({
      defaultDocumentNode: getDefaultDocumentNode,
    }),
    visionTool({}),
  ],
  schema: {
    types: schemaTypes,
  },
  studio: {
    components: {
      logo: Logo,
      navbar: StudioNavbar,
    },
  },
  theme: myTheme,
});
