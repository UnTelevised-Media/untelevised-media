/* eslint-disable import/prefer-default-export */
// src/util/metadata/generateArticleMetadata.ts
import type { Metadata } from 'next';
import client from '@/lib/sanity/lib/client';
import urlForImage from '@/util/urlForImage';
import { queryArticleBySlug } from '@/lib/sanity/lib/queries';

type Props = {
  params: {
    slug: string;
  };
};

const baseURL = process.env.NEXT_PUBLIC_METADATA_BASE_URL;

// Define the generateMetadata function
export async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  // Fetch the article data based on the slug
  const article: Article = await client.fetch(queryArticleBySlug, { slug });

  if (!article) {
    return {
      title: 'Article Not Found | UnTelevised Media',
      description: 'The requested article could not be found.',
    };
  }

  // Create metadata object with dynamic values
  const metadata: Metadata = {
    title: `${article.title} | UnTelevised Media`,
    description: article.description,
    keywords: article.keywords ? article.keywords.split(',') : undefined,
    authors: article.author ? [{ name: article.author.name }] : undefined,
    publisher: 'UnTelevised Media',

    openGraph: {
      title: `${article.title} | UnTelevised Media`,
      description: article.description,
      url: `${baseURL}/articles/${slug}`,
      locale: 'en_US',
      siteName: 'UnTelevised Media',
      type: 'article',
      images: article.mainImage
        ? {
            url: urlForImage(article.mainImage as any)?.url() ?? '',
            width: 1200,
            height: 630,
            alt: article.mainImage.alt ?? article.title,
          }
        : undefined,
    },

    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | UnTelevised Media`,
      description: article.description,
      site: '@UnTelevisedLive',
      creator: '@UnTelevisedLive',
      images: article.mainImage
        ? {
            url: urlForImage(article.mainImage as any)?.url() || '',
            alt: article.mainImage.alt || article.title,
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
