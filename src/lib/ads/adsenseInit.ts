// AdSense initialization utility
'use client';

declare global {
  interface Window {
    adsbygoogle: any[];
    adsenseInitialized?: boolean;
  }
}

export class AdSenseManager {
  private static instance: AdSenseManager;
  private initialized = false;
  private loading = false;
  private publisherId: string;

  constructor(publisherId: string) {
    this.publisherId = publisherId;
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

    if (this.loading) {
      console.log('AdSense: Already loading, waiting...');
      // Wait for existing initialization to complete
      return this.waitForInitialization();
    }

    console.log('AdSense: Starting initialization...');
    this.loading = true;

    try {
      // Initialize adsbygoogle array
      window.adsbygoogle = window.adsbygoogle || [];
      console.log('AdSense: adsbygoogle array initialized');

      // Check if script is already loaded
      const existingScript = document.querySelector(
        `script[src*="adsbygoogle.js"][src*="${this.publisherId}"]`
      );

      if (!existingScript) {
        console.log('AdSense: Loading script...');
        await this.loadScript();
      } else {
        console.log('AdSense: Script already exists in DOM');
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
      return false;
    } finally {
      this.loading = false;
    }
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.publisherId}`;
      script.crossOrigin = 'anonymous';

      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load AdSense script'));

      document.head.appendChild(script);
    });
  }

  private waitForScriptReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 100; // 10 seconds max wait

      const checkReady = () => {
        if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
          resolve();
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error('AdSense script not ready after timeout'));
          return;
        }

        setTimeout(checkReady, 100);
      };

      checkReady();
    });
  }

  private waitForInitialization(): Promise<boolean> {
    return new Promise((resolve) => {
      const checkInitialized = () => {
        if (this.initialized) {
          resolve(true);
          return;
        }

        if (!this.loading) {
          resolve(false);
          return;
        }

        setTimeout(checkInitialized, 100);
      };

      checkInitialized();
    });
  }

  async pushAd(adElement: HTMLElement): Promise<boolean> {
    try {
      console.log('AdSense: Attempting to push ad...', adElement);

      // Check if ad is already processed
      const existingStatus = adElement.getAttribute('data-ad-status');
      if (existingStatus === 'filled' || existingStatus === 'unfilled') {
        console.log('AdSense: Ad already processed with status:', existingStatus);
        return existingStatus === 'filled';
      }

      const isReady = await this.initialize();
      if (!isReady) {
        throw new Error('AdSense not initialized');
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
        throw new Error('Invalid ad element');
      }

      console.log('AdSense: Pushing ad to adsbygoogle array...');
      // Push to adsbygoogle
      window.adsbygoogle.push({});
      console.log('AdSense: Ad pushed successfully');
      return true;
    } catch (error) {
      console.error('Failed to push ad:', error);
      return false;
    }
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
}

// Export singleton instance
export const adsenseManager = AdSenseManager.getInstance(
  process.env.NEXT_PUBLIC_GAS_ID ?? 'ca-pub-7412827340538951'
);
