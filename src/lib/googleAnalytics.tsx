'use client';
/* eslint-disable react/function-component-definition */
/* eslint-disable react/no-unescaped-entities */
import * as React from 'react';
import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pageView } from './pageTracker';

export default function GATag({
  googleAnalyticsId,
}: {
  googleAnalyticsId: string;
}) {
  return (
    <>

      <Script
        strategy='afterInteractive'
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
      />
      <Script
        id='google-analytics'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('consent', 'default', {
                    'analytics_storage': 'denied'
                });
                
                gtag('config', '${googleAnalyticsId}', {
                    page_path: window.location.pathname,
                });
                `,
        }}
      />
    </>
  );
  
}

// via https://gaudion.dev/blog/setup-google-analytics-with-gdpr-compliant-cookie-consent-in-nextjs13
export function useGAPageviewTracking({
  googleAnalyticsId,
}: {
  googleAnalyticsId: string;
}) {

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + searchParams.toString();
    
    pageView(url);
  }, [pathname, searchParams, googleAnalyticsId]);

}