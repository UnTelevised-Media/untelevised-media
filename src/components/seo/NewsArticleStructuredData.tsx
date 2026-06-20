// src/components/seo/NewsArticleStructuredData.tsx
// JSON-LD structured data for news article pages — NewsArticle + BreadcrumbList schema

import { getSanityOgImageUrl } from '@/util/metadata/metadata';
import type { Article } from '@/models/types/sanity';

interface Props {
  article: Article;
  slug: string;
}

function NewsArticleStructuredData({ article, slug }: Props) {
  const canonicalUrl = `https://www.untelevised.media/articles/${slug}/`;
  const ogImageUrl = getSanityOgImageUrl(article.mainImage);

  // GROQ dereferences author-> and categories[]-> in article data
  // TypeScript sees these as references only, not populated objects
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
        author: article.author
          ? {
              '@type': 'Person',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              '@id': `https://www.untelevised.media/author/${(article.author as any).slug?.current}/#person`,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              name: (article.author as any).name,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              url: `https://www.untelevised.media/author/${(article.author as any).slug?.current}/`,
            }
          : undefined,
        publisher: {
          '@type': 'NewsMediaOrganization',
          '@id': 'https://www.untelevised.media/#organization',
          name: 'UnTelevised Media',
          url: 'https://www.untelevised.media/',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.untelevised.media/Logo.png',
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
            item: 'https://www.untelevised.media/',
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (article.categories as any)?.[0] && {
            '@type': 'ListItem',
            position: 2,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name: (article.categories as any)[0]?.title,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            item: `https://www.untelevised.media/category/${(article.categories as any)[0]?.slug?.current}/`,
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
