/* eslint-disable import/prefer-default-export */
/* eslint-disable react/function-component-definition */
import Image from 'next/image';
import Link from 'next/link';
import urlForImage from '@/util/urlForImage';

export const RichTextComponents = {
  types: {
    image: ({ value }: any) => {
      return (
        <div className='relative m-10 mx-auto h-96 w-full'>
          <Image
            className='object-contain'
            src={urlForImage(value).url()}
            alt='Blog Post Image'
            fill
          />
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
      <h1 className='py-10 text-5xl font-bold'>{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className='py-10 text-4xl font-bold'>{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className='py-10 text-3xl font-bold'>{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className='py-10 text-2xl font-bold'>{children}</h4>
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
          className='underline decoration-untele hover:decoration-black'
        >
          {children}
        </Link>
      );
    },
  },
}
