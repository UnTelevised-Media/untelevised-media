import {defineConfig} from 'sanity'
import {visionTool} from '@sanity/vision'
import {deskTool} from 'sanity/desk'
import {schemaTypes} from './schemas'
// import {getStartedPlugin} from './plugins/sanity-plugin-tutorial'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export default defineConfig({
  basePath: '/src/studio',
  name: 'UnTelevised_CMS_Studio',
  title: 'UnTelevised CMS Studio',
  projectId,
  dataset,

    plugins: [
    deskTool(),
    visionTool({
      // defaultApiVersion: 'v2022-11-15',
      // defaultDataset: 'production',
    }),
  ],
  schema: {
    types: schemaTypes,
  },
})

