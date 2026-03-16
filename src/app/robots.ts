import { MetadataRoute } from 'next';

const PRODUCTION_URL = 'https://www.untelevised.media';
const baseURL = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.BASEURL ?? PRODUCTION_URL).replace(
  /\/$/,
  ''
);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // All standard crawlers — allow everything except studio and API
      {
        userAgent: '*',
        allow: ['/', '/feed.xml'],
        disallow: ['/studio/', '/api/', '/privacy-settings', '/reading-list', '/unlock'],
      },
      // Explicitly allow major AI crawlers for AEO (AI answer engine optimization)
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'cohere-ai', allow: '/' },
    ],
    sitemap: `${baseURL}/sitemap.xml`,
  };
}
