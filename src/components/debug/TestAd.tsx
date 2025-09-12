'use client';

import { useEffect, useRef, useState } from 'react';
import { adsenseManager } from '@/lib/ads/adsenseInit';

const TestAd = () => {
  const adRef = useRef<HTMLModElement>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadTestAd = async () => {
      try {
        // eslint-disable-next-line no-console
        console.log('TestAd: Starting test ad load...');

        if (!adRef.current) {
          throw new Error('Ad element ref not available');
        }

        // Check if we're already in fallback mode
        if (adsenseManager.isInFallbackMode()) {
          // eslint-disable-next-line no-console
          console.log('TestAd: Using fallback mode');
          setStatus('success');
          return;
        }

        // Wait a bit for AdSense to initialize if needed
        let initAttempts = 0;
        const maxAttempts = 5;

        while (
          !adsenseManager.isInitialized() &&
          !adsenseManager.isInFallbackMode() &&
          initAttempts < maxAttempts
        ) {
          // eslint-disable-next-line no-console
          console.log(`TestAd: Waiting for AdSense initialization (attempt ${initAttempts + 1})`);
          await new Promise((resolve) => setTimeout(resolve, 500));
          initAttempts++;
        }

        const success = await adsenseManager.pushAd(adRef.current);
        if (success) {
          setStatus('success');
          // eslint-disable-next-line no-console
          console.log('TestAd: Successfully loaded');

          // Check if we're in fallback mode
          const status = adRef.current.getAttribute('data-ad-status');
          if (status === 'fallback') {
            // eslint-disable-next-line no-console
            console.log('TestAd: Loaded in fallback mode');
          }
        } else {
          throw new Error('Failed to push ad');
        }
      } catch (err) {
        console.error('TestAd: Error loading ad:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
      }
    };

    // Delay to ensure DOM is ready
    const timer = setTimeout(loadTestAd, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='m-4 border-2 border-dashed border-blue-500 bg-blue-50 p-4 dark:bg-blue-900/20'>
      <h3 className='mb-2 text-sm font-bold text-blue-700 dark:text-blue-300'>
        Test Ad Component
      </h3>

      <div className='mb-2 text-xs'>
        Status:{' '}
        <span
          className={`font-mono ${
            status === 'success'
              ? 'text-green-600'
              : status === 'error'
                ? 'text-red-600'
                : 'text-yellow-600'
          }`}
        >
          {status.toUpperCase()}
        </span>
      </div>

      {error && <div className='mb-2 text-xs text-red-600'>Error: {error}</div>}

      <div className='min-h-[100px] border border-gray-300 bg-white p-2'>
        <div className='mb-1 text-center text-xs text-gray-500'>Advertisement</div>
        <ins
          ref={adRef}
          className='adsbygoogle'
          style={{
            display: 'block',
            width: '100%',
            height: '90px',
          }}
          data-ad-client='ca-pub-7412827340538951'
          data-ad-slot='3403906737'
          data-ad-format='auto'
          data-full-width-responsive='true'
        />

        {status === 'loading' && (
          <div className='flex h-16 items-center justify-center text-xs text-gray-400'>
            Loading test ad...
          </div>
        )}

        {status === 'error' && (
          <div className='flex h-16 items-center justify-center text-xs text-red-400'>
            Failed to load ad
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAd;
