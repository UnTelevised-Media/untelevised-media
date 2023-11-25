/* eslint-disable react/function-component-definition */
import '@/app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/c/global/Header';
import Banner from '@/c/global/Banner';
import dynamic from 'next/dynamic';
import { draftMode } from 'next/headers';
import { token } from '@/l/sanity.fetch';
// import GATag from '@/l/googleAnalytics';
import GASVerify from '@/lib/googleAdSense';
import Script from 'next/script';
import Nav from '@/components/global/Nav';

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

const GTM_ID = process.env.GTM_ID;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang='en'>
      <Script id='google-tag-manager' strategy='afterInteractive'>
        {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
        `}
      </Script>
      {process.env.NODE_ENV === 'production' && (
        <>
          <GASVerify googleAdsenseId={process.env.GAS_ID} />
        </>
      )}
      <body className={`bg-slate-400/70 scrollbar-hide ${inter.className}`}>
        {draftMode().isEnabled ? (
          <PreviewProvider token={token}>
            <Header />
            <Nav />
            <Banner />
            {children}
          </PreviewProvider>
        ) : (
          <>
            <Header />
            <Nav />
            <Banner />

            {children}
          </>
        )}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display: none; visibility: hidden;"></iframe>`,
          }}
        />
      </body>
    </html>
  );
}
