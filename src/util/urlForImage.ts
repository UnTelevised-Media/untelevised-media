import { client } from '@/lib/sanity.client';
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);

function urlForImage(source) {
  return builder.image(source);
}

export default urlForImage;
