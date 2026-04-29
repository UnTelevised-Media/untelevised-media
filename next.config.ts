import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_DEVELOPMENT_URL:
      process.env.NEXT_PUBLIC_DEVELOPMENT_URL || 'http://localhost:3000',
    NEXT_PUBLIC_PRODUCTION_URL: process.env.NEXT_PUBLIC_PRODUCTION_URL || '',
  },
  // Redirects for old post URLs to new article URLs
  async redirects() {
    return [
      {
        source: '/post/:slug',
        destination: '/articles/:slug',
        permanent: true,
      },
      {
        source: '/breaking',
        destination: '/category/breaking',
        permanent: false,
      },
      {
        source: '/live-events',
        destination: '/category/breaking',
        permanent: false,
      },
    ];
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    // * This is used for Sanity to prevent the client from accessing the Sanity API Read Token
    taint: true,
    // typedRoutes: true, — enable once Turbopack supports it fully
    // Enables 'use cache' directive + cacheTag()/cacheLife() from next/cache
    // for fine-grained per-function cache control (used on music pages)
    useCache: true,
  },
};

// Bundle analyzer: run `ANALYZE=true next build` (uses webpack, not Turbopack)
// To enable: const { default: withBundleAnalyzer } = await import('@next/bundle-analyzer')
// export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(nextConfig)
export default nextConfig;
