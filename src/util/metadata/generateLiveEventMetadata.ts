/* eslint-disable import/prefer-default-export */
import type { Metadata } from 'next';
import client from '@/lib/sanity/lib/client';
import urlForImage from '@/util/urlForImage';
import { queryEventBySlug } from '@/lib/sanity/lib/queries';

type Props = {
  params: {
    slug: string;
  };
};

const baseURL = process.env.NEXT_PUBLIC_METADATA_BASE_URL;

// Define the generateMetadata function
export async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  // Fetch the live event data based on the slug
  const liveEvent: LiveEvent = await client.fetch(queryEventBySlug, { slug });

  if (!liveEvent) {
    return {
      title: 'Live Event Not Found | UnTelevised Media',
      description: 'The requested live event could not be found.',
    };
  }

  // Create metadata object with dynamic values
  const metadata: Metadata = {
    title: `${liveEvent.title} | Live Updates | UnTelevised Media`,
    description: liveEvent.description,
    keywords: liveEvent.keywords ? liveEvent.keywords.split(',') : undefined,
    publisher: 'UnTelevised Media',

    openGraph: {
      title: `${liveEvent.title} | Live Updates | UnTelevised Media`,
      description: liveEvent.description,
      url: `${baseURL}/live-event/${slug}`,
      locale: 'en_US',
      siteName: 'UnTelevised Media',
      type: 'article',
      images: liveEvent.mainImage
        ? {
            url: urlForImage(liveEvent.mainImage as any)?.url() || '',
            width: 1200,
            height: 630,
            alt: liveEvent.mainImage.alt || liveEvent.title,
          }
        : undefined,
    },

    twitter: {
      card: 'summary_large_image',
      title: `${liveEvent.title} | Live Updates | UnTelevised Media`,
      description: liveEvent.description,
      site: '@UnTelevisedLive',
      creator: '@UnTelevisedLive',
      images: liveEvent.mainImage
        ? {
            url: urlForImage(liveEvent.mainImage as any)?.url() || '',
            alt: liveEvent.mainImage.alt || liveEvent.title,
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
