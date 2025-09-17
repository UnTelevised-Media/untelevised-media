/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef, useState } from 'react';
import { adsenseManager } from '@/lib/ads/adsenseInit';
import { useConsentCheck } from '@/lib/consent/context';

interface TestAdProps {
  slot?: string;
  format?: string;
  responsive?: boolean;
  width?: number;
  height?: number;
}

export default function TestAdComponent({
  slot = '1234567890',
  format = 'auto',
  responsive = true,
  width = 320,
  height = 100,
}: TestAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [adStatus, setAdStatus] = useState<'loading' | 'loaded' | 'unfilled' | 'error'>('loading');
  const [isClient, setIsClient] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { hasConsent, canUseMarketing } = useConsentCheck();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`TestAd: ${message}`);
  };

  useEffect(() => {
    setIsClient(true);
    addLog('Component mounted');
  }, []);

  useEffect(() => {
    if (!isClient || !adRef.current) {
      return;
    }

    if (!hasConsent || !canUseMarketing) {
      addLog('Waiting for consent...');
      return;
    }

    const loadTestAd = async () => {
      try {
        addLog('Starting ad load process...');
        
        if (!adRef.current) {
          addLog('Ad element not found');
          return;
        }

        // Wait a bit for everything to be ready
        await new Promise(resolve => setTimeout(resolve, 500));

        addLog('Pushing ad to AdSense...');
        const success = await adsenseManager.pushAd(adRef.current);
        
        if (success) {
          addLog('Ad pushed successfully');
          setAdStatus('loaded');
          
          // Monitor for unfilled ads
          setTimeout(() => {
            if (adRef.current) {
              const status = adRef.current.getAttribute('data-ad-status');
              if (status === 'unfilled') {
                setAdStatus('unfilled');
                addLog('Ad marked as unfilled after timeout');
              } else if (status === 'processing') {
                addLog('Ad still processing...');
              }
            }
          }, 6000);
        } else {
          addLog('Failed to push ad');
          setAdStatus('error');
        }
      } catch (error) {
        addLog(`Error loading ad: ${error}`);
        setAdStatus('error');
      }
    };

    loadTestAd();
  }, [isClient, hasConsent, canUseMarketing]);

  const getStatusColor = () => {
    switch (adStatus) {
      case 'loaded': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'unfilled': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getStatusIcon = () => {
    switch (adStatus) {
      case 'loaded': return '✅';
      case 'unfilled': return '⚠️';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  if (!isClient) {
    return <div className="p-4 border rounded">Loading test ad component...</div>;
  }

  return (
    <div className={`border-2 rounded-lg p-4 ${getStatusColor()}`}>
      <div className="mb-4">
        <h4 className="font-semibold flex items-center gap-2">
          {getStatusIcon()} Test Ad Component
          <span className="text-sm font-normal">({adStatus})</span>
        </h4>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Slot: {slot} | Format: {format} | Responsive: {responsive.toString()}
        </div>
      </div>

      {/* The actual ad */}
      <div className="mb-4 border border-dashed border-gray-300 p-2">
        <div className="text-xs text-gray-500 mb-1">Ad Container:</div>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: responsive ? 'block' : 'inline-block',
            width: responsive ? '100%' : `${width}px`,
            height: responsive ? 'auto' : `${height}px`,
            minHeight: `${height}px`,
            backgroundColor: '#f8f9fa',
          }}
          data-ad-client="ca-pub-7412827340538951"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive.toString()}
        />
      </div>

      {/* Status and logs */}
      <div className="space-y-2">
        <div className="text-sm">
          <strong>Status:</strong> {adStatus}
        </div>
        
        <div className="text-sm">
          <strong>Consent:</strong> {hasConsent ? '✅' : '❌'} | 
          <strong> Marketing:</strong> {canUseMarketing ? '✅' : '❌'}
        </div>

        <details className="text-xs">
          <summary className="cursor-pointer font-medium">View Logs ({logs.length})</summary>
          <div className="mt-2 max-h-32 overflow-y-auto bg-gray-100 dark:bg-gray-800 p-2 rounded">
            {logs.map((log, index) => (
              <div key={index} className="font-mono text-xs">
                {log}
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
