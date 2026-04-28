'use client';
import dynamic from 'next/dynamic';

const TikTokEmbedInner = dynamic(() => import('./TikTokEmbedInner'), { ssr: false });

export default function TikTokEmbed({ videoUrl }: { videoUrl: string }) {
  return <TikTokEmbedInner videoUrl={videoUrl} />;
}
