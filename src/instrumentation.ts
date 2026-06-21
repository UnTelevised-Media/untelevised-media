import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./lib/sentry/sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./lib/sentry/sentry.edge.config');
  }
}

// Automatically captures all unhandled server-side request errors
export const onRequestError = Sentry.captureRequestError;
