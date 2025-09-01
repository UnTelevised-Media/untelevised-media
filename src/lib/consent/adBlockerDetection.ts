// src/lib/consent/adBlockerDetection.ts
'use client';

import { AdBlockerStatus } from './types';
import { adBlockerStorage } from './storage';

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

    const detectionMethods = [
      this.detectByBaitElement(),
      this.detectByAdSenseScript(),
      this.detectByGoogleAds(),
      this.detectByFetchBlocking(),
      this.detectByWindowProperties(),
    ];

    try {
      const results = await Promise.allSettled(detectionMethods);
      const detectedCount = results.filter(
        (result) => result.status === 'fulfilled' && result.value === true
      ).length;

      // Consider ad blocker detected if 2 or more methods detect it
      return detectedCount >= 2;
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

  // Method 2: AdSense script detection
  private detectByAdSenseScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!window.adsbygoogle) {
        resolve(true);
        return;
      }

      // Check if AdSense is blocked
      const testAd = document.createElement('ins');
      testAd.className = 'adsbygoogle';
      testAd.style.cssText =
        'display:block;width:1px;height:1px;position:absolute;left:-1000px;top:-1000px;';
      testAd.setAttribute('data-ad-client', 'ca-pub-test');
      testAd.setAttribute('data-ad-slot', '1234567890');

      document.body.appendChild(testAd);

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});

        setTimeout(() => {
          const detected = testAd.innerHTML === '';
          document.body.removeChild(testAd);
          resolve(detected);
        }, 100);
      } catch (error) {
        document.body.removeChild(testAd);
        resolve(true);
      }
    });
  }

  // Method 3: Google Ads detection
  private detectByGoogleAds(): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;

      let resolved = false;

      script.onload = () => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      };

      script.onerror = () => {
        if (!resolved) {
          resolved = true;
          resolve(true);
        }
      };

      document.head.appendChild(script);

      // Timeout fallback
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(true);
        }
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }, 3000);
    });
  }

  // Method 4: Fetch blocking detection
  private detectByFetchBlocking(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!window.fetch) {
        resolve(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      fetch('https://googleads.g.doubleclick.net/pagead/id', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
      })
        .then(() => {
          clearTimeout(timeoutId);
          resolve(false);
        })
        .catch(() => {
          clearTimeout(timeoutId);
          resolve(true);
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
      messageShown: currentStatus?.messageShown || false,
      messageDismissed: currentStatus?.messageDismissed || false,
      lastChecked: now,
    };

    adBlockerStorage.saveStatus(newStatus);
  }

  // Get current status
  getStatus(): AdBlockerStatus {
    return (
      adBlockerStorage.loadStatus() || {
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
