// src/app/(user)/articles/[slug]/opengraph-image.tsx
// Per-article branded OG image using Next.js ImageResponse (edge runtime)
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'UnTelevised Media Article';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-06-04';

// Build a Sanity CDN image URL from an asset _ref string
// Ref format: image-{hash}-{width}x{height}-{format}
function sanityImageUrl(ref: string, width = 1200): string {
  const [, id, dimensionStr, format] = ref.split('-');
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dimensionStr}.${format}?w=${width}&auto=format`;
}

async function fetchArticle(slug: string) {
  const query = encodeURIComponent(
    `*[_type == 'article' && slug.current == $slug && status == 'published'][0]{
      title,
      description,
      publishedAt,
      "authorName": author->name,
      "categoryTitle": categories[0]->title,
      "imageRef": mainImage.asset._ref
    }`,
  );
  const params = encodeURIComponent(JSON.stringify({ slug }));
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${query}&$slug=${encodeURIComponent(JSON.stringify(slug))}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result ?? null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  const title = article?.title ?? 'UnTelevised Media';
  const authorName = article?.authorName ?? 'UnTelevised Staff';
  const categoryTitle = article?.categoryTitle ?? null;
  const imageRef = article?.imageRef as string | undefined;
  const bgImageUrl = imageRef ? sanityImageUrl(imageRef, 1200) : null;

  const publishedDate = article?.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          fontFamily: 'Inter, system-ui, sans-serif',
          background: '#0f172a',
          overflow: 'hidden',
        }}
      >
        {/* Background article image */}
        {bgImageUrl && (
          <img
            src={bgImageUrl}
            alt=''
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        )}

        {/* Dark gradient overlay — heavier at bottom for text legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: bgImageUrl
              ? 'linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.72) 40%, rgba(15,23,42,0.96) 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          }}
        />

        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #ef4444, #dc2626)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '48px 56px',
          }}
        >
          {/* Category badge */}
          {categoryTitle && (
            <div
              style={{
                display: 'flex',
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  background: '#ef4444',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  padding: '6px 14px',
                  borderRadius: 4,
                }}
              >
                {categoryTitle}
              </span>
            </div>
          )}

          {/* Article title */}
          <div
            style={{
              color: 'white',
              fontSize: title.length > 60 ? 42 : title.length > 40 ? 48 : 56,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: -0.5,
              marginBottom: 24,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>

          {/* Byline row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Author + date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                {authorName.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>
                  {authorName}
                </span>
                {publishedDate && (
                  <span style={{ color: '#94a3b8', fontSize: 15 }}>{publishedDate}</span>
                )}
              </div>
            </div>

            {/* Branding */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 900,
                  color: 'white',
                  border: '2px solid rgba(239,68,68,0.5)',
                }}
              >
                U
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>
                  UnTelevised
                </span>
                <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 500 }}>
                  Independent Media
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
