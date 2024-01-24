/* eslint-disable react/function-component-definition */
import Script from 'next/script';

export default function LargeAdCard({
  googleAdsenseId,
}: {
  googleAdsenseId: string;
}) {
  return (
    <div className='flex h-full w-full'>
      <ins
        className='adsbygoogle'
        style={{ display: 'block' }}
        data-ad-client='ca-pub-7412827340538951'
        data-ad-slot='9662364496'
        data-ad-format='auto'
        data-full-width-responsive='true'
      />

      <Script id='GAS'>
        (adsbygoogle = window.adsbygoogle || []).push({});
      </Script>
    </div>
  );
}
