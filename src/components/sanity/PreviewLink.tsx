// src/components/sanity/PreviewLink.tsx
'use client';

// Function to generate preview URLs for different content types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generatePreviewUrl(context: any): Promise<string> {
  const doc = context.document ?? context;
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';

  let url: string;
  switch (doc._type) {
    case 'article':
      url = `${baseUrl}/articles/${doc.slug?.current}`;
      break;
    case 'author':
      url = `${baseUrl}/author/${doc.slug?.current}`;
      break;
    case 'liveEvent':
      url = `${baseUrl}/live-event/${doc.slug?.current}`;
      break;
    case 'category':
      url = `${baseUrl}/category/${doc.slug?.current}`;
      break;
    case 'policies':
      url = `${baseUrl}/policies/${doc.slug?.current}`;
      break;
    default:
      url = baseUrl;
  }

  return Promise.resolve(url);
}

// Simple preview URL configuration
export const previewUrl = {
  previewMode: {
    enable: '/api/draft',
    disable: '/api/disable-draft',
  },
};
