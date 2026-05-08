import { type NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/lib/write-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();

  const ids: string[] = await writeClient.fetch(
    `*[_type == "brief" && publishedAt < $cutoff]._id`,
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

  console.log(`[cron] cleanup-briefs: deleted ${ids.length} brief(s) older than ${cutoff}`);

  return NextResponse.json({ deleted: ids.length, ids });
}
