// src/app/api/bookstore/reviews/route.ts
// Book review submission (POST) and retrieval (GET) endpoint.
// POST: creates a pending bookReview (approved: false) for admin moderation.
// GET:  returns approved reviews for a given bookSlug query param.
// Rate-limit: 3 POSTs per hour per IP.

import { NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/lib/write-client';
import { client } from '@/lib/sanity/lib/client';
import { queryApprovedReviewsByBookSlug } from '@/lib/sanity/lib/queries';
import { makeRatelimiter } from '@/lib/bookstore/ratelimit';

const reviewLimiter = makeRatelimiter(3, 3600);

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

interface ReviewPayload {
  bookSlug: string;
  reviewerName: string;
  reviewerLocation?: string;
  rating: number;
  body: string;
}

export async function GET(req: NextRequest) {
  const bookSlug = req.nextUrl.searchParams.get('bookSlug');
  if (!bookSlug) {
    return NextResponse.json({ error: 'bookSlug query param required' }, { status: 400 });
  }

  const reviews = await client.fetch(
    queryApprovedReviewsByBookSlug,
    { slug: bookSlug },
    { cache: 'no-store' }
  );

  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  if (reviewLimiter) {
    const result = await reviewLimiter.limit(`review:${getIp(req)}`);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Too many reviews submitted — please try again later' },
        { status: 429 }
      );
    }
  }

  let body: ReviewPayload;
  try {
    body = (await req.json()) as ReviewPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { bookSlug, reviewerName, reviewerLocation, rating, body: reviewBody } = body;

  if (!bookSlug || !reviewerName || !reviewBody) {
    return NextResponse.json(
      { error: 'bookSlug, reviewerName, and body are required' },
      { status: 400 }
    );
  }
  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json(
      { error: 'rating must be an integer between 1 and 5' },
      { status: 400 }
    );
  }
  if (reviewBody.trim().length < 20) {
    return NextResponse.json({ error: 'Review must be at least 20 characters' }, { status: 400 });
  }

  // Resolve book _id from slug
  const book = await client.fetch<{ _id: string } | null>(
    `*[_type == "book" && slug.current == $slug][0]{ _id }`,
    { slug: bookSlug },
    { cache: 'no-store' }
  );

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  await writeClient.create({
    _type: 'bookReview',
    book: { _type: 'reference', _ref: book._id },
    reviewerName: reviewerName.trim(),
    ...(reviewerLocation ? { reviewerLocation: reviewerLocation.trim() } : {}),
    rating,
    body: reviewBody.trim(),
    approved: false,
    submittedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
