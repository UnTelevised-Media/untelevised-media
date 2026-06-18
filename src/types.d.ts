/**
 * Global type augmentations for third-party libraries and custom window properties
 */

declare global {
  interface Window {
    // Google Analytics
    gtag?: (_command: string, ..._args: any[]) => void;

    // TimelineJS
    TL?: {
      Timeline: new (_id: string, _data: any, _options?: any) => any;
    };

    // Google AdSense
    adsenseLoaded?: boolean;
    adsenseScriptError?: boolean;
  }
}

// Google AdSense global variable
declare let _adsbygoogle: Record<string, unknown>[];

export {};
