/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useState } from 'react';

interface TroubleshootingCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'unknown';
  message: string;
  solution?: string;
}

export default function AdSenseTroubleshooter() {
  const [checks, setChecks] = useState<TroubleshootingCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: TroubleshootingCheck[] = [];

    // Check 1: Environment
    const isProduction = process.env.NODE_ENV === 'production';
    results.push({
      name: 'Environment Check',
      status: isProduction ? 'pass' : 'warning',
      message: `Running in ${process.env.NODE_ENV} mode`,
      solution: isProduction ? undefined : 'AdSense typically doesn\'t serve ads in development. Test on production domain.',
    });

    // Check 2: Publisher ID
    const publisherId = process.env.NEXT_PUBLIC_GAS_ID;
    results.push({
      name: 'Publisher ID',
      status: publisherId ? 'pass' : 'fail',
      message: publisherId ? `Publisher ID: ${publisherId}` : 'Publisher ID not configured',
      solution: publisherId ? undefined : 'Set NEXT_PUBLIC_GAS_ID in your environment variables',
    });

    // Check 3: Domain
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
    const isLocalhost = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
    results.push({
      name: 'Domain Check',
      status: isLocalhost ? 'warning' : 'pass',
      message: `Current domain: ${currentDomain}`,
      solution: isLocalhost ? 'AdSense doesn\'t serve ads on localhost. Test on your production domain.' : undefined,
    });

    // Check 4: AdSense Script
    const scriptLoaded = typeof window !== 'undefined' && window.adsenseLoaded;
    results.push({
      name: 'AdSense Script',
      status: scriptLoaded ? 'pass' : 'fail',
      message: scriptLoaded ? 'AdSense script loaded successfully' : 'AdSense script not loaded',
      solution: scriptLoaded ? undefined : 'Check console for script loading errors',
    });

    // Check 5: AdsByGoogle Array
    const arrayExists = typeof window !== 'undefined' && window.adsbygoogle && Array.isArray(window.adsbygoogle);
    results.push({
      name: 'AdsByGoogle Array',
      status: arrayExists ? 'pass' : 'fail',
      message: arrayExists ? 'AdsByGoogle array is available' : 'AdsByGoogle array not found',
      solution: arrayExists ? undefined : 'AdSense script may not have loaded properly',
    });

    // Check 6: Ad Blocker Detection
    let adBlockerDetected = false;
    if (typeof window !== 'undefined') {
      try {
        const testElement = document.createElement('div');
        testElement.innerHTML = '&nbsp;';
        testElement.className = 'adsbox';
        document.body.appendChild(testElement);
        adBlockerDetected = window.getComputedStyle(testElement).display === 'none';
        document.body.removeChild(testElement);
      } catch {
        // Ignore errors
      }
    }
    results.push({
      name: 'Ad Blocker Detection',
      status: adBlockerDetected ? 'warning' : 'pass',
      message: adBlockerDetected ? 'Ad blocker detected' : 'No ad blocker detected',
      solution: adBlockerDetected ? 'Disable ad blocker to test ads properly' : undefined,
    });

    // Check 7: HTTPS
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    results.push({
      name: 'HTTPS Check',
      status: isHttps ? 'pass' : 'warning',
      message: isHttps ? 'Site is using HTTPS' : 'Site is not using HTTPS',
      solution: isHttps ? undefined : 'AdSense requires HTTPS for production sites',
    });

    // Check 8: Content Policy (basic check)
    const hasContent = typeof document !== 'undefined' && document.body.innerText.length > 500;
    results.push({
      name: 'Content Check',
      status: hasContent ? 'pass' : 'warning',
      message: hasContent ? 'Page has sufficient content' : 'Page may have insufficient content',
      solution: hasContent ? undefined : 'Ensure pages have substantial, original content',
    });

    setChecks(results);
    setIsRunning(false);
  };

  useEffect(() => {
    // Run diagnostics on mount
    setTimeout(runDiagnostics, 1000);
  }, []);

  const getStatusIcon = (status: TroubleshootingCheck['status']) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'warning': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: TroubleshootingCheck['status']) => {
    switch (status) {
      case 'pass': return 'text-green-600 dark:text-green-400';
      case 'fail': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">AdSense Troubleshooter</h3>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run Diagnostics'}
        </button>
      </div>

      <div className="space-y-3">
        {checks.map((check, index) => (
          <div key={index} className="rounded border bg-white p-3 dark:bg-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-lg">{getStatusIcon(check.status)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{check.name}</h4>
                  <span className={`text-sm ${getStatusColor(check.status)}`}>
                    {check.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{check.message}</p>
                {check.solution && (
                  <div className="mt-2 rounded bg-yellow-50 p-2 dark:bg-yellow-900/20">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Solution:</strong> {check.solution}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {checks.length > 0 && (
        <div className="mt-4 rounded border bg-blue-50 p-3 dark:bg-blue-900/20">
          <h4 className="font-medium text-blue-800 dark:text-blue-200">Summary</h4>
          <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
            <div>✅ Passed: {checks.filter(c => c.status === 'pass').length}</div>
            <div>⚠️ Warnings: {checks.filter(c => c.status === 'warning').length}</div>
            <div>❌ Failed: {checks.filter(c => c.status === 'fail').length}</div>
          </div>
        </div>
      )}

      <div className="mt-4 rounded border bg-gray-50 p-3 dark:bg-gray-900">
        <h4 className="font-medium">Common Reasons for Unfilled Ads:</h4>
        <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>• <strong>New Account:</strong> AdSense approval can take 24-48 hours to start serving ads</li>
          <li>• <strong>Traffic Requirements:</strong> Low traffic sites may not receive ads</li>
          <li>• <strong>Geographic Targeting:</strong> Limited ad inventory in some regions</li>
          <li>• <strong>Content Matching:</strong> No relevant ads available for your content</li>
          <li>• <strong>Policy Issues:</strong> Content may violate AdSense policies</li>
          <li>• <strong>Technical Issues:</strong> Incorrect implementation or blocked requests</li>
        </ul>
      </div>
    </div>
  );
}
