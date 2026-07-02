'use client';

import { TwitterTweetEmbed } from 'react-twitter-embed';

interface SafeTweetProps {
  id: string;
}

export default function SafeTweet({ id }: SafeTweetProps) {
  return (
    <div className='mx-auto my-8 flex max-w-full justify-center'>
      <TwitterTweetEmbed tweetId={id} />
    </div>
  );
}
