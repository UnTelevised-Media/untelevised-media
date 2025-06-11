import React from 'react';
import { groq } from 'next-sanity';

import { ChevronRightIcon } from '@heroicons/react/20/solid';

import ClientSideRoute from '../providers/ClientSideRoute';
import client from '@/lib/sanity/lib/client';


const queryCategory = groq`
  *[_type=='category'] {
    ...,
    title,
    order,
  } 
`;

async function Nav() {
  const categories = await client.fetch(queryCategory);

  const formatCategoryTitle = (title: string) => {
    // Convert to lowercase
    let formattedTitle = title.toLowerCase();
    // Remove symbols and spaces, and replace them with a dash
    formattedTitle = formattedTitle.replace(/[^a-z0-9]+/g, '-');
    return formattedTitle;
  };

  const sortedCategories = categories.sort(
    (a: any, b: any) => a.order - b.order,
  );

  return (
    <nav className='sticky top-[73px] z-40 border-b border-slate-700 bg-slate-800/95 shadow-lg backdrop-blur-md'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between py-4'>
          {/* Categories Navigation */}
          <div className='flex items-center space-x-1 overflow-x-auto scrollbar-hide'>
            <span className='mr-4 hidden whitespace-nowrap text-sm font-medium text-slate-400 sm:block'>
              Categories:
            </span>

            {sortedCategories.map((category: any, index: number) => (
              <React.Fragment key={category._id}>
                <ClientSideRoute
                  route={`/category/${formatCategoryTitle(category.title)}`}
                >
                  <div className='group flex cursor-pointer items-center space-x-2 whitespace-nowrap rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-slate-600 hover:bg-slate-700/50 hover:text-white'>
                    <span className='relative'>
                      {category.title}
                      <div className='absolute bottom-0 left-0 h-0.5 w-0 bg-untele transition-all duration-200 group-hover:w-full' />
                    </span>
                  </div>
                </ClientSideRoute>

                {index < sortedCategories.length - 1 && (
                  <ChevronRightIcon className='hidden h-4 w-4 text-slate-600 sm:block' />
                )}
              </React.Fragment>
            ))}
          </div>

        </div>

        {/* Mobile Category Scroll Indicator */}
        <div className='mb-2 sm:hidden'>
          <div className='flex justify-center'>
            <div className='flex space-x-1'>
              {[...Array(3)].map((_, i) => (
                <div key={i} className='h-1 w-4 rounded-full bg-slate-600' />
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
