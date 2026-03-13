// src/lib/consent/index.ts

// Types
export * from './types';

// Storage utilities
export * from './storage';

// Context and hooks
export { ConsentProvider, useConsent, useConsentCheck, useConditionalScript } from './context';

// Ad blocker detection
export {
  AdBlockerDetector,
  adBlockerDetector,
  detectAdBlocker,
  getAdBlockerStatus,
  shouldShowAdBlockerMessage,
} from './adBlockerDetection';
