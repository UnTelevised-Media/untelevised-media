'use client';

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
  // Public static images — return as-is, let Next.js Image component handle optimization
  if (src.startsWith('/')) {
    return src;
  }
  // Third-party images (Pexels, Supabase storage) — return original URL
  // Their own CDNs handle caching and optimization
  return src;
}
