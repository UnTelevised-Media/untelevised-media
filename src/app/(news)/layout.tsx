// src/app/(user)/layout.tsx
import Header from '@/components/global/Header';
import HeaderLogo from '@/components/global/HeaderLogo';
import { draftMode } from 'next/headers';

import NavWrapper from '@/components/global/NavWrapper';
import Footer from '@/components/global/Footer';

import ConsentAwareGoogleAdSense from '@/components/googleAdSense/ConsentAwareGoogleAdSense';
import DraftModeBanner from '@/lib/sanity/components/DraftModeBanner';
import SanityVisualEditing from '@/lib/sanity/components/VisualEditing';
import GlobalStructuredData from '@/components/seo/GlobalStructuredData';
import BreakingNewsBanner from '@/components/global/BreakingNewsBanner';

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const draftModeEnabled = (await draftMode()).isEnabled;

  return (
    <>
      <ConsentAwareGoogleAdSense googleAdsenseId={process.env.NEXT_PUBLIC_GAS_ID ?? ''} />

      <GlobalStructuredData />

      <div className='min-h-screen bg-white text-slate-900 transition-colors dark:bg-black dark:text-slate-100'>
        {/* Draft Mode Banner */}
        <DraftModeBanner isEnabled={draftModeEnabled} />

        {/* Main Content with offset for draft banner */}
        <div className={draftModeEnabled ? 'pt-16' : ''}>
          {/* Auto-placement disabled - using custom ad components instead */}
          <Header logoSlot={<HeaderLogo />} />
          <NavWrapper />
          <BreakingNewsBanner />
          {children}
          <Footer />
        </div>

        {draftModeEnabled && <SanityVisualEditing />}
      </div>
    </>
  );
}
