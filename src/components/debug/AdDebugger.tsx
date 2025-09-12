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
  adsenseBlocked: boolean;
  fallbackMode: boolean;
  failedAttempts: number;
  windowAdsbygoogle: unknown;
  scriptCount: number;
  errors: string[];
  warnings: string[];
}

const AdDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { hasConsent, canUseMarketing } = useConsentCheck();

  const collectDebugInfo = async () => {
    setIsRefreshing(true);
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check environment
      const environment = process.env.NODE_ENV || 'unknown';

      // Check GAS_ID
      const gasId = process.env.NEXT_PUBLIC_GAS_ID;
      if (!gasId) {
        errors.push('NEXT_PUBLIC_GAS_ID environment variable is not set');
      }

      // Wait a moment for any ongoing initialization to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check AdSense manager state
      const adsenseInitialized = adsenseManager.isInitialized();
      const adsenseBlocked = adsenseManager.isLikelyBlocked();
      const fallbackMode = adsenseManager.isInFallbackMode();
      const failedAttempts = adsenseManager.getFailedAttempts();

      // Check if auto-initialization should happen (but don't force it)
      const shouldAutoInit = hasConsent && canUseMarketing && !adsenseInitialized && !fallbackMode;
      if (shouldAutoInit) {
        warnings.push(
          'AdSense should be initialized but is not - check ConsentAwareGoogleAdSense component'
        );
      }

      // Check AdSense scripts (count all)
      const adsenseScripts = document.querySelectorAll('script[src*="adsbygoogle.js"]');
      const adsenseScriptLoaded = adsenseScripts.length > 0;
      const scriptCount = adsenseScripts.length;

      if (!adsenseScriptLoaded && !fallbackMode) {
        warnings.push('AdSense script not found in DOM');
      } else if (scriptCount > 1) {
        warnings.push(
          `Multiple AdSense scripts found (${scriptCount}) - this may cause conflicts`
        );
      }

      // Check window.adsbygoogle
      const adsenseArrayExists = !!(window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle;
      const windowAdsbygoogle = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle;

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
            if (environment === 'development') {
              warnings.push('Ad blocker detected (normal in development)');
            } else {
              errors.push('Ad blocker detected');
            }
          }
          document.body.removeChild(testDiv);
        }, 100);
      } catch {
        warnings.push('Error during ad blocker detection');
      }

      // Additional checks for blocked state
      if (adsenseBlocked) {
        warnings.push('AdSense appears to be blocked by ad blocker or network filter');
      }

      if (fallbackMode) {
        warnings.push('AdSense is running in fallback mode (development with ad blocker)');
      }

      if (failedAttempts > 0) {
        warnings.push(`AdSense has ${failedAttempts} failed initialization attempts`);
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
        adsenseBlocked,
        fallbackMode,
        failedAttempts,
        windowAdsbygoogle,
        scriptCount,
        errors,
        warnings,
      });
    } catch (error) {
      console.error('Error collecting debug info:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    collectDebugInfo();

    // Set up periodic refresh to catch state changes
    const interval = setInterval(collectDebugInfo, 2000);

    return () => clearInterval(interval);
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
        <div className='flex items-center gap-2'>
          <button
            onClick={collectDebugInfo}
            disabled={isRefreshing}
            className='text-green-400 hover:text-green-300 disabled:text-green-600'
            title='Refresh debug info'
          >
            {isRefreshing ? '⟳' : '↻'}
          </button>
          <button onClick={() => setShowDebug(false)} className='text-red-400 hover:text-red-300'>
            ×
          </button>
        </div>
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
        <div>
          AdSense Blocked:{' '}
          <span className={debugInfo.adsenseBlocked ? 'text-red-300' : 'text-green-300'}>
            {debugInfo.adsenseBlocked ? 'YES' : 'NO'}
          </span>
        </div>
        <div>
          Fallback Mode:{' '}
          <span className={debugInfo.fallbackMode ? 'text-yellow-300' : 'text-green-300'}>
            {debugInfo.fallbackMode ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
        <div>
          Failed Attempts:{' '}
          <span className={debugInfo.failedAttempts > 0 ? 'text-yellow-300' : 'text-green-300'}>
            {debugInfo.failedAttempts}
          </span>
        </div>
        <div>
          Script Count:{' '}
          <span className={debugInfo.scriptCount > 1 ? 'text-yellow-300' : 'text-blue-300'}>
            {debugInfo.scriptCount}
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

        {debugInfo.warnings.length > 0 && (
          <div className='mt-2'>
            <div className='font-bold text-yellow-300'>Warnings:</div>
            {debugInfo.warnings.map((warning, index) => (
              <div key={index} className='text-yellow-200'>
                • {warning}
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
