import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js runtime, Clerk, Stripe, AdSense all require unsafe-eval/unsafe-inline;
      // use a nonce-based CSP in a future iteration once AdSense compatibility is verified
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://js.clerk.com https://clerk.untelevised.media https://*.clerk.accounts.dev https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://cdn.sanity.io https://images.pexels.com https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://pagead2.googlesyndication.com",
      "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://api.stripe.com https://*.clerk.com https://clerk.untelevised.media https://*.supabase.co https://www.google-analytics.com https://vitals.vercel-insights.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
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
export default nextConfig;
