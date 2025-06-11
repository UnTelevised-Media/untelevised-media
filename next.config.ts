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
  // These could cause issue may remove
  typescript: {
    // Set this to false if you want production builds to abort if there's type errors
    // ignoreBuildErrors: process.env.VERCEL_ENV === 'production',
  },
  eslint: {
    /// Set this to false if you want production builds to abort if there's lint errors
    // ignoreDuringBuilds: process.env.VERCEL_ENV === 'production',
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    // * This is used for Sentry to prevent leakage to the client Read more about taint APIs here: https://nextjs.org/blog/security-nextjs-server-components-actions#server-only
    // * This is used for Sanity to prevent the client from accessing the Sanity API Read Token
    // taint: true,
    // typedRoutes: true,
  },
};

export default nextConfig;
