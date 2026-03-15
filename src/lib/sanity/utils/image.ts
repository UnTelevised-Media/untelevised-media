// import createImageUrlBuilder from '@sanity/image-url';
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';

import { dataset, projectId } from '../env';

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset });

const urlFor = (source: SanityImageSource) => {
  return builder.image(source);
};

export default urlFor;
