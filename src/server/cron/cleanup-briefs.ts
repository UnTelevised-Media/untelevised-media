import 'server-only';

import writeClient from '@/lib/sanity/lib/write-client';

export interface CleanupBriefsResult {
  deleted: number;
  ids: string[];
}

export async function cleanupStaleBriefs(): Promise<CleanupBriefsResult> {
  const cutoff = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

  // Match briefs where publishedAt is before the cutoff, or where publishedAt is
  // absent (agent-created without the field) and _createdAt is before the cutoff.
  const ids: string[] = await writeClient.fetch(
    `*[_type == "brief" && (publishedAt < $cutoff || (!defined(publishedAt) && _createdAt < $cutoff))]._id`,
    { cutoff }
  );

  if (ids.length === 0) {
    return { deleted: 0, ids: [] };
  }

  const transaction = writeClient.transaction();
  for (const id of ids) {
    transaction.delete(id);
  }
  await transaction.commit();

  return { deleted: ids.length, ids };
}
