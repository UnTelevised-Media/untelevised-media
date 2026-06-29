import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const isProduction = process.env.NODE_ENV === 'production';

// Production CSP: strict https/wss only
const productionCSP = [
  'upgrade-insecure-requests',
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://js.clerk.com https://clerk.untelevised.media https://*.clerk.accounts.dev https://pagead2.googlesyndication.com https://partner.googleadservices.com https://adservice.google.com https://fundingchoicesmessages.google.com https://*.adtrafficquality.google https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net https://static.cloudflareinsights.com https://connect.facebook.net https://www.tiktok.com https://www.instagram.com https://www.youtube.com https://coral.untelevised.media https://*.tiktokcdn.com https://*.tiktokcdn-us.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.tiktokcdn.com https://*.tiktokcdn-us.com https://coral.untelevised.media",
  "font-src 'self' https://fonts.gstatic.com https://s3.amazonaws.com https://coral.untelevised.media data:",
  "img-src 'self' data: blob: https://untelevised.media https://*.untelevised.media https://cdn.sanity.io https://images.pexels.com https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.googleadservices.com https://img.clerk.com https://img.youtube.com https://*.adtrafficquality.google",
  "connect-src 'self' https: wss: https://*.sanity.io wss://*.sanity.io https://api.stripe.com https://*.clerk.com https://clerk.untelevised.media https://*.supabase.co https://www.google-analytics.com https://*.sentry.io https://*.algolia.net https://*.algolianet.com https://*.googlesyndication.com https://adservice.google.com https://*.doubleclick.net https://cm.g.doubleclick.net https://*.googleadservices.com https://*.adtrafficquality.google",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://fundingchoicesmessages.google.com https://www.youtube.com https://www.youtube-nocookie.com https://*.facebook.com https://abc7chicago.com https://www.instagram.com https://*.adtrafficquality.google https://www.tiktok.com",
  'worker-src blob:',
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

// Development CSP: allow localhost ws:// and http: for HMR and dev server
const developmentCSP = [
  'upgrade-insecure-requests',
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://js.clerk.com https://clerk.untelevised.media https://*.clerk.accounts.dev https://pagead2.googlesyndication.com https://partner.googleadservices.com https://adservice.google.com https://fundingchoicesmessages.google.com https://*.adtrafficquality.google https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net https://static.cloudflareinsights.com https://connect.facebook.net https://www.tiktok.com https://www.instagram.com https://www.youtube.com https://coral.untelevised.media https://*.tiktokcdn.com https://*.tiktokcdn-us.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.tiktokcdn.com https://*.tiktokcdn-us.com https://coral.untelevised.media",
  "font-src 'self' https://fonts.gstatic.com https://s3.amazonaws.com https://coral.untelevised.media data:",
  "img-src 'self' data: blob: https://untelevised.media https://*.untelevised.media https://cdn.sanity.io https://images.pexels.com https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.googleadservices.com https://img.clerk.com https://img.youtube.com https://*.adtrafficquality.google",
  // Allow ws:// for Next.js HMR (hot module replacement) on localhost, plus all prod services
  "connect-src 'self' http: https: ws: wss: https://*.sanity.io wss://*.sanity.io https://api.stripe.com https://*.clerk.com https://clerk.untelevised.media https://*.supabase.co https://www.google-analytics.com https://*.sentry.io https://*.algolia.net https://*.algolianet.com https://*.googlesyndication.com https://adservice.google.com https://*.doubleclick.net https://cm.g.doubleclick.net https://*.googleadservices.com https://*.adtrafficquality.google",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://fundingchoicesmessages.google.com https://www.youtube.com https://www.youtube-nocookie.com https://*.facebook.com https://abc7chicago.com https://www.instagram.com https://*.adtrafficquality.google https://www.tiktok.com",
  'worker-src blob:',
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), accelerometer=(self), gyroscope=(self), magnetometer=(), unload=(self)',
  },
  {
    key: 'Content-Security-Policy',
    value: isProduction ? productionCSP : developmentCSP,
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  output: 'standalone',
  images: {
    // Explicit breakpoints eliminate unused transform sizes.
    // Defaults (8 device + 8 image = 16 sizes) generate far more variants than
    // the site actually needs; these 6 cover all real use cases (optimized from 9).
    loaderFile: './src/lib/sanity/imageLoader.ts',
    deviceSizes: [640, 1080, 1920],
    imageSizes: [64, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_DEVELOPMENT_URL:
      process.env.NEXT_PUBLIC_DEVELOPMENT_URL || 'http://localhost:3000',
    NEXT_PUBLIC_PRODUCTION_URL: process.env.NEXT_PUBLIC_PRODUCTION_URL || '',
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
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
        source: '/live-events',
        destination: '/breaking',
        permanent: false,
      },
      {
        source: '/donate',
        destination: '/support',
        permanent: true,
      },
      {
        source: '/join',
        destination: '/support',
        permanent: true,
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
    serverActions: {
      // Default 1 MB limit silently drops book cover and digital file uploads
      bodySizeLimit: '50mb',
    },
  },
};

// Bundle analyzer: run `ANALYZE=true next build` (uses webpack, not Turbopack)
// To enable: const { default: withBundleAnalyzer } = await import('@next/bundle-analyzer')
// export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(nextConfig)
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload a wider set of client files for better stack trace resolution
  widenClientFileUpload: true,

  // Sentry tunnel is handled by a manual Edge Function at src/app/monitoring/route.ts
  // (tunnelRoute auto-generates a serverless function; the Edge Function has a much
  // higher free-tier invocation limit and near-zero cold-start latency)

  // Suppress non-CI build output
  silent: !process.env.CI,

  // Tree-shake Sentry logger statements in production (webpack only)
  disableLogger: true,
});
