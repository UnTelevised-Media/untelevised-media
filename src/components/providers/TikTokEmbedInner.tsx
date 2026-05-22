'use client';
import Link from 'next/link';

export default function TikTokEmbedInner({ videoUrl }: { videoUrl: string }) {
  // TikTok embed requires the numeric video ID extracted from the URL
  const videoId = videoUrl.match(/\/video\/(\d+)/)?.[1] ?? '';
  return (
    <div className='mx-auto my-8 flex max-w-full justify-center'>
      <blockquote
        className='tiktok-embed'
        cite={videoUrl}
        data-video-id={videoId}
        style={{ maxWidth: '605px', minWidth: '325px' }}
      >
        <section>
          <Link
            href={videoUrl}
            className='text-untele hover:text-red-700'
            target='_blank'
            rel='noopener noreferrer'
          >
            View this video on TikTok
          </Link>
        </section>
      </blockquote>
      <script async src='https://www.tiktok.com/embed.js'></script>
    </div>
  );
}
