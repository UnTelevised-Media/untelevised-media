/* eslint-disable react/function-component-definition */
// src/app/(user)/layout.tsx
import Header from '@/components/global/Header';
import Banner from '@/components/global/Banner';
import { draftMode } from 'next/headers';
import Script from 'next/script';
import NavWrapper from '@/components/global/NavWrapper';
import Footer from '@/components/global/Footer';
import { GoogleAdSense } from 'next-google-adsense';
import GASVerify from '@/util/googleAdSense';
import { SanityLive } from '@/lib/sanity/lib/live';
import DraftModeBanner from '@/components/sanity/DraftModeBanner';
import SanityVisualEditing from '@/components/sanity/VisualEditing';

const GTM_ID = process.env.GTM_ID;

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const draftModeEnabled = (await draftMode()).isEnabled;

  return (
    <>
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
      </div>

      {process.env.NODE_ENV === 'production' && (
        <>
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display: none; visibility: hidden;"></iframe>`,
            }}
          />
        </>
      )}
    </>
  );
}
