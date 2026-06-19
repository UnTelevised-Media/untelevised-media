// src/components/analytics/ConsentAwareAnalytics.tsx
'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import * as Sentry from '@sentry/nextjs';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useConsentCheck } from '@/hooks/useConsent';

interface ConsentAwareAnalyticsProps {
  /** GTM container ID, e.g. "GTM-XXXXXX". Loads the GTM snippet. */
  gtmId?: string;
  /** GA4 Measurement ID, e.g. "G-XXXXXXXXXX". Loads gtag.js directly.
   *  Only needed if you want direct GA4 events outside of GTM. */
  ga4Id?: string;
}

function ConsentAwareAnalytics({ gtmId, ga4Id }: ConsentAwareAnalyticsProps) {
  const { canUseAnalytics, canUseMarketing, hasConsent } = useConsentCheck();

  // Reactively push consent updates to Google whenever preferences change.
  // The default 'denied' state was already established by the beforeInteractive
  // script in layout.tsx — this only needs to fire the 'update' call.
  useEffect(() => {
    if (!hasConsent || typeof window === 'undefined' || !window.gtag) {return;}

    window.gtag('consent', 'update', {
      analytics_storage: canUseAnalytics ? 'granted' : 'denied',
      ad_storage: canUseMarketing ? 'granted' : 'denied',
      ad_user_data: canUseMarketing ? 'granted' : 'denied',
      ad_personalization: canUseMarketing ? 'granted' : 'denied',
    });
  }, [hasConsent, canUseAnalytics, canUseMarketing]);

  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <>
      {/* GTM container — production only, loaded after page becomes interactive */}
      {isProduction && gtmId && (
        <Script
          id='google-tag-manager'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `,
          }}
        />
      )}

      {/*
        Direct GA4 via gtag.js — only if a separate GA4 Measurement ID is
        provided. If GA4 is already managed inside the GTM container, omit
        NEXT_PUBLIC_GA4_ID to avoid double-counting page views.
      */}
      {isProduction && ga4Id && (
        <Script
          id='gtag-ga4'
          strategy='afterInteractive'
          src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
          onLoad={() => {
            // Run config only after gtag.js is fully loaded — avoids "gtag is not defined"
            window.gtag?.('js', new Date());
            window.gtag?.('config', ga4Id, {
              page_title: document.title,
              page_location: window.location.href,
            });
          }}
        />
      )}

      {/* Vercel Analytics — only when analytics consent is granted */}
      {canUseAnalytics && <Analytics />}

      {/* Vercel Speed Insights — only when analytics consent is granted */}
      {canUseAnalytics && <SpeedInsights />}
    </>
  );
}

export default ConsentAwareAnalytics;

// Re-export hook for backward compatibility
export { useConsentAwareTracking } from '@/hooks/useConsentAwareTracking';
