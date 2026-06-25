'use client';

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_PRODUCTION_URL || 'http://localhost:3000';

export default function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.startsWith('https://cdn.sanity.io')) {
    const url = new URL(src);
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', String(quality ?? 65));
    url.searchParams.set('auto', 'format');
    return url.toString();
  }
  if (src.startsWith('/')) {
    return `${NEXT_PUBLIC_URL}/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
  }
  // Third-party images (Pexels, Supabase storage) — return original URL
  // Their own CDNs handle caching and optimization
  return src;
}
