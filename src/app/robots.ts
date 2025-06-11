import { MetadataRoute } from 'next';

const baseURL = process.env.BASEURL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/studio/',
    },
    sitemap: `${baseURL}sitemap.xml`,
  };
}
