/* eslint-disable import/prefer-default-export */
import { timingSafeEqual } from 'crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { cleanupStaleBriefs } from '@/server/cron/cleanup-briefs';

function verifyBearerToken(authHeader: string | null, secret: string | undefined): boolean {
  if (!secret || !authHeader) {
    return false;
  }
  const expected = `Bearer ${secret}`;
  // timingSafeEqual requires equal-length buffers; compare as fixed-width to avoid
  // leaking the expected token length via the length-mismatch fast path.
  const a = Buffer.from(authHeader.padEnd(expected.length));
  const b = Buffer.from(expected.padEnd(authHeader.length));
  return (
    authHeader.length === expected.length &&
    timingSafeEqual(a.subarray(0, expected.length), b.subarray(0, expected.length))
  );
}

export async function GET(req: NextRequest) {
  if (!verifyBearerToken(req.headers.get('authorization'), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await cleanupStaleBriefs();
  if (result.deleted === 0) {
    return NextResponse.json({ deleted: 0, message: 'No stale briefs found.' });
  }

  return NextResponse.json(result);
}
