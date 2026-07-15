// src/components/seo/NewsArticleStructuredData.tsx
// JSON-LD structured data for news article pages — NewsArticle + BreadcrumbList schema

import { getSanityOgImageUrl } from '@/util/metadata/metadata';
import type { Article } from '@/models/types/sanity';

interface Props {
  article: Article;
  slug: string;
}

function NewsArticleStructuredData({ article, slug }: Props) {
  const canonicalUrl = `https://untelevised.media/articles/${slug}/`;
  const ogImageUrl = getSanityOgImageUrl(article.mainImage);

  // GROQ dereferences author-> and categories[]-> in article data
  // TypeScript sees these as references only, not populated objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authorData = article.author as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviewerData = article.reviewedBy as any;

  // Build author schema from Sanity data
  const authorSchema = authorData
    ? {
        '@type': 'Person',
        '@id': `https://untelevised.media/author/${authorData.slug?.current}/#person`,
        name: authorData.name,
        url: `https://untelevised.media/author/${authorData.slug?.current}/`,
        ...(authorData.title ? { jobTitle: authorData.title } : {}),
        ...(authorData.expertise?.length ? { knowsAbout: authorData.expertise } : {}),
        ...(authorData.credentials?.length ? { hasCredential: authorData.credentials } : {}),
        worksFor: {
          '@type': 'NewsMediaOrganization',
          '@id': 'https://untelevised.media/#organization',
          name: 'UnTelevised Media',
        },
      }
    : undefined;

  // Build reviewer schema if present
  const reviewerSchema = reviewerData
    ? {
        '@type': 'Person',
        '@id': `https://untelevised.media/author/${reviewerData.slug?.current}/#person`,
        name: reviewerData.name,
        ...(reviewerData.title ? { jobTitle: reviewerData.title } : {}),
        url: `https://untelevised.media/author/${reviewerData.slug?.current}/`,
      }
    : undefined;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        '@id': `${canonicalUrl}#article`,
        headline: article.title,
        description: article.description,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt ?? article._updatedAt ?? article.publishedAt,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
        image: ogImageUrl
          ? { '@type': 'ImageObject', url: ogImageUrl, width: 1200, height: 630 }
          : undefined,
        author: authorSchema,
        ...(reviewerSchema ? { reviewedBy: reviewerSchema } : {}),
        publisher: {
          '@type': 'NewsMediaOrganization',
          '@id': 'https://untelevised.media/#organization',
          name: 'UnTelevised Media',
          url: 'https://untelevised.media/',
          logo: {
            '@type': 'ImageObject',
            url: 'https://untelevised.media/Logo.webp',
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        articleSection: (article.categories as any)?.[0]?.title,
        keywords: Array.isArray(article.keywords) ? article.keywords.join(', ') : article.keywords,
        url: canonicalUrl,
      },
      ...(article.faqs?.length
        ? [
            {
              '@type': 'FAQPage',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              mainEntity: article.faqs.map((faq: any) => ({
                '@type': 'Question',
                name: faq.question ?? '',
                acceptedAnswer: { '@type': 'Answer', text: faq.answer ?? '' },
              })),
            },
          ]
        : []),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://untelevised.media/',
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (article.categories as any)?.[0] && {
            '@type': 'ListItem',
            position: 2,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name: (article.categories as any)[0]?.title,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            item: `https://untelevised.media/category/${(article.categories as any)[0]?.slug?.current}/`,
          },
          {
            '@type': 'ListItem',
            position: article.categories?.[0] ? 3 : 2,
            name: article.title,
            item: canonicalUrl,
          },
        ].filter(Boolean),
      },
    ],
  };

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default NewsArticleStructuredData;
