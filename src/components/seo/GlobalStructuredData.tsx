// src/components/seo/GlobalStructuredData.tsx
// Rendered once in (user)/layout.tsx — NewsMediaOrganization + WebSite with SearchAction

export function GlobalStructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsMediaOrganization',
        '@id': 'https://www.untelevised.media/#organization',
        name: 'UnTelevised Media',
        url: 'https://www.untelevised.media/',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.untelevised.media/Logo.png',
        },
        sameAs: [
          'https://twitter.com/untelevised',
          'https://instagram.com/untelevised',
          'https://facebook.com/untelevised',
          'https://youtube.com/@AntiWarTV',
          'https://www.tiktok.com/@radical.edward',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'editorial',
          url: 'https://www.untelevised.media/secure-contact/',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.untelevised.media/#website',
        name: 'UnTelevised Media',
        url: 'https://www.untelevised.media/',
        publisher: { '@id': 'https://www.untelevised.media/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://www.untelevised.media/search/?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
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
