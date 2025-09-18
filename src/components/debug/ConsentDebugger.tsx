/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useConsent, useConsentCheck } from '@/lib/consent/context';
import { consentStorage } from '@/lib/consent/storage';

interface ConsentDebugInfo {
  contextState: {
    preferences: unknown;
    status: string;
    showBanner: boolean;
    isLoading: boolean;
  };
  checkResults: {
    canUseAnalytics: boolean;
    canUseMarketing: boolean;
    canUsePreferences: boolean;
    hasConsent: boolean;
    isFullyConsented: boolean;
  };
  storageData: unknown;
  localStorageRaw: string | null;
}

export default function ConsentDebugger() {
  const [debugInfo, setDebugInfo] = useState<ConsentDebugInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const consentContext = useConsent();
  const consentCheck = useConsentCheck();

  const refreshInfo = useCallback(() => {
    setIsRefreshing(true);

    setTimeout(() => {
      const storageData = consentStorage.loadConsent();
      const localStorageRaw =
        typeof window !== 'undefined' ? localStorage.getItem('gdpr-consent') : null;

      const info: ConsentDebugInfo = {
        contextState: {
          preferences: consentContext.preferences,
          status: consentContext.status,
          showBanner: consentContext.showBanner,
          isLoading: consentContext.isLoading,
        },
        checkResults: consentCheck,
        storageData,
        localStorageRaw,
      };

      setDebugInfo(info);
      setIsRefreshing(false);
    }, 100);
  }, [
    consentContext.preferences,
    consentContext.status,
    consentContext.showBanner,
    consentContext.isLoading,
    consentCheck,
  ]);

  useEffect(() => {
    refreshInfo();
  }, [refreshInfo]);

  const clearConsent = () => {
    consentStorage.clearConsent();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gdpr-consent');
    }
    refreshInfo();
  };

  const forceAcceptAll = async () => {
    await consentContext.acceptAll();
    refreshInfo();
  };

  if (!debugInfo) {
    return (
      <div className='rounded-lg bg-yellow-100 p-4 dark:bg-yellow-900'>
        <p>Loading consent debug info...</p>
      </div>
    );
  }

  return (
    <div className='rounded-lg bg-yellow-100 p-4 dark:bg-yellow-900'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Consent Debug Info</h3>
        <div className='space-x-2'>
          <button
            onClick={refreshInfo}
            disabled={isRefreshing}
            className='rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:opacity-50'
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={clearConsent}
            className='rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700'
          >
            Clear Consent
          </button>
          <button
            onClick={forceAcceptAll}
            className='rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700'
          >
            Force Accept All
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
        <div className='space-y-2'>
          <h4 className='font-medium'>Context State</h4>
          <div>
            Status: <span className='font-mono'>{debugInfo.contextState.status}</span>
          </div>
          <div>
            Loading:{' '}
            <span className='font-mono'>{debugInfo.contextState.isLoading.toString()}</span>
          </div>
          <div>
            Show Banner:{' '}
            <span className='font-mono'>{debugInfo.contextState.showBanner.toString()}</span>
          </div>
          <div>Preferences:</div>
          <pre className='overflow-auto rounded bg-white p-2 text-xs dark:bg-gray-800'>
            {JSON.stringify(debugInfo.contextState.preferences, null, 2)}
          </pre>
        </div>

        <div className='space-y-2'>
          <h4 className='font-medium'>Check Results</h4>
          <div>
            Has Consent:{' '}
            <span className='font-mono'>{debugInfo.checkResults.hasConsent.toString()}</span>
          </div>
          <div>
            Can Use Marketing:{' '}
            <span className='font-mono'>{debugInfo.checkResults.canUseMarketing.toString()}</span>
          </div>
          <div>
            Can Use Analytics:{' '}
            <span className='font-mono'>{debugInfo.checkResults.canUseAnalytics.toString()}</span>
          </div>
          <div>
            Fully Consented:{' '}
            <span className='font-mono'>{debugInfo.checkResults.isFullyConsented.toString()}</span>
          </div>
        </div>
      </div>

      <div className='mt-4 space-y-2'>
        <h4 className='font-medium'>Storage Data</h4>
        <div>
          <strong>Parsed Storage:</strong>
          <pre className='max-h-32 overflow-auto rounded bg-white p-2 text-xs dark:bg-gray-800'>
            {JSON.stringify(debugInfo.storageData, null, 2)}
          </pre>
        </div>
        <div>
          <strong>Raw LocalStorage:</strong>
          <pre className='max-h-32 overflow-auto rounded bg-white p-2 text-xs dark:bg-gray-800'>
            {debugInfo.localStorageRaw ?? 'null'}
          </pre>
        </div>
      </div>
    </div>
  );
}
