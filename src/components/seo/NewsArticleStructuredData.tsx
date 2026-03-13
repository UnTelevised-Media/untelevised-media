// src/components/seo/NewsArticleStructuredData.tsx
// JSON-LD structured data for news article pages — NewsArticle + BreadcrumbList schema

import { getSanityOgImageUrl } from '@/util/metadata';

interface Props {
  article: Article;
  slug: string;
}

export function NewsArticleStructuredData({ article, slug }: Props) {
  const canonicalUrl = `https://www.untelevised.media/articles/${slug}/`;
  const ogImageUrl = getSanityOgImageUrl(article.mainImage);

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
              '@id': `https://www.untelevised.media/author/${article.author.slug?.current}/#person`,
              name: article.author.name,
              url: `https://www.untelevised.media/author/${article.author.slug?.current}/`,
            }
          : undefined,
        publisher: {
          '@type': 'NewsMediaOrganization',
          '@id': 'https://www.untelevised.media/#organization',
          name: 'UnTelevised Media',
          url: 'https://www.untelevised.media',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.untelevised.media/Logo.png',
          },
        },
        articleSection: article.categories?.[0]?.title,
        keywords: article.keywords,
        url: canonicalUrl,
      },
      ...(article.faqs?.length
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: article.faqs.map((faq: { question: string; answer: string }) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer },
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
          article.categories?.[0] && {
            '@type': 'ListItem',
            position: 2,
            name: article.categories[0].title,
            item: `https://www.untelevised.media/category/${article.categories[0].slug?.current}/`,
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
