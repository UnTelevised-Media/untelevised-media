import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Capture 10% of sessions for replay, 100% of sessions that have an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

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
