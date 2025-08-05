/* eslint-disable react/function-component-definition */
// src/app/(user)/layout.tsx
import '@/app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/global/Header';
import Banner from '@/components/global/Banner';
import { draftMode } from 'next/headers';
// import GATag from '@/l/googleAnalytics';

import Script from 'next/script';
import NavWrapper from '@/components/global/NavWrapper';
import Footer from '@/components/global/Footer';
import { GoogleAdSense } from 'next-google-adsense';
import GASVerify from '@/util/googleAdSense';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ThemeProvider from '@/components/providers/ThemeProvider';
import { SanityLive } from '@/lib/sanity/lib/live';
import DraftModeBanner from '@/components/sanity/DraftModeBanner';
import SanityVisualEditing from '@/components/sanity/VisualEditing';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title:
    'UnTelevised Media - Breaking News Updates | Latest News Headlines | Photos &amp; News Videos',
  description: 'The Revolution will be UnTelevised',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'news',
    'daily news',
    'breaking news',
    'news today',
    'current events',
    'current news',
    'current',
    'national news',
    'world news',
    'news video',
    'political news',
    'technology news',
    'financial news',
    'news',
    'news',
    'news',
    'breaking',
  ],
  openGraph: {
    title:
      'UnTelevised Media - Breaking News Updates | Latest News Headlines | Photos &amp; News Videos',
    description: 'The Revolution will be UnTelevised',
    url: `https://untelevised.media`,
    //   siteName: 'UnTelevised Media',
    images: {
      url: `/Logo.png`,
    },
  },
  // colorScheme: 'dark',
  publisher: 'UnTelevised Media',
  icons: {
    icon: '/favicon.ico',
  },
};

const GTM_ID = process.env.GTM_ID;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const draftModeEnabled = (await draftMode()).isEnabled;

  return (
    <html lang='en' suppressHydrationWarning>
      {process.env.NODE_ENV === 'production' && (
        <>
          <Script id='google-tag-manager' strategy='afterInteractive'>
            {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
        `}
          </Script>
          <GASVerify googleAdsenseId={process.env.GAS_ID ?? ''} />
        </>
      )}
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem
          disableTransitionOnChange
        >
          <div className='min-h-screen bg-white text-slate-900 transition-colors dark:bg-black dark:text-slate-100'>
            {/* Draft Mode Banner */}
            <DraftModeBanner isEnabled={draftModeEnabled} />

            {/* Main Content with offset for draft banner */}
            <div className={draftModeEnabled ? 'pt-16' : ''}>
              {process.env.NODE_ENV === 'production' && (
                <>
                  <GoogleAdSense />
                </>
              )}
              <Header />
              <NavWrapper />
              <Banner />
              {children}
              <Footer />
            </div>

            {/* Live Features */}
            <SanityLive />
            {draftModeEnabled && <SanityVisualEditing />}

            {/* Analytics */}
            <Analytics />
            <SpeedInsights />
          </div>
        </ThemeProvider>

        {process.env.NODE_ENV === 'production' && (
          <>
            <noscript
              dangerouslySetInnerHTML={{
                __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display: none; visibility: hidden;"></iframe>`,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
