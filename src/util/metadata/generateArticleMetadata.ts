/* eslint-disable import/prefer-default-export */
// import { groq } from 'next-sanity';
import { client } from '@/lib/sanity/client';
import urlForImage, { urlForOpenGraphImage } from '@/u/urlForImage';
import { queryBlogMetadata } from '../../sanity/queries';
import { Metadata } from 'next';

type Props = {
  params: {
    slug: string;
  };
};

const baseURL = process.env.NEXT_PUBLIC_METADATA_BASE_URL;

// Define the generateMetadata function
export async function generateMetadata({ params: { slug } }: Props) {
  // Fetch the blog data based on the slug
  const query = queryBlogMetadata;

  const post: Article = await client.fetch(query, { slug });

  // Create metadata object with dynamic values
  const metadata: Metadata = {
    title: `${post.title} | SW Photography`,
    description: post.snippet,
    keywords: post.keywords,
    authors: post.author,
    publisher: 'Digitl Alchemyst',

    openGraph: {
      title: `${post.title} | SW Photography`,
      description: post.snippet,
      url: `${baseURL}blog/${slug}`,
      locale: 'en_US',
      siteName: 'Steven Watkins Photography',
      images: {
        url: urlForImage(post.mainImage as any)?.url() || '',
        width: 1200,
        height: 6300,
        alt: post.mainImage.alt,
      },
    },

    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | SW Photography`,
      description: post.snippet,
      siteId: '@DigitlAlchemyst',
      creator: '@DigitlAlchemyst',
      creatorId: '@DigitlAlchemyst',
      images: {
        url: urlForImage(post.mainImage as any)?.url() || '',
        alt: post.mainImage.alt,
      },
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
