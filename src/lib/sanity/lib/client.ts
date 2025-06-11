import { createClient } from 'next-sanity';

import { apiVersion, dataset, projectId } from '../env';

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
});

// Export as default
export default client;

// Also export as named export for compatibility
export { client };
