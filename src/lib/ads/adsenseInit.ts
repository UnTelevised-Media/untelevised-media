// AdSense initialization utility
'use client';

declare global {
  interface Window {
    adsbygoogle: any[];
    adsenseInitialized?: boolean;
    adsenseScriptLoading?: boolean;
  }
}

export class AdSenseManager {
  private static instance: AdSenseManager;
  private initialized = false;
  private loading = false;
  private publisherId: string;
  private initializationPromise: Promise<boolean> | null = null;
  private scriptLoadPromise: Promise<void> | null = null;
  private developmentMode: boolean;
  private adBlockerDetected: boolean = false;
  private failedAttempts: number = 0;
  private maxFailedAttempts: number = 3;

  constructor(publisherId: string) {
    this.publisherId = publisherId;
    this.developmentMode = process.env.NODE_ENV === 'development';
  }

  static getInstance(publisherId: string = 'ca-pub-7412827340538951'): AdSenseManager {
    if (!AdSenseManager.instance) {
      AdSenseManager.instance = new AdSenseManager(publisherId);
    }
    return AdSenseManager.instance;
  }

  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined') {
      console.warn('AdSense: Window is undefined (SSR)');
      return false;
    }

    if (this.initialized) {
      console.log('AdSense: Already initialized');
      return true;
    }

    // In development mode, check if we've failed too many times
    if (this.developmentMode && this.failedAttempts >= this.maxFailedAttempts) {
      console.warn('AdSense: Too many failed attempts in development mode, using fallback');
      this.adBlockerDetected = true;
      return this.initializeFallbackMode();
    }

    // Return existing initialization promise if already in progress
    if (this.initializationPromise) {
      console.log('AdSense: Initialization already in progress, waiting...');
      return this.initializationPromise;
    }

    // Create and store the initialization promise
    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<boolean> {
    console.log('AdSense: Starting initialization...');
    this.loading = true;

    try {
      // Initialize adsbygoogle array
      window.adsbygoogle = window.adsbygoogle || [];
      console.log('AdSense: adsbygoogle array initialized');

      // Check if script is already loaded and functional
      const existingScript = document.querySelector(`script[src*="adsbygoogle.js"]`);

      if (!existingScript) {
        console.log('AdSense: Loading script...');
        await this.loadScript();
      } else {
        console.log('AdSense: Script already exists in DOM');
        // Verify the existing script is functional
        if (!this.isScriptFunctional()) {
          console.log('AdSense: Existing script not functional, reloading...');
          await this.loadScript();
        }
      }

      // Wait for script to be ready
      console.log('AdSense: Waiting for script to be ready...');
      await this.waitForScriptReady();

      this.initialized = true;
      window.adsenseInitialized = true;
      console.log('AdSense: Initialization complete!');
      return true;
    } catch (error) {
      console.error('AdSense initialization failed:', error);
      this.failedAttempts++;

      // In development mode, switch to fallback after failures
      if (this.developmentMode && this.failedAttempts >= this.maxFailedAttempts) {
        console.warn('AdSense: Switching to fallback mode in development');
        this.adBlockerDetected = true;
        return this.initializeFallbackMode();
      }

      // Reset promises to allow retry
      this.initializationPromise = null;
      this.scriptLoadPromise = null;
      return false;
    } finally {
      this.loading = false;
    }
  }

  private initializeFallbackMode(): boolean {
    if (this.developmentMode) {
      console.log('AdSense: Initializing fallback mode for development');
      // Create a mock adsbygoogle array for development
      window.adsbygoogle = window.adsbygoogle || [];
      this.initialized = true;
      window.adsenseInitialized = true;
      return true;
    }
    return false;
  }

  private loadScript(): Promise<void> {
    // Return existing promise if script is already loading
    if (this.scriptLoadPromise) {
      console.log('AdSense: Script already loading, waiting...');
      return this.scriptLoadPromise;
    }

    // Check if we're in development and likely have an ad blocker
    if (process.env.NODE_ENV === 'development') {
      console.log('AdSense: Development mode detected, checking for ad blocker...');
    }

    this.scriptLoadPromise = new Promise((resolve, reject) => {
      // Remove any existing broken scripts first
      const existingScripts = document.querySelectorAll('script[src*="adsbygoogle.js"]');
      existingScripts.forEach((script) => {
        if (script.parentNode) {
          console.log('AdSense: Removing existing script');
          script.parentNode.removeChild(script);
        }
      });

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.publisherId}`;
      script.crossOrigin = 'anonymous';

      let resolved = false;

      script.onload = () => {
        if (!resolved) {
          resolved = true;
          console.log('AdSense: Script loaded successfully');
          resolve();
        }
      };

      script.onerror = (error) => {
        if (!resolved) {
          resolved = true;
          console.error('AdSense: Script failed to load', error);
          // Reset the promise to allow retry
          this.scriptLoadPromise = null;
          reject(new Error('Failed to load AdSense script - likely blocked by ad blocker'));
        }
      };

      // Set a timeout for script loading
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.error('AdSense: Script loading timeout');
          // Reset the promise to allow retry
          this.scriptLoadPromise = null;
          reject(new Error('AdSense script loading timeout'));
        }
      }, 10000); // 10 second timeout

      script.addEventListener('load', () => clearTimeout(timeout));
      script.addEventListener('error', () => clearTimeout(timeout));

      document.head.appendChild(script);
    });

    return this.scriptLoadPromise;
  }

  private isScriptFunctional(): boolean {
    // Check if the script is functional by verifying adsbygoogle is available
    return !!(window.adsbygoogle && Array.isArray(window.adsbygoogle));
  }

  private waitForScriptReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait (reduced from 10)

      const checkReady = () => {
        // Check if adsbygoogle is available and functional
        if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
          console.log('AdSense: Script is ready and functional');
          resolve();
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          console.error('AdSense: Script not ready after timeout');
          reject(new Error('AdSense script not ready after timeout - possible ad blocker'));
          return;
        }

        setTimeout(checkReady, 100);
      };

      checkReady();
    });
  }

  // Add method to check if AdSense is likely blocked
  isLikelyBlocked(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    // Check if script exists but adsbygoogle is not available
    const scriptExists = !!document.querySelector('script[src*="adsbygoogle.js"]');
    const adsbyGoogleAvailable = !!(window.adsbygoogle && Array.isArray(window.adsbygoogle));

    return scriptExists && !adsbyGoogleAvailable;
  }

  // Add method to reset the manager (useful for testing)
  reset(): void {
    this.initialized = false;
    this.loading = false;
    this.initializationPromise = null;
    this.scriptLoadPromise = null;

    if (typeof window !== 'undefined') {
      window.adsenseInitialized = false;
    }

    console.log('AdSense: Manager reset');
  }

  async pushAd(adElement: HTMLElement): Promise<boolean> {
    try {
      console.log('AdSense: Attempting to push ad...');

      // Check if ad is already processed
      const existingStatus = adElement.getAttribute('data-ad-status');
      if (
        existingStatus === 'filled' ||
        existingStatus === 'unfilled' ||
        existingStatus === 'fallback'
      ) {
        console.log('AdSense: Ad already processed with status:', existingStatus);
        return existingStatus === 'filled' || existingStatus === 'fallback';
      }

      const isReady = await this.initialize();
      if (!isReady) {
        console.error('AdSense: Not initialized, cannot push ad');
        adElement.setAttribute('data-ad-status', 'error');
        return false;
      }

      // Handle fallback mode (development with ad blocker)
      if (this.adBlockerDetected && this.developmentMode) {
        console.log('AdSense: Using fallback mode for ad');
        this.createFallbackAd(adElement);
        adElement.setAttribute('data-ad-status', 'fallback');
        return true;
      }

      // Validate ad element
      if (!this.validateAdElement(adElement)) {
        console.error('AdSense: Invalid ad element', {
          tagName: adElement.tagName,
          className: adElement.className,
          attributes: Array.from(adElement.attributes).map(
            (attr) => `${attr.name}="${attr.value}"`
          ),
        });
        adElement.setAttribute('data-ad-status', 'invalid');
        return false;
      }

      console.log('AdSense: Pushing ad to adsbygoogle array...');

      // Mark as processing
      adElement.setAttribute('data-ad-status', 'processing');

      // Push to adsbygoogle with error handling
      try {
        window.adsbygoogle.push({});
        console.log('AdSense: Ad pushed successfully');

        // Set a timeout to check if ad was filled
        setTimeout(() => {
          const currentStatus = adElement.getAttribute('data-ad-status');
          if (currentStatus === 'processing') {
            // If still processing after 5 seconds, assume unfilled
            adElement.setAttribute('data-ad-status', 'unfilled');
          }
        }, 5000);

        return true;
      } catch (pushError) {
        console.error('AdSense: Error pushing to adsbygoogle array:', pushError);
        adElement.setAttribute('data-ad-status', 'error');
        return false;
      }
    } catch (error) {
      console.error('AdSense: Failed to push ad:', error);
      adElement.setAttribute('data-ad-status', 'error');
      return false;
    }
  }

  private createFallbackAd(element: HTMLElement): void {
    // Create a placeholder ad for development mode
    const fallbackContent = document.createElement('div');
    fallbackContent.className = 'fallback-ad';
    fallbackContent.style.cssText = `
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      color: #6b7280;
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    `;

    fallbackContent.innerHTML = `
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
        📢 Development Ad Placeholder
      </div>
      <div style="font-size: 12px; opacity: 0.7;">
        AdSense blocked - This would be an ad in production
      </div>
      <div style="font-size: 10px; margin-top: 8px; opacity: 0.5;">
        Slot: ${element.getAttribute('data-ad-slot') || 'unknown'}
      </div>
    `;

    // Clear existing content and add fallback
    element.innerHTML = '';
    element.appendChild(fallbackContent);
  }

  private validateAdElement(element: HTMLElement): boolean {
    if (!element || element.tagName !== 'INS') {
      return false;
    }

    const requiredAttrs = ['data-ad-client', 'data-ad-slot'];
    return requiredAttrs.every((attr) => element.hasAttribute(attr));
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  isLoading(): boolean {
    return this.loading;
  }

  isInFallbackMode(): boolean {
    return this.adBlockerDetected && this.developmentMode;
  }

  getFailedAttempts(): number {
    return this.failedAttempts;
  }
}

// Export singleton instance
export const adsenseManager = AdSenseManager.getInstance(
  process.env.NEXT_PUBLIC_GAS_ID ?? 'ca-pub-7412827340538951'
);
