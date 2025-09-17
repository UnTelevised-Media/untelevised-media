// Modern AdSense manager with simplified logic
'use client';

declare global {
  interface Window {
    adsbygoogle: any[];
    adsenseLoaded?: boolean;
    adsenseScriptError?: boolean;
  }
}

export class AdSenseManager {
  private static instance: AdSenseManager;
  private publisherId: string;
  private isDevelopment: boolean;
  private failedAttempts: number = 0;
  private isBlocked: boolean = false;

  constructor(publisherId: string) {
    this.publisherId = publisherId;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  static getInstance(publisherId: string = 'ca-pub-7412827340538951'): AdSenseManager {
    if (!AdSenseManager.instance) {
      AdSenseManager.instance = new AdSenseManager(publisherId);
    }
    return AdSenseManager.instance;
  }

  /**
   * Check if AdSense is ready to display ads
   */
  isReady(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    // Check if script failed to load
    if (window.adsenseScriptError) {
      return false;
    }

    // Check if script is loaded and adsbygoogle array is available
    const scriptLoaded = window.adsenseLoaded;
    const arrayAvailable = window.adsbygoogle && Array.isArray(window.adsbygoogle);

    // Also check if the script element exists in DOM as a fallback
    const scriptExists = document.querySelector('script[src*="adsbygoogle.js"]');

    // Consider ready if either the flag is set OR we have the array and script exists
    const isReady = (scriptLoaded && arrayAvailable) || (arrayAvailable && scriptExists);

    return !!isReady;
  }

  /**
   * Check if we're in development mode
   */
  isDevelopmentMode(): boolean {
    return this.isDevelopment;
  }

  /**
   * Push an ad to the AdSense queue
   */
  async pushAd(adElement: HTMLElement): Promise<boolean> {
    if (typeof window === 'undefined') {
      console.warn('AdSense: Cannot push ad on server side');
      return false;
    }

    // In development mode, always show placeholder
    if (this.isDevelopment) {
      this.createDevelopmentPlaceholder(adElement);
      return true;
    }

    // Check if script failed to load
    if (window.adsenseScriptError) {
      console.warn('AdSense: Script failed to load, cannot push ad');
      this.isBlocked = true;
      return false;
    }

    // Wait for script to be ready with timeout
    const maxWaitTime = 10000; // 10 seconds
    const checkInterval = 100; // 100ms
    let waitTime = 0;

    while (!this.isReady() && waitTime < maxWaitTime) {
      // Try to initialize adsbygoogle array if it's missing
      if (
        typeof window !== 'undefined' &&
        (!window.adsbygoogle || !Array.isArray(window.adsbygoogle))
      ) {
        window.adsbygoogle = [];
        console.log('AdSense: Force initialized adsbygoogle array during wait');
      }

      await new Promise((resolve) => setTimeout(resolve, checkInterval));
      waitTime += checkInterval;
    }

    // Check if AdSense is ready after waiting
    if (!this.isReady()) {
      console.warn('AdSense: Script not ready after waiting, cannot push ad');
      this.failedAttempts++;
      this.isBlocked = true;
      return false;
    }

    try {
      // Mark ad as processing
      adElement.setAttribute('data-ad-status', 'processing');

      // Push to AdSense
      window.adsbygoogle.push({});
      console.log('AdSense: Ad pushed successfully');

      // Set timeout to check if ad was filled
      setTimeout(() => {
        const status = adElement.getAttribute('data-ad-status');
        if (status === 'processing') {
          adElement.setAttribute('data-ad-status', 'unfilled');
          console.log('AdSense: Ad unfilled after timeout');

          // Log additional debugging info for unfilled ads
          const slot = adElement.getAttribute('data-ad-slot');
          const format = adElement.getAttribute('data-ad-format');
          console.log(
            `AdSense Debug: Unfilled ad details - Slot: ${slot}, Format: ${format}, Environment: ${process.env.NODE_ENV}`
          );
          console.log(
            'AdSense Debug: This is normal for development, new accounts, or low-traffic sites'
          );

          // Check if this is a development environment
          if (this.isDevelopment) {
            console.log(
              "AdSense Debug: You are in development mode - ads typically don't show on localhost"
            );
          }
        }
      }, 5000);

      return true;
    } catch (error) {
      console.error('AdSense: Error pushing ad:', error);
      adElement.setAttribute('data-ad-status', 'error');

      // Track failed attempts
      this.failedAttempts++;
      this.isBlocked = true;

      return false;
    }
  }

  /**
   * Create a development placeholder for ads
   */
  private createDevelopmentPlaceholder(element: HTMLElement): void {
    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
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

    const slot = element.getAttribute('data-ad-slot') || 'unknown';
    placeholder.innerHTML = `
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
        📢 Development Ad Placeholder
      </div>
      <div style="font-size: 12px; opacity: 0.7;">
        AdSense would appear here in production
      </div>
      <div style="font-size: 10px; margin-top: 8px; opacity: 0.5;">
        Slot: ${slot}
      </div>
    `;

    // Clear existing content and add placeholder
    element.innerHTML = '';
    element.appendChild(placeholder);
    element.setAttribute('data-ad-status', 'development-placeholder');
  }

  /**
   * Get the publisher ID
   */
  getPublisherId(): string {
    return this.publisherId;
  }

  /**
   * Check if AdSense is initialized (legacy compatibility)
   * In the new implementation, this is equivalent to isReady()
   */
  isInitialized(): boolean {
    return this.isReady();
  }

  /**
   * Check if we're in fallback mode (development mode)
   * Legacy compatibility method
   */
  isInFallbackMode(): boolean {
    return this.isDevelopment;
  }

  /**
   * Check if AdSense is likely blocked
   * Legacy compatibility method
   */
  isLikelyBlocked(): boolean {
    return this.isBlocked;
  }

  /**
   * Get the number of failed attempts
   * Legacy compatibility method
   */
  getFailedAttempts(): number {
    return this.failedAttempts;
  }

  /**
   * Initialize AdSense (legacy compatibility)
   * In the new implementation, initialization is handled by the script component
   */
  async initialize(): Promise<boolean> {
    console.log('AdSense: initialize() called - using new script-based initialization');

    // Check if already ready
    if (this.isReady()) {
      console.log('AdSense: Already initialized');
      return true;
    }

    // In development mode, always return true
    if (this.isDevelopment) {
      console.log('AdSense: Development mode - simulating successful initialization');
      return true;
    }

    // Wait a bit for the script to load
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      if (this.isReady()) {
        console.log('AdSense: Script loaded successfully');
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      attempts++;
    }

    this.failedAttempts++;
    this.isBlocked = true;
    console.warn('AdSense: Initialization timeout - likely blocked');
    return false;
  }
}

// Export singleton instance
export const adsenseManager = AdSenseManager.getInstance(
  process.env.NEXT_PUBLIC_GAS_ID ?? 'ca-pub-7412827340538951'
);
