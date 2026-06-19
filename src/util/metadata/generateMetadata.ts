import type { Metadata } from 'next';
import type { Article } from '@/models/types/sanity';
import { groq } from 'next-sanity';
import sanityClient from '@/lib/sanity/lib/client';
import urlForImage from '@/util/urlForImage';

type Props = {
  params: {
    slug: string;
  };
};

const baseURL = process.env.NEXT_PUBLIC_METADATA_BASE_URL;

// Define the generateMetadata function
async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  // Fetch the post data based on the slug
  const queryPostMetadata = groq`
    *[_type == "post" && slug.current == $slug][0] {
      title,
      mainImage,
      keywords,
      description,
      author->,
      // Add more fields as needed for metadata
    }`;

  const post: Article = await sanityClient.fetch(queryPostMetadata, { slug });

  if (!post) {
    return {
      title: 'Article Not Found | UnTelevised Media',
      description: 'The requested article could not be found.',
    };
  }

  // Create metadata object with dynamic values
  // Extract author name - handle both reference and populated author objects
  const authorName =
    post.author && typeof post.author === 'object' && 'name' in post.author
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((post.author as any).name ?? 'Author')
      : 'Author';

  const metadata: Metadata = {
    title: `${post.title} | UnTelevised Media`,
    description: post.description,
    keywords: post.keywords ?? undefined,
    authors: post.author ? [{ name: authorName }] : undefined,
    publisher: 'UnTelevised Media',

    openGraph: {
      title: `${post.title} | UnTelevised Media`,
      description: post.description,
      url: `${baseURL}/post/${slug}`,
      locale: 'en_US',
      siteName: 'UnTelevised Media',
      type: 'article',
      images: post.mainImage
        ? {
            url: urlForImage(post.mainImage)?.url() ?? '',
            width: 1200,
            height: 630,
            alt: post.mainImage.alt ?? post.title,
          }
        : undefined,
    },

    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | UnTelevised Media`,
      description: post.description,
      site: '@UnTelevisedLive',
      creator: '@UnTelevisedLive',
      images: post.mainImage
        ? {
            url: urlForImage(post.mainImage)?.url() ?? '',
            alt: post.mainImage.alt ?? post.title,
          }
        : undefined,
    },

    referrer: 'origin-when-cross-origin',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };

  return metadata;
}

export default generateMetadata;
export { generateMetadata };
