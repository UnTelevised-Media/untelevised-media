import { writeClient } from '@/lib/sanity/lib/write-client';

export interface ViewEvent {
  slug: string;
  ip: string;
  timestamp: number;
}

interface SlugCount {
  slug: string;
  count: number;
}

const queue: ViewEvent[] = [];
const MAX_BATCH_SIZE = 100;
const BATCH_INTERVAL_MS = 30 * 1000; // 30 seconds

let flushTimer: NodeJS.Timeout | null = null;

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushBatch().finally(() => {
      flushTimer = null;
    });
  }, BATCH_INTERVAL_MS);
}

export async function flushBatch(): Promise<void> {
  if (queue.length === 0) return;

  const batch = queue.splice(0, queue.length);

  // Group by slug and count occurrences
  const counts = new Map<string, number>();
  for (const event of batch) {
    counts.set(event.slug, (counts.get(event.slug) ?? 0) + 1);
  }

  try {
    // Fetch all articles by their slugs
    const articles = await writeClient.fetch<{ _id: string; slug: { current: string } }[]>(
      `*[_type == "article" && slug.current in $slugs] { _id, slug }`,
      { slugs: Array.from(counts.keys()) }
    );

    if (articles.length === 0) {
      console.warn('[viewCount batch] No articles found for slugs:', Array.from(counts.keys()));
      return;
    }

    // Build mutation patches
    const patches = articles.map((article) => {
      const count = counts.get(article.slug.current) ?? 0;
      return {
        patch: {
          id: article._id,
          inc: { viewCount: count },
        },
      };
    });

    // Single batch mutation
    if (patches.length > 0) {
      await writeClient.mutate(patches, { visibility: 'async' });
    }
  } catch (err) {
    console.error('[viewCount batch] Failed to flush view counts:', err);
  }
}

export function queueViewEvent(slug: string, ip: string): void {
  queue.push({
    slug,
    ip,
    timestamp: Date.now(),
  });

  // Flush if batch is full
  if (queue.length >= MAX_BATCH_SIZE) {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    flushBatch().finally(() => {
      scheduleFlush();
    });
  } else {
    // Schedule flush if not already scheduled
    scheduleFlush();
  }
}

// Ensure pending batch is flushed on shutdown
if (typeof global !== 'undefined') {
  process.on('SIGTERM', async () => {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    await flushBatch();
  });
}
