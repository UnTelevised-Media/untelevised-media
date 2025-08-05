import sanityClient from '@/lib/sanity/lib/client';
import createImageUrlBuilder from '@sanity/image-url';
import type { Image } from 'sanity';

const imageBuilder = createImageUrlBuilder(sanityClient);

// Cached images URLs for normal images
const imageUrlCache = new Map();

// Cached images URLs for OpenGraph images
const openGraphImageUrlCache = new Map();

// Helper to build URL
function buildImageUrl(source: Image) {
  // Ensure imageBuilder is defined
  if (!imageBuilder) {
    throw new Error('imageBuilder is not defined');
  }

  // Construct the URL from the given parameters and return it
  return imageBuilder.image(source).auto('format').fit('max');
}

// Main image URL function
export default function urlForImage(source: Image | undefined) {
  // Ensure that source image contains a valid reference
  if (!source?.asset?._ref) {
    return undefined;
  }

  // Use a unique identifier as the cache key
  const cacheKey = source.asset._ref;

  if (imageUrlCache.has(cacheKey)) {
    return imageUrlCache.get(cacheKey);
  }

  const url = buildImageUrl(source);
  imageUrlCache.set(cacheKey, url);
  return url;
}

// OpenGraph image URL
export function urlForOpenGraphImage(image: Image | undefined) {
  // Ensure that source image contains a valid reference
  if (!image?.asset?._ref) {
    return undefined;
  }

  const cacheKey = image.asset._ref;

  if (openGraphImageUrlCache.has(cacheKey)) {
    return openGraphImageUrlCache.get(cacheKey);
  }

  const url = buildImageUrl(image).width(1200).height(630).fit('crop').url();
  openGraphImageUrlCache.set(cacheKey, url);
  return url;
}

// Yes, implementing caching for image URLs in a Next.js application, especially when working with a CMS like Sanity.io, can significantly improve performance and reduce the number of requests to the CMS backend. Here's why:

// Reduced Server Load: By caching image URLs, you reduce the number of requests made to the CMS backend. Each request to the CMS backend consumes resources on both the server and the client side. By caching, you minimize these requests, which can lead to faster response times and a smoother user experience.
// Improved Performance: Caching image URLs can also improve the performance of your Next.js application. When a user visits a page that contains images, the browser can quickly load these images from the cache instead of waiting for the CMS backend to generate and send the URLs. This can significantly reduce the time it takes for the page to become interactive.
// Optimized Resource Usage: Caching not only reduces the number of requests but also optimizes the use of network resources. By storing image URLs in the cache, you ensure that the same URL is not repeatedly fetched from the CMS backend, which can save bandwidth and reduce the load on the network.
// Scalability: As your application grows and more users access your content, caching can help manage the load on your CMS backend more effectively. It allows your application to scale better by reducing the number of requests that need to be processed by the backend.
// Cost Efficiency: Depending on your CMS provider, there might be costs associated with the number of requests made to the backend. By caching image URLs, you can potentially reduce these costs, especially if your application has a high volume of traffic.
// In the context of Next.js 14, which supports features like Incremental Static Regeneration (ISR) and Edge Functions, implementing caching can be even more beneficial. ISR allows you to update static content without needing to rebuild the entire site, and Edge Functions can run server-side code closer to the user, reducing latency. Caching can complement these features by reducing the need for server-side computations and backend requests for image URLs.

// However, it's important to note that while caching can significantly improve performance and reduce the number of requests to the CMS backend, it's not a silver bullet. The effectiveness of caching depends on various factors, including the size of your image library, the frequency of updates to your content, and the caching strategy you implement. It's also crucial to implement caching in a way that doesn't negatively impact the freshness of your content. For example, you might need to implement a cache invalidation strategy to ensure that users don't see outdated images.

// In summary, implementing caching for image URLs in a Next.js 14 application can lead to noticeable improvements in performance and reduce the load on your CMS backend, making it a valuable optimization strategy.
