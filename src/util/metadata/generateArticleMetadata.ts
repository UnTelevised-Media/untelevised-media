// src/util/metadata/generateArticleMetadata.ts
import type { Metadata } from 'next';
import type { Article } from '@/models/types/sanity';
import sanityClient from '@/lib/sanity/lib/client';
import urlForImage from '@/util/urlForImage';
import { queryArticleBySlug } from '@/lib/sanity/lib/queries';
import { TWITTER_HANDLE } from '@/util/metadata';

type Props = {
  params: {
    slug: string;
  };
};

const baseURL = process.env.NEXT_PUBLIC_METADATA_BASE_URL;

// Define the generateMetadata function
async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  // Fetch the article data based on the slug
  const article: Article = await sanityClient.fetch(queryArticleBySlug, { slug });

  if (!article) {
    return {
      title: 'Article Not Found | UnTelevised Media',
      description: 'The requested article could not be found.',
    };
  }

  // Create metadata object with dynamic values
  // Extract author name - handle both reference and populated author objects
  const authorName =
    article.author && typeof article.author === 'object' && 'name' in article.author
      ? ((article.author as any).name ?? 'Author')
      : 'Author';

  const metadata: Metadata = {
    title: `${article.title} | UnTelevised Media`,
    description: article.description,
    keywords: article.keywords?.length ? article.keywords : undefined,
    authors: article.author ? [{ name: authorName }] : undefined,
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
            url: urlForImage(article.mainImage)?.url() ?? '',
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
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      images: article.mainImage
        ? {
            url: urlForImage(article.mainImage)?.url() ?? '',
            alt: article.mainImage.alt ?? article.title,
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
