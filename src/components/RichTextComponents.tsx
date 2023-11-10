/* eslint-disable react/self-closing-comp */
/* eslint-disable import/prefer-default-export */
/* eslint-disable react/function-component-definition */
import Image from 'next/image';
import Link from 'next/link';
import urlForImage from '@/util/urlForImage';
import { Tweet } from 'react-tweet';

export const RichTextComponents = {
  types: {
    image: ({ value }: any) => {
      const alt = value.alt;
      return (
        <div className='my-3 space-y-2'>
          <div className='relative h-144 w-full rounded-lg '>
            <Image
              className='mx-auto object-contain'
              src={urlForImage(value).url()}
              alt='Blog Post Image'
              fill
            />
          </div>
          <div className='flex justify-center'>
            <p className='rounded-lg border border-untele bg-slate-900/20 px-4 py-1 font-semibold'>
              {alt}
            </p>
          </div>
        </div>
      );
    },
    youtubeEmbed: ({ value }: any) => {
      const videoId = value.videoId;
      return (
        <div className='mx-auto my-10 max-w-full flex justify-center items-center'>
          {/* Render YouTube embed using the video ID */}
          <iframe
            width='720'
            height='480'
            src={`https://www.youtube.com/embed/${videoId}`}
            title='YouTube Video Embed'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          ></iframe>
        </div>
      );
    },
    twitterEmbed: ({ value }: any) => {
      const tweetId = value.tweetId;
      return (
        <div className='mx-auto my-10 flex max-w-full justify-center'>
          {/* Render Twitter embed using the ID and username */}
          <Tweet id={tweetId} />
        </div>
      );
    },
    instagramEmbed: ({ value }: any) => {
      const postId = value.postId;
      return (
        <div className='mx-auto my-10 flex max-w-full justify-center'>
          {/* Render Twitter embed using the ID and username */}
          <blockquote
            className='instagram-media max-w-xl min-w-fit'
            data-instgrm-captioned
            data-instgrm-permalink={`https://www.instagram.com/p/${postId}`}
            data-instgrm-version='14'
          >
            <div>
              <Link
                href={`https://www.instagram.com/p/${postId}`}
                className='hover:sky-600 text-untele '
                target='_blank'
              >
                View this post on Instagram
              </Link>
            </div>
          </blockquote>
          <script async src='//www.instagram.com/embed.js'></script>
        </div>
      );
    },
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className='ml-10 list-disc space-y-5 py-5'>{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className='mt-lg list-decimal'>{children}</ol>
    ),
  },
  block: {
    h1: ({ children }: any) => (
      <h1 className='py-6 text-4xl font-bold md:text-5xl'>{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className='py-6 text-3xl font-bold md:text-4xl'>{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className='py-6 text-2xl font-bold md:text-3xl'>{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className='py-6 text-xl font-bold md:text-2xl'>{children}</h4>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className='boreder-l-untele my-5 border-l-4 py-5 pl-5'>
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith('/')
        ? 'noreferrer noopener'
        : undefined;
      return (
        <Link
          href={value.href}
          rel={rel}
          className='underline decoration-untele hover:decoration-sky-600'
        >
          {children}
        </Link>
      );
    },
  },
};
