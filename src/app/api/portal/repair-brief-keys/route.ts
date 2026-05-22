// src/app/api/portal/repair-brief-keys/route.ts
// One-shot endpoint: patches brief documents and claimedPitch documents that have
// array items with _key: null (caused by the beat-patrol agent omitting _key fields).
// Protected by CRON_SECRET. Safe to run multiple times — only patches null keys.
import { type NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/lib/write-client';

function makeKey() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let briefsFixed = 0;
  let pitchesFixed = 0;

  // ── Fix brief.stories and brief.stories[].links ─────────────────────────────
  const briefs = await writeClient.fetch<
    Array<{
      _id: string;
      stories?: Array<{
        _key: string | null;
        links?: Array<{ _key: string | null }>;
      }>;
    }>
  >(`*[_type == "brief"]{ _id, stories[]{ _key, links[]{ _key } } }`);

  for (const brief of briefs ?? []) {
    const stories = brief.stories ?? [];
    const needsRepair = stories.some((s) => !s._key || s.links?.some((l) => !l._key));
    if (!needsRepair) continue;

    // We must fetch the full stories array to patch it (can't patch individual
    // null-keyed items by path — that's exactly the bug we're fixing).
    const full = await writeClient.fetch<{
      stories?: Array<
        Record<string, unknown> & {
          _key: string | null;
          links?: Array<Record<string, unknown> & { _key: string | null }>;
        }
      >;
    }>(`*[_type == "brief" && _id == $id][0]{ stories[] }`, { id: brief._id });

    const fixed = (full?.stories ?? []).map((s) => ({
      ...s,
      _key: s._key || makeKey(),
      links: (s.links ?? []).map((l) => ({ ...l, _key: l._key || makeKey() })),
    }));

    await writeClient.patch(brief._id).set({ stories: fixed }).commit();
    briefsFixed++;
  }

  // ── Fix claimedPitch.links ──────────────────────────────────────────────────
  const pitches = await writeClient.fetch<
    Array<{ _id: string; links?: Array<{ _key: string | null }> }>
  >(`*[_type == "claimedPitch"]{ _id, links[]{ _key } }`);

  for (const pitch of pitches ?? []) {
    const links = pitch.links ?? [];
    if (!links.some((l) => !l._key)) continue;

    const full = await writeClient.fetch<{
      links?: Array<Record<string, unknown> & { _key: string | null }>;
    }>(`*[_type == "claimedPitch" && _id == $id][0]{ links[] }`, { id: pitch._id });

    const fixed = (full?.links ?? []).map((l) => ({ ...l, _key: l._key || makeKey() }));
    await writeClient.patch(pitch._id).set({ links: fixed }).commit();
    pitchesFixed++;
  }

  return NextResponse.json({
    ok: true,
    briefsFixed,
    pitchesFixed,
    message: `Repaired ${briefsFixed} brief(s) and ${pitchesFixed} claimedPitch(es).`,
  });
}
