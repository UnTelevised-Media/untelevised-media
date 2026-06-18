/**
 * Global type augmentations for third-party libraries and custom window properties
 */

declare global {
  interface Window {
    // Google Analytics
    gtag?: (command: string, ...args: any[]) => void;

    // TimelineJS
    TL?: {
      Timeline: new (id: string, data: any, options?: any) => any;
    };

    // Google AdSense
    adsenseLoaded?: boolean;
    adsenseScriptError?: boolean;
  }
}

// Google AdSense global variable
declare let adsbygoogle: Record<string, unknown>[];

export {};
