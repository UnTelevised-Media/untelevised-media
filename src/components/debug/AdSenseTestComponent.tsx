/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { adsenseManager } from '@/lib/ads/adsenseInit';
import { useConsentCheck } from '@/lib/consent/context';

interface AdSenseTestInfo {
  scriptLoaded: boolean;
  scriptError: boolean;
  arrayExists: boolean;
  managerReady: boolean;
  hasConsent: boolean;
  canUseMarketing: boolean;
  isBlocked: boolean;
  failedAttempts: number;
  environment: string;
  publisherId: string;
  currentUrl: string;
  userAgent: string;
  adBlockerDetected: boolean;
}

export default function AdSenseTestComponent() {
  const [testInfo, setTestInfo] = useState<AdSenseTestInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { hasConsent, canUseMarketing } = useConsentCheck();

  // Function to detect ad blockers
  const detectAdBlocker = (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    // Check for common ad blocker indicators
    const adBlockerTests = [
      () =>
        window.getComputedStyle(document.createElement('div')).getPropertyValue('display') ===
        'none',
      () => !window.adsbygoogle || window.adsbygoogle.length === 0,
      () => {
        const testElement = document.createElement('div');
        testElement.innerHTML = '&nbsp;';
        testElement.className = 'adsbox';
        document.body.appendChild(testElement);
        const blocked = window.getComputedStyle(testElement).display === 'none';
        document.body.removeChild(testElement);
        return blocked;
      },
    ];

    return adBlockerTests.some((test) => {
      try {
        return test();
      } catch {
        return false;
      }
    });
  };

  const refreshInfo = useCallback(() => {
    setIsRefreshing(true);

    setTimeout(() => {
      const info: AdSenseTestInfo = {
        scriptLoaded: !!(typeof window !== 'undefined' && window.adsenseLoaded),
        scriptError: !!(typeof window !== 'undefined' && window.adsenseScriptError),
        arrayExists: !!(
          typeof window !== 'undefined' &&
          window.adsbygoogle &&
          Array.isArray(window.adsbygoogle)
        ),
        managerReady: adsenseManager.isReady(),
        hasConsent,
        canUseMarketing,
        isBlocked: adsenseManager.isLikelyBlocked(),
        failedAttempts: adsenseManager.getFailedAttempts(),
        environment: process.env.NODE_ENV ?? 'unknown',
        publisherId: process.env.NEXT_PUBLIC_GAS_ID ?? 'not-set',
        currentUrl: typeof window !== 'undefined' ? window.location.href : 'server-side',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server-side',
        adBlockerDetected: detectAdBlocker(),
      };

      setTestInfo(info);
      setIsRefreshing(false);
    }, 100);
  }, [hasConsent, canUseMarketing, detectAdBlocker]);

  useEffect(() => {
    refreshInfo();
  }, [refreshInfo]);

  if (!testInfo) {
    return (
      <div className='rounded-lg bg-gray-100 p-4 dark:bg-gray-800'>
        <p>Loading AdSense test info...</p>
      </div>
    );
  }

  const getStatusColor = (status: boolean, inverse = false) => {
    const isGood = inverse ? !status : status;
    return isGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  return (
    <div className='rounded-lg bg-gray-100 p-4 dark:bg-gray-800'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>AdSense Status Test</h3>
        <button
          onClick={refreshInfo}
          disabled={isRefreshing}
          className='rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:opacity-50'
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
        <div className='space-y-2'>
          <h4 className='font-medium'>Script Status</h4>
          <div className={`${getStatusColor(testInfo.scriptLoaded)}`}>
            Script Loaded: {testInfo.scriptLoaded ? 'YES' : 'NO'}
          </div>
          <div className={`${getStatusColor(testInfo.scriptError, true)}`}>
            Script Error: {testInfo.scriptError ? 'YES' : 'NO'}
          </div>
          <div className={`${getStatusColor(testInfo.arrayExists)}`}>
            AdsByGoogle Array: {testInfo.arrayExists ? 'EXISTS' : 'MISSING'}
          </div>
          <div className={`${getStatusColor(testInfo.managerReady)}`}>
            Manager Ready: {testInfo.managerReady ? 'YES' : 'NO'}
          </div>
        </div>

        <div className='space-y-2'>
          <h4 className='font-medium'>Consent & Blocking</h4>
          <div className={`${getStatusColor(testInfo.hasConsent)}`}>
            Has Consent: {testInfo.hasConsent ? 'YES' : 'NO'}
          </div>
          <div className={`${getStatusColor(testInfo.canUseMarketing)}`}>
            Marketing Allowed: {testInfo.canUseMarketing ? 'YES' : 'NO'}
          </div>
          <div className={`${getStatusColor(testInfo.isBlocked, true)}`}>
            Is Blocked: {testInfo.isBlocked ? 'YES' : 'NO'}
          </div>
          <div className={`${getStatusColor(testInfo.failedAttempts === 0)}`}>
            Failed Attempts: {testInfo.failedAttempts}
          </div>
        </div>

        <div className='space-y-2'>
          <h4 className='font-medium'>Environment Info</h4>
          <div>Environment: {testInfo.environment}</div>
          <div>Publisher ID: {testInfo.publisherId}</div>
          <div className={`${getStatusColor(!testInfo.adBlockerDetected)}`}>
            Ad Blocker: {testInfo.adBlockerDetected ? 'DETECTED' : 'NOT DETECTED'}
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>
            URL: {testInfo.currentUrl}
          </div>
        </div>
      </div>

      <div className='mt-4 rounded border bg-white p-3 dark:bg-gray-700'>
        <h4 className='mb-2 font-medium'>Overall Status</h4>
        {testInfo.scriptLoaded && testInfo.managerReady && !testInfo.isBlocked ? (
          <div>
            <p className='text-green-600 dark:text-green-400'>
              ✅ AdSense appears to be working correctly
            </p>
            {testInfo.environment === 'development' && (
              <p className='mt-2 text-sm text-yellow-600 dark:text-yellow-400'>
                ⚠️ You&apos;re in development mode. Ads may not show or may show as placeholders.
              </p>
            )}
          </div>
        ) : testInfo.scriptError ? (
          <p className='text-red-600 dark:text-red-400'>❌ AdSense script failed to load</p>
        ) : !testInfo.hasConsent || !testInfo.canUseMarketing ? (
          <p className='text-yellow-600 dark:text-yellow-400'>⏳ Waiting for marketing consent</p>
        ) : testInfo.isBlocked || testInfo.adBlockerDetected ? (
          <p className='text-red-600 dark:text-red-400'>🚫 AdSense appears to be blocked</p>
        ) : (
          <p className='text-yellow-600 dark:text-yellow-400'>⏳ AdSense is loading...</p>
        )}
      </div>

      {/* Troubleshooting Section */}
      <div className='mt-4 rounded border bg-yellow-50 p-3 dark:bg-yellow-900/20'>
        <h4 className='mb-2 font-medium text-yellow-800 dark:text-yellow-200'>
          🔍 Ads Not Showing? Common Causes:
        </h4>
        <ul className='space-y-1 text-sm text-yellow-700 dark:text-yellow-300'>
          <li>
            • <strong>New AdSense Account:</strong> Can take 24-48 hours for ads to start showing
          </li>
          <li>
            • <strong>Low Traffic:</strong> AdSense may not serve ads to sites with minimal traffic
          </li>
          <li>
            • <strong>Content Policy:</strong> Content must comply with AdSense policies
          </li>
          <li>
            • <strong>Geographic Location:</strong> Fewer ads available in some regions
          </li>
          <li>
            • <strong>Ad Inventory:</strong> Google may not have relevant ads for your audience
          </li>
          <li>
            • <strong>Development Mode:</strong> Ads typically don&apos;t show in
            localhost/development
          </li>
          <li>
            • <strong>Ad Blockers:</strong> Browser extensions may block ad requests
          </li>
        </ul>

        <div className='mt-3 text-sm'>
          <strong>Next Steps:</strong>
          <ol className='mt-1 list-inside list-decimal space-y-1 text-yellow-700 dark:text-yellow-300'>
            <li>Verify your AdSense account is fully approved</li>
            <li>Check AdSense dashboard for policy violations</li>
            <li>Test on production domain (not localhost)</li>
            <li>Wait 24-48 hours for new accounts</li>
            <li>Ensure sufficient traffic and quality content</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
