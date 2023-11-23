/* eslint-disable react/function-component-definition */

import Image from 'next/image';
import urlForImage from '@/u/urlForImage';
import { ArrowUpRightIcon, ShareIcon } from '@heroicons/react/24/solid';
import ClientSideRoute from '../ClientSideRoute';

type Props = {
  posts: Post[];
};

function ArticleCardLg({ posts }: Props) {
      return (
    <div>
      <hr className='mb-8 border-untele' />
      <div className='grid grid-cols-1 gap-x-10 gap-y-12 px-10 pb-24 md:grid-cols-2 xl:grid-cols-3'>
        {/* Post */}
        {posts.map((post) => (
          <ClientSideRoute route={`/post/${post.slug?.current}`} key={post._id}>
            <div className='group flex cursor-pointer flex-col rounded-lg border border-slate-400 pb-4 shadow-lg drop-shadow-sm'>
              <div className='relative h-80 w-full drop-shadow-xl transition-transform duration-200 ease-out group-hover:scale-105'>
                <Image
                  className='rounded-md object-cover object-left lg:object-center'
                  src={urlForImage(post.mainImage).url()}
                  fill
                  alt={post.author.name}
                />
                <div className='absolute bottom-0 flex w-full justify-between rounded bg-slate-900 bg-opacity-20 px-5 py-2 text-slate-200 drop-shadow-lg backdrop-blur-lg'>
                  <div>
                    <p className='text-sm font-bold lg:text-base'>
                      {post.title}
                    </p>
                  </div>
                  <div className='flex flex-col items-center gap-y-2 md:flex-row md:gap-x-2'>
                    {post.categories &&
                      post.categories.map((category) => (
                        <div
                          key={category._id}
                          className='hidden rounded-xl border border-slate-900 bg-untele/70 px-5 py-2 text-center text-xs font-light text-slate-900 md:flex lg:text-sm'
                        >
                          <p>{category.title}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className='mt-0 flex-1 bg-slate-400'>
                <div className='flex space-x-4 p-1'>
                  <h4 className='text-sm font-semibold md:text-base'>
                    By: {post.author.name}
                  </h4>
                  <h4 className='text-sm font-light md:text-base'>
                    {new Date(post._createdAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h4>
                </div>
                <p className='line-clamp-3  px-4 pb-1 pt-2'>
                  {post.description}
                </p>
              </div>
              <div className='flex justify-between drop-shadow-sm'>
                <p className='ml-4 mt-3 flex items-center font-bold group-hover:underline'>
                  Read Article
                  <ArrowUpRightIcon className='group ml-2 h-4 w-4' />
                </p>
                
                <ShareIcon className='mr-4 mt-4 h-6 w-6 transition-transform duration-200 ease-out hover:scale-110 hover:text-untele' />
              </div>
            </div>
          </ClientSideRoute>
        ))}
      </div>
    </div>
  );
}

export default ArticleCardLg;
