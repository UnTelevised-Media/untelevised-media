/* eslint-disable react/function-component-definition */
import Script from 'next/script';

export default function GASVerify({
  googleAdsenseId,
}: {
  googleAdsenseId: string;
}) {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdsenseId}`}
      strategy='lazyOnload'
      crossOrigin='anonymous'
    />
  );
}
