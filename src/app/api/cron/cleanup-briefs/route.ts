import { timingSafeEqual } from 'crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/lib/write-client';

function verifyBearerToken(authHeader: string | null, secret: string | undefined): boolean {
  if (!secret || !authHeader) return false;
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

  const cutoff = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

  // Match briefs where publishedAt is before the cutoff, or where publishedAt is
  // absent (agent-created without the field) and _createdAt is before the cutoff.
  const ids: string[] = await writeClient.fetch(
    `*[_type == "brief" && (publishedAt < $cutoff || (!defined(publishedAt) && _createdAt < $cutoff))]._id`,
    { cutoff }
  );

  if (ids.length === 0) {
    return NextResponse.json({ deleted: 0, message: 'No stale briefs found.' });
  }

  const transaction = writeClient.transaction();
  for (const id of ids) {
    transaction.delete(id);
  }
  await transaction.commit();

  return NextResponse.json({ deleted: ids.length, ids });
}
