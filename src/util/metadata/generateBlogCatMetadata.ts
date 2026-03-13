/* eslint-disable import/prefer-default-export */
import type { Metadata } from 'next';
import { groq } from 'next-sanity';
import sanityClient from '@/lib/sanity/lib/client';

type Props = {
  params: {
    slug: string;
  };
};

const baseURL = process.env.NEXT_PUBLIC_METADATA_BASE_URL;

// Define the generateMetadata function
export async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  // Fetch the category data based on the slug
  const queryCategoryMetadata = groq`
    *[_type == "category" && slug.current == $slug][0] {
      title,
      description,
      // Add more fields as needed for metadata
    }`;

  const category: Category = await sanityClient.fetch(queryCategoryMetadata, { slug });

  if (!category) {
    return {
      title: 'Category Not Found | UnTelevised Media',
      description: 'The requested category could not be found.',
    };
  }

  // Create metadata object with dynamic values
  const metadata: Metadata = {
    title: `${category.title} | UnTelevised Media`,
    description: category.description || `Latest articles in ${category.title}`,
    publisher: 'UnTelevised Media',

    openGraph: {
      title: `${category.title} | UnTelevised Media`,
      description: category.description || `Latest articles in ${category.title}`,
      url: `${baseURL}/category/${slug}`,
      locale: 'en_US',
      siteName: 'UnTelevised Media',
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title: `${category.title} | UnTelevised Media`,
      description: category.description || `Latest articles in ${category.title}`,
      site: '@UnTelevisedLive',
      creator: '@UnTelevisedLive',
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
