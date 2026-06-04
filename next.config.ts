import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js runtime, Clerk, Stripe, AdSense all require unsafe-eval/unsafe-inline.
      // fundingchoicesmessages.google.com: Google's GDPR/Funding Choices consent messaging —
      //   without this, AdSense cannot show its EU consent dialog and will withhold ads
      //   from all EU/EEA visitors (major fill-rate impact).
      // *.adtrafficquality.google: Google SODAR viewability scripts (sodar2.js) — loaded
      //   dynamically by the AdSense ad renderer after each ad fills. Blocking these
      //   scripts causes AdSense to log a CSP error and reduces viewability signals,
      //   which lowers eCPM and fill rates.
      // static.cloudflareinsights.com: Cloudflare Web Analytics beacon.
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://js.clerk.com https://clerk.untelevised.media https://*.clerk.accounts.dev https://pagead2.googlesyndication.com https://partner.googleadservices.com https://adservice.google.com https://fundingchoicesmessages.google.com https://*.adtrafficquality.google https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net https://va.vercel-scripts.com https://static.cloudflareinsights.com https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      // img.clerk.com: Clerk user avatar proxied images (shown in the header UserButton).
      // *.googlesyndication.com, *.doubleclick.net, *.google.com, *.googleadservices.com:
      //   ad creatives, tracking pixels, and conversion images from AdSense / DoubleClick.
      "img-src 'self' data: blob: https://cdn.sanity.io https://images.pexels.com https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.googleadservices.com https://img.clerk.com",
      // *.adtrafficquality.google: Google SODAR (viewability + ad fraud monitoring).
      //   Without this, Google cannot measure ad quality on this site, which reduces
      //   fill rates and eCPM — AdSense actively penalises sites that block SODAR.
      "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://api.stripe.com https://*.clerk.com https://clerk.untelevised.media https://*.supabase.co https://www.google-analytics.com https://vitals.vercel-insights.com https://*.sentry.io https://*.algolia.net https://*.algolianet.com https://*.googlesyndication.com https://adservice.google.com https://*.doubleclick.net https://cm.g.doubleclick.net https://*.googleadservices.com https://*.adtrafficquality.google",
      // AdSense renders ads inside iframes; fundingchoicesmessages.google.com hosts
      // Google's GDPR consent dialog iframe shown before serving ads to EU visitors.
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://fundingchoicesmessages.google.com https://www.youtube.com https://www.youtube-nocookie.com https://www.facebook.com https://web.facebook.com",
      // blob: required by Sentry session-replay worker and Clerk auth polling worker.
      // Without this, both features silently fail (CSP blocks the blob: URL worker).
      'worker-src blob:',
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    // Explicit breakpoints eliminate unused transform sizes.
    // Defaults (8 device + 8 image = 16 sizes) generate far more variants than
    // the site actually needs; these 9 cover all real use cases.
    deviceSizes: [640, 828, 1080, 1200, 1920],
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
