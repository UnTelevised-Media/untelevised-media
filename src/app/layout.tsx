// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import { ClerkProvider } from '@clerk/nextjs';

import ThemeProvider from '@/components/providers/ThemeProvider';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import dynamic from 'next/dynamic';
import { ConsentProvider } from '@/lib/consent';
import ConsentAwareAnalytics from '@/components/analytics/ConsentAwareAnalytics';
import SentryUserSync from '@/components/providers/SentryUserSync';

// Defer framer-motion consent UI into a separate code-split chunk
const CookieConsentBanner = dynamic(() => import('@/components/consent/CookieConsentBanner'));
const AdBlockerMessage = dynamic(() => import('@/components/consent/AdBlockerMessage'));

// // Import environment validation
// import '@/lib/env';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.untelevised.media'),
  title: {
    default: 'UnTelevised Media — Independent Journalism',
    template: '%s | UnTelevised Media',
  },
  description:
    "Independent journalism covering breaking news, live events, and investigative reporting that mainstream media won't cover.",
  keywords: [
    'independent media',
    'investigative journalism',
    'breaking news',
    'live events',
    'untelevised',
  ],
  authors: [
    { name: 'UnTelevised Media Editorial Team', url: 'https://www.untelevised.media/staff/' },
  ],
  creator: 'UnTelevised Media',
  publisher: 'UnTelevised Media',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.untelevised.media',
    title: 'UnTelevised Media — Independent Journalism',
    description: 'Independent journalism covering breaking news and investigative reporting.',
    siteName: 'UnTelevised Media',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'UnTelevised Media',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@untelevised',
    creator: '@untelevised',
    title: 'UnTelevised Media — Independent Journalism',
    description: 'Independent journalism covering breaking news and investigative reporting.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'UnTelevised Media RSS Feed' }],
    },
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel='icon' href='/favicon.ico' sizes='any' />
        {/*
          Google Consent Mode v2 — MUST run before any GTM/GA4 scripts load.
          Sets all storage to 'denied' by default; ConsentAwareAnalytics will
          call gtag('consent', 'update', ...) reactively once the user decides.
        */}
        <Script
          id='gtag-consent-init'
          strategy='beforeInteractive'
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              window.gtag = window.gtag || function(){window.dataLayer.push(arguments);}
              window.gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                wait_for_update: 500,
              });
            `,
          }}
        />
      </head>
      <body className={`${inter.className} font-sans antialiased`} suppressHydrationWarning>
        <a
          href='#main-content'
          className='sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-slate-900 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-untele dark:focus:bg-slate-900 dark:focus:text-white'
        >
          Skip to main content
        </a>
        <ClerkProvider afterSignOutUrl='/'>
          <SentryUserSync />
          <ErrorBoundary>
            <ConsentProvider>
              <ThemeProvider
                attribute='class'
                defaultTheme='system'
                enableSystem
                disableTransitionOnChange
              >
                <div className='relative flex min-h-screen flex-col'>
                  <main id='main-content' className='flex-1'>
                    <ErrorBoundary>{children}</ErrorBoundary>
                  </main>
                </div>
                <Toaster />

                {/* Consent Management */}
                <CookieConsentBanner />
                <AdBlockerMessage />
              </ThemeProvider>

              {/* Consent-Aware Analytics — GTM + GA4 + Vercel */}
              <ConsentAwareAnalytics
                gtmId={process.env.NEXT_PUBLIC_GTM_ID}
                ga4Id={process.env.NEXT_PUBLIC_GA4_ID}
              />
            </ConsentProvider>
          </ErrorBoundary>
        </ClerkProvider>
      </body>
    </html>
  );
};

export default RootLayout;
