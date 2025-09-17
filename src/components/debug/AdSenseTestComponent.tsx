/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useState } from 'react';
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
}

export default function AdSenseTestComponent() {
  const [testInfo, setTestInfo] = useState<AdSenseTestInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { hasConsent, canUseMarketing } = useConsentCheck();

  const refreshInfo = () => {
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
      };

      setTestInfo(info);
      setIsRefreshing(false);
    }, 100);
  };

  useEffect(() => {
    refreshInfo();
  }, [hasConsent, canUseMarketing]);

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
      </div>

      <div className='mt-4 rounded border bg-white p-3 dark:bg-gray-700'>
        <h4 className='mb-2 font-medium'>Overall Status</h4>
        {testInfo.scriptLoaded && testInfo.managerReady && !testInfo.isBlocked ? (
          <p className='text-green-600 dark:text-green-400'>
            ✅ AdSense appears to be working correctly
          </p>
        ) : testInfo.scriptError ? (
          <p className='text-red-600 dark:text-red-400'>❌ AdSense script failed to load</p>
        ) : !testInfo.hasConsent || !testInfo.canUseMarketing ? (
          <p className='text-yellow-600 dark:text-yellow-400'>⏳ Waiting for marketing consent</p>
        ) : testInfo.isBlocked ? (
          <p className='text-red-600 dark:text-red-400'>🚫 AdSense appears to be blocked</p>
        ) : (
          <p className='text-yellow-600 dark:text-yellow-400'>⏳ AdSense is loading...</p>
        )}
      </div>
    </div>
  );
}
