'use client';
import dynamic from 'next/dynamic';

const FacebookEmbedInner = dynamic(() => import('./FacebookEmbedInner'), { ssr: false });

export default function FacebookEmbed({ postUrl }: { postUrl: string }) {
  return <FacebookEmbedInner postUrl={postUrl} />;
}
