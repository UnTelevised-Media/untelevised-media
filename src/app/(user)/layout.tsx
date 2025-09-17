/* eslint-disable react/function-component-definition */
// src/app/(user)/layout.tsx
import Header from '@/components/global/Header';
import Banner from '@/components/global/Banner';
import { draftMode } from 'next/headers';

import NavWrapper from '@/components/global/NavWrapper';
import Footer from '@/components/global/Footer';

import ConsentAwareGoogleAdSense from '@/util/consentAwareGoogleAdSense';
import { SanityLive } from '@/lib/sanity/lib/live';
import DraftModeBanner from '@/components/sanity/DraftModeBanner';
import SanityVisualEditing from '@/components/sanity/VisualEditing';
import AdDebugger from '@/components/debug/AdDebugger';

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const draftModeEnabled = (await draftMode()).isEnabled;

  return (
    <>
      <ConsentAwareGoogleAdSense
        googleAdsenseId={process.env.NEXT_PUBLIC_GAS_ID ?? 'ca-pub-7412827340538951'}
      />

      <div className='min-h-screen bg-white text-slate-900 transition-colors dark:bg-black dark:text-slate-100'>
        {/* Draft Mode Banner */}
        <DraftModeBanner isEnabled={draftModeEnabled} />

        {/* Main Content with offset for draft banner */}
        <div className={draftModeEnabled ? 'pt-16' : ''}>
          {/* Auto-placement disabled - using custom ad components instead */}
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

      {/* Debug Component */}
      {/* <AdDebugger /> */}
    </>
  );
}
