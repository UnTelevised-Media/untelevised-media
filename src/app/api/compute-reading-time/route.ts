// src/app/api/compute-reading-time/route.ts
// Sanity webhook handler that computes and persists readingTimeMinutes on the
// article document whenever it is created or updated. This eliminates the
// pt::text(body) call from GROQ queries — reading time becomes a plain field
// read instead of full Portable Text extraction on every ISR rebuild.
//
// Sanity webhook setup (sanity.io/manage → API → Webhooks):
//   URL:        https://www.untelevised.media/api/compute-reading-time
//   Dataset:    production
//   Trigger on: Create, Update
//   Filter:     _type == "article"
//   Projection: { _id, _type }
//   Secret:     SANITY_REVALIDATE_SECRET (same as the revalidate webhook)
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { writeClient } from '@/lib/sanity/lib/write-client';
import { revalidateSecret } from '@/lib/sanity/env';

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{ _id?: string; _type?: string }>(
      req,
      revalidateSecret
    );

    if (!isValidSignature) {
      return new Response(JSON.stringify({ message: 'Invalid signature' }), { status: 401 });
    }

    if (body?._type !== 'article' || !body?._id) {
      return NextResponse.json({ skipped: true });
    }

    // Fetch the body text via pt::text() — done once here so the GROQ
    // queries on ISR pages never need to do this work again.
    const doc = await writeClient.fetch<{ text: string } | null>(
      `*[_id == $id][0]{ "text": pt::text(body) }`,
      { id: body._id }
    );

    if (!doc?.text) {
      return NextResponse.json({ skipped: true, reason: 'no body text' });
    }

    const minutes = Math.max(1, Math.round(doc.text.length / 1000) + 1);

    await writeClient
      .patch(body._id)
      .set({ readingTimeMinutes: minutes })
      .commit({ visibility: 'async' });

    return NextResponse.json({ success: true, readingTimeMinutes: minutes });
  } catch (err) {
    console.error('[/api/compute-reading-time] Failed:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(message, { status: 500 });
  }
}
