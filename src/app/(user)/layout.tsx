/* eslint-disable react/function-component-definition */
import '@/app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/c/global/Header';
import Banner from '@/c/global/Banner';
import dynamic from 'next/dynamic';
import { draftMode } from 'next/headers';
import { token } from '@/l/sanity.fetch';
import GATag from '@/l/googleAnalytics';
import GASVerify from '@/lib/googleAdSense';



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

const PreviewProvider = dynamic(() => import('@/components/PreviewProvider'));

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // if (process.env.NODE_ENV === "production") {

  //     // Initialize Google Analytics
  //     // eslint-disable-next-line react-hooks/rules-of-hooks
  //     useGAPageviewTracking({ googleAnalyticsId: process.env.GA4_ID });
  // }

  return (
    <html lang='en'>
      <GATag googleAnalyticsId={process.env.GA4_ID} />
      {
        // typeof window !== 'undefined' &&
        process.env.NODE_ENV === 'production' && (
          <GASVerify googleAdsenseId={process.env.GAS_ID} />
        )
      }
      <body className={`bg-slate-400/70 scrollbar-hide ${inter.className}`}>
        {draftMode().isEnabled ? (
          <PreviewProvider token={token}>
            <Header />
            <Banner />
            {children}
          </PreviewProvider>
        ) : (
          <>
            <Header />
            <Banner />

            {children}
          </>
        )}
      </body>
    </html>
  );
}
