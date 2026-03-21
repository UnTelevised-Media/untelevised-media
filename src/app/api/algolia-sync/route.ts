import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@sanity/client';
import { toPlainText } from '@portabletext/toolkit';

import { adminClient, ARTICLES_INDEX, LIVE_EVENTS_INDEX } from '@/lib/algolia/client';
import type { AlgoliaArticleRecord } from '@/lib/algolia/types';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-06-04',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

const ARTICLE_QUERY = `
  *[_id == $id][0]{
    title, slug, description, body, publishedAt, tags,
    "mainImage": mainImage.asset->url,
    "author": author->name,
    "authorSlug": author->slug.current,
    "categories": categories[]->title,
    "categorySlugs": categories[]->slug.current,
  }
`;

const BODY_TEXT_MAX_CHARS = 5_000;

function verifySignature(body: string, signature: string, secret: string): boolean {
  const hmac = createHmac('sha256', secret);
  hmac.update(body);
  const digest = hmac.digest('hex');
  return digest === signature;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();

  // Validate HMAC signature if secret is configured
  const webhookSecret = process.env.SANITY_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = req.headers.get('sanity-webhook-signature') ?? '';
    // Sanity sends the signature as "t=<timestamp>,v1=<hash>"
    const hashMatch = signature.match(/v1=([a-f0-9]+)/);
    const hash = hashMatch ? hashMatch[1] : signature;
    if (!verifySignature(rawBody, hash, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let payload: { _type: string; _id: string; operation: string };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { _type, _id, operation } = payload;

  // Handle article sync
  if (_type === 'article') {
    if (operation === 'delete') {
      // We need the slug to delete — use _id as a fallback objectID pattern
      // Sanity webhook may include the slug in the payload
      const slugPayload = (payload as Record<string, unknown>).slug as
        | { current?: string }
        | string
        | undefined;
      const slug = typeof slugPayload === 'string' ? slugPayload : (slugPayload?.current ?? _id);
      await adminClient.deleteObject({ indexName: ARTICLES_INDEX, objectID: slug });
      return NextResponse.json({ ok: true, action: 'deleted', objectID: slug });
    }

    // create or update
    const doc = await sanityClient.fetch(ARTICLE_QUERY, { id: _id });
    if (!doc) {
      return NextResponse.json({ error: 'Document not found in Sanity' }, { status: 404 });
    }

    const bodyText = doc.body ? toPlainText(doc.body).slice(0, BODY_TEXT_MAX_CHARS) : '';
    const publishedAt = doc.publishedAt
      ? Math.floor(new Date(doc.publishedAt as string).getTime() / 1000)
      : 0;

    const record: AlgoliaArticleRecord = {
      objectID: (doc.slug as { current?: string })?.current ?? _id,
      title: (doc.title as string) ?? '',
      description: (doc.description as string) ?? '',
      bodyText,
      author: (doc.author as string) ?? '',
      authorSlug: (doc.authorSlug as string) ?? '',
      categories: (doc.categories as string[]) ?? [],
      categorySlugList: (doc.categorySlugs as string[]) ?? [],
      tags: (doc.tags as string[]) ?? [],
      publishedAt,
      imageUrl: (doc.mainImage as string) ?? '',
      type: 'article',
    };

    await adminClient.saveObject({ indexName: ARTICLES_INDEX, body: record });
    return NextResponse.json({ ok: true, action: operation, objectID: record.objectID });
  }

  // Handle live event sync
  if (_type === 'liveEvent') {
    if (operation === 'delete') {
      const slugPayload = (payload as Record<string, unknown>).slug as
        | { current?: string }
        | string
        | undefined;
      const slug = typeof slugPayload === 'string' ? slugPayload : (slugPayload?.current ?? _id);
      await adminClient.deleteObject({ indexName: LIVE_EVENTS_INDEX, objectID: slug });
      return NextResponse.json({ ok: true, action: 'deleted', objectID: slug });
    }

    const doc = await sanityClient.fetch(
      `*[_id == $id][0]{ title, slug, description, eventDate }`,
      { id: _id }
    );
    if (!doc) {
      return NextResponse.json({ error: 'Document not found in Sanity' }, { status: 404 });
    }

    const record = {
      objectID: (doc.slug as { current?: string })?.current ?? _id,
      title: (doc.title as string) ?? '',
      description: (doc.description as string) ?? '',
      eventDate: doc.eventDate
        ? Math.floor(new Date(doc.eventDate as string).getTime() / 1000)
        : 0,
      type: 'live_event' as const,
    };

    await adminClient.saveObject({ indexName: LIVE_EVENTS_INDEX, body: record });
    return NextResponse.json({ ok: true, action: operation, objectID: record.objectID });
  }

  return NextResponse.json({ ok: true, action: 'skipped', reason: 'unhandled _type' });
}
