/* eslint-disable import/prefer-default-export */
import type { Metadata } from 'next';
import { groq } from 'next-sanity';
import client from '@/lib/sanity/lib/client';
import urlForImage from '@/util/urlForImage';

type Props = {
  params: {
    slug: string;
  };
};

const baseURL = process.env.NEXT_PUBLIC_METADATA_BASE_URL;

// Define the generateMetadata function
export async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  // Fetch the post data based on the slug
  const query = groq`
    *[_type == "post" && slug.current == $slug][0] {
      title,
      mainImage,
      keywords,
      description,
      author->,
      // Add more fields as needed for metadata
    }`;

  const post: Article = await client.fetch(query, { slug });

  if (!post) {
    return {
      title: 'Article Not Found | UnTelevised Media',
      description: 'The requested article could not be found.',
    };
  }

  // Create metadata object with dynamic values
  const metadata: Metadata = {
    title: `${post.title} | UnTelevised Media`,
    description: post.description,
    keywords: post.keywords ? post.keywords.split(',') : undefined,
    authors: post.author ? [{ name: post.author.name }] : undefined,
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
            url: urlForImage(post.mainImage as any)?.url() ?? '',
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
            url: urlForImage(post.mainImage as any)?.url() ?? '',
            alt: post.mainImage.alt || post.title,
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
