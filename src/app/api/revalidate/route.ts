import { revalidateTag, revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

const REVALIDATE_SECRET = process.env.SANITY_REVALIDATE_SECRET;

export async function POST(request: NextRequest) {
  // Verify secret to prevent unauthorized revalidation
  const secret = request.headers.get('x-sanity-revalidate-secret');
  if (!secret || secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { _type, slug } = body;

    // Revalidate paths and tags based on document type
    // This handles: featured articles, breaking news, field reports, trending, and raw feed
    if (_type === 'article') {
      // Revalidate homepage and all article-related sections
      revalidatePath('/', 'layout');

      // Also revalidate the individual article slug page so breaking list updates there too
      if (slug?.current) {
        revalidatePath(`/articles/${slug.current}`, 'page');
      }
    }

    if (_type === 'liveEvent') {
      revalidatePath('/', 'layout');
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: `Revalidated: ${_type}${slug?.current ? ` (${slug.current})` : ''}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to revalidate', details: String(error) },
      { status: 500 }
    );
  }
}
