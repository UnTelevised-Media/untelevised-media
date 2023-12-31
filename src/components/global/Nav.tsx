import React from 'react';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import ClientSideRoute from '../ClientSideRoute';

const queryCategory = groq`
  *[_type=='category'] {
    ...,
    title,
    order,
  } 
`;

async function Nav() {

  const categories = await client.fetch(queryCategory);

  const formatCategoryTitle = (title) => {
    // Convert to lowercase
    let formattedTitle = title.toLowerCase();

    // Remove symbols and spaces, and replace them with a dash
    formattedTitle = formattedTitle.replace(/[^a-z0-9]+/g, '-');

    return formattedTitle;
  };

  const sortedCategories = categories.sort((a, b) => a.order - b.order);

  return (
    <nav className='flex gap-x-3 gap-y-2 px-6 py-4 text-sm md:text-base lg:text-lg md:font-semibold text-slate-800 flex-wrap'>
      {sortedCategories.map((category, index) => (
        <ClientSideRoute
          route={`/category/${formatCategoryTitle(category.title)}`}
          key={index}
        >
          <div className='rounded-md border border-untele/40 bg-slate-700/30 px-3 py-2'>
            {category.title}
          </div>
        </ClientSideRoute>
      ))}
    </nav>
  );
}

export default Nav;
