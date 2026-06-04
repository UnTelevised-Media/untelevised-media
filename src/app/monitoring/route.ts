// src/app/monitoring/route.ts
// Edge Function Sentry tunnel — proxies Sentry envelope requests to sentry.io.
// Runs on Vercel Edge (500K free invocations/month vs ~100K serverless),
// near-zero cold-start, and bypasses ad-blockers for error/performance events.
// Replaces the withSentryConfig tunnelRoute option (which generated a serverless function).
export const runtime = 'edge';

const VALID_SENTRY_HOSTS = ['sentry.io', 'ingest.sentry.io', 'ingest.us.sentry.io'];

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const firstLine = body.split('\n')[0];
    if (!firstLine) return new Response('Empty envelope', { status: 400 });

    const header = JSON.parse(firstLine) as { dsn?: string };
    if (!header.dsn) return new Response('Missing DSN in envelope header', { status: 400 });

    const dsn = new URL(header.dsn);
    const isValidHost = VALID_SENTRY_HOSTS.some(
      (h) => dsn.hostname === h || dsn.hostname.endsWith(`.${h}`)
    );
    if (!isValidHost) return new Response('Invalid DSN host', { status: 400 });

    const projectId = dsn.pathname.replace(/^\//, '');
    const upstream = `https://${dsn.hostname}/api/${projectId}/envelope/`;

    const res = await fetch(upstream, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-sentry-envelope' },
      body,
    });

    return new Response(res.body, { status: res.status });
  } catch {
    return new Response('Tunnel error', { status: 500 });
  }
}
