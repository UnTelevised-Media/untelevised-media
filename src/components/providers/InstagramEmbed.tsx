'use client';

// Dynamic import with ssr:false must live in a Client Component.
// This file is the public export; the actual blockquote markup is in InstagramEmbedInner.
import dynamic from 'next/dynamic';

const InstagramEmbedInner = dynamic(() => import('./InstagramEmbedInner'), { ssr: false });

export default function InstagramEmbed({ postId }: { postId: string }) {
  return <InstagramEmbedInner postId={postId} />;
}
