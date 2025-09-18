/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// src/lib/consent/adBlockerDetection.ts
'use client';

import { AdBlockerStatus } from './types';
import { adBlockerStorage } from './storage';

declare global {
  interface Window {
    adsbygoogle: any[];
    adsenseLoaded?: boolean;
    adsenseScriptError?: boolean;
  }
}

export class AdBlockerDetector {
  private static instance: AdBlockerDetector;
  private detectionPromise: Promise<boolean> | null = null;
  private callbacks: ((detected: boolean) => void)[] = [];

  static getInstance(): AdBlockerDetector {
    if (!AdBlockerDetector.instance) {
      AdBlockerDetector.instance = new AdBlockerDetector();
    }
    return AdBlockerDetector.instance;
  }

  // Multiple detection methods for reliability
  async detect(): Promise<boolean> {
    if (this.detectionPromise) {
      return this.detectionPromise;
    }

    this.detectionPromise = this.performDetection();
    const result = await this.detectionPromise;

    // Notify callbacks
    this.callbacks.forEach((callback) => callback(result));

    // Update storage
    this.updateStatus(result);

    return result;
  }

  private async performDetection(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    // In development mode, be more conservative with detection
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      console.log('AdBlockerDetector: Running in development mode');
    }

    // Quick check: if AdSense manager already detected blocking, use that
    try {
      const { adsenseManager } = await import('@/lib/ads/adsenseInit');
      if (adsenseManager.isLikelyBlocked()) {
        console.log('AdBlockerDetector: AdSense manager already detected blocking');
        return true;
      }
    } catch {
      console.warn('AdBlockerDetector: Could not check AdSense manager status');
    }

    // Use faster, less intrusive detection methods first
    const quickDetectionMethods = [
      this.detectByBaitElement(),
      this.detectByAdSenseScript(),
      this.detectByWindowProperties(),
    ];

    // Only use network-based detection if quick methods are inconclusive
    let detectionMethods = quickDetectionMethods;

    try {
      const quickResults = await Promise.allSettled(quickDetectionMethods);
      const quickDetectedCount = quickResults.filter(
        (result) => result.status === 'fulfilled' && result.value === true
      ).length;

      // If we have strong evidence from quick methods, don't do network tests
      if (quickDetectedCount >= 2) {
        console.log('AdBlockerDetector: Quick detection found ad blocker, skipping network tests');
        return true;
      }

      // If quick methods are inconclusive and not in development, add network tests
      if (!isDevelopment && quickDetectedCount < 2) {
        detectionMethods = [
          ...quickDetectionMethods,
          this.detectByGoogleAds(),
          this.detectByFetchBlocking(),
        ];
      }

      const results = await Promise.allSettled(detectionMethods);
      const detectedCount = results.filter(
        (result) => result.status === 'fulfilled' && result.value === true
      ).length;

      // In development, require more evidence of ad blocking
      // In production, also be more conservative to reduce false positives
      const threshold = isDevelopment ? 4 : 3;
      const isBlocked = detectedCount >= threshold;

      if (isDevelopment && isBlocked) {
        console.info('AdBlockerDetector: Ad blocker detected in development mode');
        console.info(
          'AdBlockerDetector: This is normal if you have browser extensions or ad blockers enabled'
        );
      }

      return isBlocked;
    } catch (error) {
      console.warn('Ad blocker detection failed:', error);
      return false;
    }
  }

  // Method 1: Bait element detection
  private detectByBaitElement(): Promise<boolean> {
    return new Promise((resolve) => {
      const bait = document.createElement('div');
      bait.innerHTML = '&nbsp;';
      bait.className = 'adsbox ad-banner advertisement ads';
      bait.style.cssText =
        'position:absolute!important;left:-10000px!important;top:-1000px!important;width:1px!important;height:1px!important;';

      document.body.appendChild(bait);

      setTimeout(() => {
        const detected =
          bait.offsetHeight === 0 ||
          bait.offsetWidth === 0 ||
          bait.style.display === 'none' ||
          bait.style.visibility === 'hidden';

        document.body.removeChild(bait);
        resolve(detected);
      }, 100);
    });
  }

  // Method 2: AdSense script detection (improved to reduce false positives)
  private detectByAdSenseScript(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if AdSense script explicitly failed to load
      if (typeof window !== 'undefined' && window.adsenseScriptError) {
        resolve(true);
        return;
      }

      // If AdSense is not loaded yet, don't assume it's blocked
      if (!window.adsbygoogle) {
        resolve(false); // Changed from true to false to reduce false positives
        return;
      }

      // Only test if we have a proper AdSense setup
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
      if (!existingScript) {
        resolve(false); // No script means we haven't tried to load it yet
        return;
      }

      // Check if AdSense is blocked by testing a minimal ad element
      const testAd = document.createElement('ins');
      testAd.className = 'adsbygoogle';
      testAd.style.cssText =
        'display:block;width:1px;height:1px;position:absolute;left:-10000px;top:-10000px;visibility:hidden;';
      testAd.setAttribute('data-ad-client', 'ca-pub-test');
      testAd.setAttribute('data-ad-slot', '1234567890');

      document.body.appendChild(testAd);

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});

        setTimeout(() => {
          // More robust detection - check multiple indicators
          const hasContent = testAd.innerHTML !== '';
          const hasHeight = testAd.offsetHeight > 0;
          const hasWidth = testAd.offsetWidth > 0;
          const isVisible = testAd.style.display !== 'none';

          // Consider it blocked only if multiple indicators suggest blocking
          const detected = !hasContent && !hasHeight && !hasWidth && isVisible;

          document.body.removeChild(testAd);
          resolve(detected);
        }, 200); // Increased timeout for more reliable detection
      } catch {
        document.body.removeChild(testAd);
        resolve(true);
      }
    });
  }

  // Method 3: Google Ads detection (improved to avoid conflicts and false positives)
  private detectByGoogleAds(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if AdSense script already exists (loaded by main app)
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');

      if (existingScript) {
        // If script exists and loaded successfully, check if it's functional
        if (window.adsenseLoaded && window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
          resolve(false); // Script loaded and working
          return;
        }

        // If script exists but failed to load
        if (window.adsenseScriptError) {
          resolve(true); // Explicitly failed
          return;
        }

        // Script exists but status unclear - don't assume blocked
        resolve(false);
        return;
      }

      // Don't create additional test scripts if we already have one
      // This prevents conflicts and false positives
      resolve(false);
    });
  }

  // Method 4: Fetch blocking detection (improved)
  private detectByFetchBlocking(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!window.fetch) {
        resolve(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        resolve(true); // Assume blocked if timeout
      }, 1500); // Reduced timeout

      // Use a smaller, less intrusive test URL
      fetch('https://googleads.g.doubleclick.net/pagead/id', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-cache', // Prevent caching
      })
        .then(() => {
          clearTimeout(timeoutId);
          resolve(false);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          // Check if it's an abort error (timeout) or network error (likely blocked)
          if (error.name === 'AbortError') {
            resolve(true); // Timeout suggests blocking
          } else {
            resolve(true); // Network error suggests blocking
          }
        });
    });
  }

  // Method 5: Window properties detection
  private detectByWindowProperties(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check for common ad blocker properties
      const adBlockerIndicators = [
        'webkitRequestFileSystem' in window && !window.webkitRequestFileSystem,
        typeof (window as any).google_ad_modifications !== 'undefined',
        typeof (window as any).google_ad_status !== 'undefined',
      ];

      const detected = adBlockerIndicators.some((indicator) => indicator);
      resolve(detected);
    });
  }

  // Update storage with detection result
  private updateStatus(detected: boolean): void {
    const currentStatus = adBlockerStorage.loadStatus();
    const now = Date.now();

    const newStatus: AdBlockerStatus = {
      detected,
      messageShown: currentStatus?.messageShown ?? false,
      messageDismissed: currentStatus?.messageDismissed ?? false,
      lastChecked: now,
    };

    adBlockerStorage.saveStatus(newStatus);
  }

  // Get current status
  getStatus(): AdBlockerStatus {
    return (
      adBlockerStorage.loadStatus() ?? {
        detected: false,
        messageShown: false,
        messageDismissed: false,
        lastChecked: 0,
      }
    );
  }

  // Mark message as shown
  markMessageShown(): void {
    const status = this.getStatus();
    status.messageShown = true;
    adBlockerStorage.saveStatus(status);
  }

  // Mark message as dismissed
  markMessageDismissed(): void {
    const status = this.getStatus();
    status.messageDismissed = true;
    adBlockerStorage.saveStatus(status);
  }

  // Subscribe to detection results
  onDetection(callback: (detected: boolean) => void): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  // Check if we should show the ad blocker message
  shouldShowMessage(): boolean {
    const status = this.getStatus();
    return status.detected && !status.messageDismissed;
  }

  // Reset detection (for testing or manual refresh)
  reset(): void {
    this.detectionPromise = null;
    adBlockerStorage.clearStatus();
  }
}

// Convenience functions
export const adBlockerDetector = AdBlockerDetector.getInstance();

export const detectAdBlocker = () => adBlockerDetector.detect();
export const getAdBlockerStatus = () => adBlockerDetector.getStatus();
export const shouldShowAdBlockerMessage = () => adBlockerDetector.shouldShowMessage();
