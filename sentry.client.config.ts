import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Capture 10% of sessions for replay, 100% of sessions that have an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Errors from third-party scripts we can't control or fix
  ignoreErrors: [
    // Facebook iOS in-app browser injects JS that calls window.webkit.messageHandlers
    // without a guard — not our code, nothing actionable
    "undefined is not an object (evaluating 'window.webkit.messageHandlers')",
    // Algolia unreachable when user's network blocks its CDN (ad blockers, corporate firewalls)
    /Unreachable hosts/,
    // Transient network failures inside Sanity Studio (not user-facing)
    /^TypeError: network error$/,
  ],

  // Suppress errors whose stack traces originate inside third-party ad scripts
  denyUrls: [
    /pagead2\.googlesyndication\.com/i,
    /googlesyndication\.com/i,
    /googleads\.g\.doubleclick\.net/i,
  ],

  integrations: [
    Sentry.replayIntegration({
      // Mask form inputs but keep media visible for debugging layout issues
      maskAllText: false,
      maskAllInputs: true,
      blockAllMedia: false,
    }),
  ],

  enableLogs: true,
});
