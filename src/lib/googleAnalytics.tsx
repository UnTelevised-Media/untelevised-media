/* eslint-disable react/function-component-definition */
/* eslint-disable react/no-unescaped-entities */
'use client';
import * as React from 'react';
import Script from 'next/script';
import { useEffect } from 'react';
import { useRouter } from 'next/router';


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

// via https://github.com/vercel/next.js/blob/86a0c7b0f7133362b5a5358428fe8ca334fe394e/examples/with-google-analytics/lib/gtag.js
export function pageView(url: string) {
  window.gtag('config', process.env.GOOGLEANALYTICS_ID, {
    page_path: url,
  });
}

export const event = ({ action, category, label, value }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

export function useGAPageviewTracking() {
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url) => {
      pageView(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])
}