/* eslint-disable no-console */
'use client';

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
    adsenseLoaded?: boolean;
    adsenseScriptError?: boolean;
  }
}

const PREFIX = '[AdSense]';

// Always-on debug: visible in Chrome DevTools Console (Verbose level) in production.
// In development also goes to console.log for visibility.
function dbg(msg: string, ...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log(PREFIX, msg, ...args);
  } else {
    console.debug(PREFIX, msg, ...args);
  }
}
function warn(msg: string, ...args: unknown[]) {
  console.warn(PREFIX, msg, ...args);
}
function err(msg: string, ...args: unknown[]) {
  console.error(PREFIX, msg, ...args);
}

export class AdSenseManager {
  private static instance: AdSenseManager;
  private readonly publisherId: string;
  private readonly isDev: boolean;

  constructor(publisherId: string) {
    this.publisherId = publisherId;
    this.isDev = process.env.NODE_ENV === 'development';
    if (!publisherId) {
      warn('NEXT_PUBLIC_GAS_ID is not set — no ads will load in production');
    } else {
      dbg(`Initialized with publisherId=${publisherId}`);
    }
  }

  static getInstance(publisherId = process.env.NEXT_PUBLIC_GAS_ID ?? ''): AdSenseManager {
    if (!AdSenseManager.instance) {
      AdSenseManager.instance = new AdSenseManager(publisherId);
    }
    return AdSenseManager.instance;
  }

  isDevelopmentMode(): boolean {
    return this.isDev;
  }
  getPublisherId(): string {
    return this.publisherId;
  }
  isInitialized(): boolean {
    return this.isScriptReady();
  }
  isInFallbackMode(): boolean {
    return this.isDev;
  }
  isLikelyBlocked(): boolean {
    return typeof window !== 'undefined' && !!window.adsenseScriptError;
  }
  getFailedAttempts(): number {
    return 0;
  }

  isScriptReady(): boolean {
    if (typeof window === 'undefined') return false;
    return !!window.adsenseLoaded && !window.adsenseScriptError;
  }

  // Legacy alias
  isReady(): boolean {
    return this.isScriptReady();
  }

  async pushAd(adElement: HTMLElement): Promise<boolean> {
    if (typeof window === 'undefined') {
      dbg('pushAd called on server — skipping');
      return false;
    }

    const slot = adElement.getAttribute('data-ad-slot') ?? '(no slot)';
    const client = adElement.getAttribute('data-ad-client') ?? '(no client)';
    const format = adElement.getAttribute('data-ad-format') ?? 'auto';
    const label = `slot=${slot}`;

    // Dev mode: show striped placeholder instead of real ads
    if (this.isDev) {
      this.renderDevPlaceholder(adElement, slot);
      return true;
    }

    // Validate publisher ID
    if (!this.publisherId) {
      err(`${label} — publisherId is empty (NEXT_PUBLIC_GAS_ID not set). Cannot push ad.`);
      return false;
    }
    if (!client || client === '(no client)') {
      err(`${label} — data-ad-client attribute is missing on the <ins> element`);
      return false;
    }

    // Script hard-failed (ad blocker, network error, CSP block)
    if (window.adsenseScriptError) {
      warn(`${label} — script failed to load (ad blocker / network / CSP). Skipping push.`);
      return false;
    }

    // Already pushed — Google tracks this via data-adsbygoogle-status
    const existingStatus = adElement.getAttribute('data-adsbygoogle-status');
    if (existingStatus) {
      dbg(
        `${label} — already has data-adsbygoogle-status="${existingStatus}", skipping duplicate push`
      );
      return true;
    }

    // Zero-width check — Google rejects ads from invisible elements
    const width = adElement.offsetWidth || adElement.getBoundingClientRect().width;
    if (width === 0) {
      warn(
        `${label} — <ins> has zero width at push time (offsetWidth=0). ` +
          `Google will reject this with "No slot size for availableWidth=0". ` +
          `Check parent container CSS (display:none, overflow:hidden, etc). format=${format}`
      );
      return false;
    }

    dbg(
      `${label} — pushing ad | client=${client} format=${format} width=${width}px ` +
        `scriptReady=${this.isScriptReady()} adsenseLoaded=${!!window.adsenseLoaded}`
    );

    try {
      // The correct AdSense pattern: push to the queue even before script loads.
      // The script processes queued pushes when it initializes.
      // NO polling loop needed — this is the Google-documented approach.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      dbg(`${label} — push() succeeded`);
      return true;
    } catch (e) {
      err(`${label} — push() threw an exception:`, e);
      return false;
    }
  }

  private renderDevPlaceholder(element: HTMLElement, slot: string): void {
    const already = element.getAttribute('data-ad-status');
    if (already === 'dev-placeholder') return;
    element.style.cssText = [
      'background:repeating-linear-gradient(135deg,#f3f4f6,#f3f4f6 8px,#e5e7eb 8px,#e5e7eb 16px)',
      'border:2px dashed #9ca3af',
      'display:flex!important',
      'align-items:center',
      'justify-content:center',
      'flex-direction:column',
      'gap:4px',
      'min-height:90px',
      'color:#6b7280',
      'font:600 11px/1.4 system-ui,sans-serif',
      'text-align:center',
      'padding:8px',
    ].join(';');
    element.innerHTML = `<span>📢 Ad Slot (dev)</span><span style="opacity:.6;font-size:10px">${slot}</span>`;
    element.setAttribute('data-ad-status', 'dev-placeholder');
  }

  // Legacy initialize() — previously polled for script readiness. Now a no-op since
  // the script loads via Next.js Script component and adsbygoogle.push() works before
  // script load anyway (queued and processed on script init).
  async initialize(): Promise<boolean> {
    dbg('initialize() called — script loading is handled by GoogleAdSense component');
    return true;
  }
}

export const adsenseManager = AdSenseManager.getInstance();
