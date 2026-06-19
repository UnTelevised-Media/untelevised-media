// src/lib/consent/index.ts

// Types
export * from '@/models/types/consent';

// Storage utilities
export * from './storage';

// Context and hooks
export {
  ConsentProvider,
  useConsent,
  useConsentCheck,
  useConditionalScript,
} from '@/hooks/useConsent';

// Ad blocker detection
export {
  AdBlockerDetector,
  adBlockerDetector,
  detectAdBlocker,
  getAdBlockerStatus,
  shouldShowAdBlockerMessage,
} from './adBlockerDetection';
