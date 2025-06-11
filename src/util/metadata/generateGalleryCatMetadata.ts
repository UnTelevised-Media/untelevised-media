/* eslint-disable import/prefer-default-export */
import { groq } from 'next-sanity';

import urlForImage, { urlForOpenGraphImage } from '@/u/urlForImage';
import { queryGalleryCatMetadata } from '@/l/sanity/queries';
import { Metadata } from 'next';
import client from '@/lib/sanity/lib/client';

type Props = {
  params: {
    slug: string;
  };
};

const baseURL = process.env.NEXT_PUBLIC_METADATA_BASE_URL;

// Define the generateMetadata function
export async function generateMetadata({ params: { slug } }: Props) {
  // Fetch the blog data based on the slug
  const query = queryGalleryCatMetadata;

  const gallery: galleryCategory = await client.fetch(query, { slug });

  // Create metadata object with dynamic values
  const metadata: Metadata = {
    title: `${gallery.title} Photography Gallery`,
    description: gallery.description,
    keywords: gallery.keywords,
    publisher: 'Digitl Alchemyst',

    openGraph: {
      title: `${gallery.title} | Steven Watkins Photography`,
      description: gallery.description,
      url: `${baseURL}gallery/${slug}`,
      locale: 'en_US',
      siteName: 'Steven Watkins Photography',
      images: {
        url: urlForImage(gallery.featuredImage as any)?.url() || '',
        width: 1200,
        height: 6300,
        alt: gallery.featuredImage.alt,
      },
    },

    twitter: {
      card: 'summary_large_image',
      title: `${gallery.title} | Steven Watkins Photography`,
      description: gallery.description,
      siteId: '@DigitlAlchemyst',
      creator: '@DigitlAlchemyst',
      creatorId: '@DigitlAlchemyst',
      images: {
        url: urlForImage(gallery.featuredImage as any)?.url() || '',
        alt: gallery.featuredImage.alt,
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
