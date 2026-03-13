// src/components/analytics/ConsentAwareAnalytics.tsx
'use client';

import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useConsentCheck } from '@/lib/consent/context';

interface ConsentAwareAnalyticsProps {
  gtmId?: string;
}

const ConsentAwareAnalytics = ({ gtmId }: ConsentAwareAnalyticsProps) => {
  const { canUseAnalytics, canUseMarketing, hasConsent } = useConsentCheck();

  // Initialize Google consent mode with default denied state
  const initializeGoogleConsent = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Set default consent state
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
      });

      // Update consent based on user preferences
      if (hasConsent) {
        window.gtag('consent', 'update', {
          analytics_storage: canUseAnalytics ? 'granted' : 'denied',
          ad_storage: canUseMarketing ? 'granted' : 'denied',
          ad_user_data: canUseMarketing ? 'granted' : 'denied',
          ad_personalization: canUseMarketing ? 'granted' : 'denied',
        });
      }
    }
  };

  return (
    <>
      {/* Google Tag Manager - Always load but with consent controls */}
      {gtmId && process.env.NODE_ENV === 'production' && (
        <>
          <Script
            id='gtag-base'
            strategy='afterInteractive'
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gtmId}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `,
            }}
          />

          <Script
            id='google-tag-manager'
            strategy='afterInteractive'
            src={`https://www.googletagmanager.com/gtag/js?id=${gtmId}`}
            onLoad={initializeGoogleConsent}
          />

          <Script
            id='google-tag-manager-inline'
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
        </>
      )}

      {/* Vercel Analytics - Only load if analytics consent is given */}
      {canUseAnalytics && <Analytics />}

      {/* Vercel Speed Insights - Only load if analytics consent is given */}
      {canUseAnalytics && <SpeedInsights />}
    </>
  );
};

export default ConsentAwareAnalytics;

// Hook for tracking events with consent awareness
export function useConsentAwareTracking() {
  const { canUseAnalytics, canUseMarketing } = useConsentCheck();

  const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
    if (!canUseAnalytics) {
      return;
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        consent_analytics: canUseAnalytics,
        consent_marketing: canUseMarketing,
      });
    }
  };

  const trackPageView = (url: string, title?: string) => {
    if (!canUseAnalytics) {
      return;
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID ?? '', {
        page_title: title ?? document.title,
        page_location: url,
      });
    }
  };

  return {
    trackEvent,
    trackPageView,
    canTrack: canUseAnalytics,
    canUseMarketing,
  };
}
