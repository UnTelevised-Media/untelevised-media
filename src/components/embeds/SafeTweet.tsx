// src/components/embeds/SafeTweet.tsx
// Async RSC wrapper for twitter embeds.
//
// Layer 1 (server): calls getTweet() to check existence at build/render time.
//   → deleted/private tweets are caught here and show a server-side fallback
//     immediately, without a client-side round-trip.
//
// Layer 2 (client): SafeTweetWrapper renders react-tweet's <Tweet> with
//   ssr:false so it never runs during static generation. An error boundary
//   inside SafeTweetWrapper catches any client-side rendering errors
//   (e.g. react-tweet's "TypeError: c is not iterable" on malformed tweet
//   entity data) without crashing the article page.
import { getTweet } from 'react-tweet/api';
import SafeTweetWrapper from './SafeTweetWrapper';

interface SafeTweetProps {
  id: string;
}

export default async function SafeTweet({ id }: SafeTweetProps) {
  // Server-side existence check — fast-fails for deleted/private tweets.
  let tweetExists = false;
  try {
    const data = await getTweet(id);
    tweetExists = !!data;
  } catch {
    tweetExists = false;
  }

  if (!tweetExists) {
    return (
      <div className='mx-auto my-8 max-w-[550px] rounded-lg border border-slate-300 bg-slate-50 px-6 py-5 text-center dark:border-slate-700 dark:bg-slate-900'>
        <p className='mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300'>
          Tweet no longer available
        </p>
        <a
          href={`https://x.com/i/web/status/${id}`}
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs text-untele underline hover:text-red-600'
        >
          View on X →
        </a>
      </div>
    );
  }

  // Tweet confirmed available — delegate rendering to the client-side wrapper.
  return (
    <div className='mx-auto my-8 flex max-w-full justify-center'>
      <SafeTweetWrapper id={id} />
    </div>
  );
}
