'use client';

import { useEffect, useState } from 'react';
import { useConsentCheck } from '@/lib/consent/context';
import { adsenseManager } from '@/lib/ads/adsenseInit';

interface DebugInfo {
  environment: string;
  gasId: string | undefined;
  hasConsent: boolean;
  canUseMarketing: boolean;
  adsenseScriptLoaded: boolean;
  adsenseArrayExists: boolean;
  adsenseInitialized: boolean;
  adBlockerDetected: boolean;
  windowAdsbygoogle: unknown;
  errors: string[];
}

const AdDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const { hasConsent, canUseMarketing } = useConsentCheck();

  useEffect(() => {
    const collectDebugInfo = async () => {
      const errors: string[] = [];

      // Check environment
      const environment = process.env.NODE_ENV || 'unknown';

      // Check GAS_ID
      const gasId = process.env.NEXT_PUBLIC_GAS_ID;
      if (!gasId) {
        errors.push('NEXT_PUBLIC_GAS_ID environment variable is not set');
      }

      // Auto-initialize AdSense if consent is available but not initialized
      if (hasConsent && canUseMarketing && !adsenseManager.isInitialized()) {
        try {
          // eslint-disable-next-line no-console
          console.log('AdDebugger: Auto-initializing AdSense...');
          await adsenseManager.initialize();
        } catch (error) {
           
          console.error('AdDebugger: Auto-initialization failed:', error);
        }
      }

      // Check AdSense script
      const adsenseScript = document.querySelector('script[src*="adsbygoogle.js"]');
      const adsenseScriptLoaded = !!adsenseScript;

      if (!adsenseScriptLoaded) {
        errors.push('AdSense script not found in DOM');
      }

      // Check window.adsbygoogle
      const adsenseArrayExists = !!(window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle;
      const windowAdsbygoogle = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle;

      // Check AdSense manager
      const adsenseInitialized = adsenseManager.isInitialized();

      // Simple ad blocker detection
      let adBlockerDetected = false;
      try {
        const testDiv = document.createElement('div');
        testDiv.innerHTML = '&nbsp;';
        testDiv.className = 'adsbox';
        testDiv.style.position = 'absolute';
        testDiv.style.left = '-10000px';
        document.body.appendChild(testDiv);

        setTimeout(() => {
          if (testDiv.offsetHeight === 0) {
            adBlockerDetected = true;
            errors.push('Ad blocker detected');
          }
          document.body.removeChild(testDiv);
        }, 100);
      } catch {
        errors.push('Error during ad blocker detection');
      }

      setDebugInfo({
        environment,
        gasId,
        hasConsent,
        canUseMarketing,
        adsenseScriptLoaded,
        adsenseArrayExists,
        adsenseInitialized,
        adBlockerDetected,
        windowAdsbygoogle,
        errors,
      });
    };

    collectDebugInfo();
  }, [hasConsent, canUseMarketing]);

  // Only show in development or when explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className='fixed bottom-4 right-4 z-50 rounded bg-red-500 px-3 py-1 text-xs text-white'
      >
        Debug Ads
      </button>
    );
  }

  if (!debugInfo) {
    return (
      <div className='fixed bottom-4 right-4 z-50 rounded bg-gray-500 px-3 py-1 text-xs text-white'>
        Loading debug info...
      </div>
    );
  }

  return (
    <div className='fixed bottom-4 right-4 z-50 max-w-md rounded-lg bg-black p-4 font-mono text-xs text-white'>
      <div className='mb-2 flex items-center justify-between'>
        <h3 className='text-sm font-bold'>Ad Debug Info</h3>
        <button onClick={() => setShowDebug(false)} className='text-red-400 hover:text-red-300'>
          ×
        </button>
      </div>

      <div className='space-y-1'>
        <div>
          Environment: <span className='text-yellow-300'>{debugInfo.environment}</span>
        </div>
        <div>
          GAS_ID:{' '}
          <span className={debugInfo.gasId ? 'text-green-300' : 'text-red-300'}>
            {debugInfo.gasId ?? 'NOT SET'}
          </span>
        </div>
        <div>
          Has Consent:{' '}
          <span className={debugInfo.hasConsent ? 'text-green-300' : 'text-red-300'}>
            {debugInfo.hasConsent.toString()}
          </span>
        </div>
        <div>
          Can Use Marketing:{' '}
          <span className={debugInfo.canUseMarketing ? 'text-green-300' : 'text-red-300'}>
            {debugInfo.canUseMarketing.toString()}
          </span>
        </div>
        <div>
          AdSense Script:{' '}
          <span className={debugInfo.adsenseScriptLoaded ? 'text-green-300' : 'text-red-300'}>
            {debugInfo.adsenseScriptLoaded ? 'LOADED' : 'NOT LOADED'}
          </span>
        </div>
        <div>
          AdSense Array:{' '}
          <span className={debugInfo.adsenseArrayExists ? 'text-green-300' : 'text-red-300'}>
            {debugInfo.adsenseArrayExists ? 'EXISTS' : 'MISSING'}
          </span>
        </div>
        <div>
          AdSense Initialized:{' '}
          <span className={debugInfo.adsenseInitialized ? 'text-green-300' : 'text-red-300'}>
            {debugInfo.adsenseInitialized.toString()}
          </span>
        </div>
        <div>
          Ad Blocker:{' '}
          <span className={debugInfo.adBlockerDetected ? 'text-red-300' : 'text-green-300'}>
            {debugInfo.adBlockerDetected ? 'DETECTED' : 'NOT DETECTED'}
          </span>
        </div>

        {debugInfo.windowAdsbygoogle && Array.isArray(debugInfo.windowAdsbygoogle) ? (
          <div>
            AdSense Array Length:{' '}
            <span className='text-blue-300'>
              {(debugInfo.windowAdsbygoogle as unknown[]).length}
            </span>
          </div>
        ) : null}

        {debugInfo.errors.length > 0 && (
          <div className='mt-2'>
            <div className='font-bold text-red-300'>Errors:</div>
            {debugInfo.errors.map((error, index) => (
              <div key={index} className='text-red-200'>
                • {error}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='mt-3 space-y-1'>
        <button
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log('Debug Info:', debugInfo);
            // eslint-disable-next-line no-console
            console.log(
              'Window adsbygoogle:',
              (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle
            );
          }}
          className='mr-2 rounded bg-blue-600 px-2 py-1 text-xs hover:bg-blue-700'
        >
          Log to Console
        </button>

        <button
          onClick={async () => {
            try {
              const result = await adsenseManager.initialize();
              // eslint-disable-next-line no-console
              console.log('AdSense initialization result:', result);
              alert(`AdSense initialization: ${result ? 'SUCCESS' : 'FAILED'}`);
            } catch (error) {
               
              console.error('AdSense initialization error:', error);
              alert(`AdSense initialization error: ${error}`);
            }
          }}
          className='rounded bg-green-600 px-2 py-1 text-xs hover:bg-green-700'
        >
          Test Init
        </button>
      </div>
    </div>
  );
};

export default AdDebugger;
