// src/components/global/ArticleCategories.tsx
/* eslint-disable react/function-component-definition */

import { sanityFetch } from '@/lib/sanity/lib/fetch';
import { queryCategories } from '@/lib/sanity/lib/queries';
import Link from 'next/link';
import formatTitleForURL from '@/util/formatTitleForURL';

interface ArticleCategoriesProps {
  activeSlug?: string;
}

export default async function ArticleCategories({ activeSlug }: ArticleCategoriesProps) {
  const categories = await getArticleCategories();

  const distributeCategories = (cats: Category[]) => {
    const totalButtons = cats.length;
    const firstRowCount = Math.ceil(totalButtons / 2);

    // For two rows
    return [cats.slice(0, firstRowCount), cats.slice(firstRowCount)];
  };

  const rows = distributeCategories(categories);

  const ButtonComponent = ({ category }: { category: Category }) => {
    const isSelected = activeSlug && formatTitleForURL(category.title) === activeSlug;

    return (
      <Link href={`/category/${formatTitleForURL(category.title)}`} key={category._id}>
        <button className='group relative inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-slate-500 bg-slate-600/50 p-[2px] text-xs font-semibold leading-6 text-slate-200 no-underline shadow-lg transition-all duration-300 hover:border-untele/50'>
          <span className='absolute inset-0 overflow-hidden rounded-lg'>
            <span
              className={`absolute inset-0 rounded-lg bg-gradient-to-r from-untele/20 via-untele/40 to-untele/20 transition-opacity duration-500 ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            />
          </span>

          <span
            className={`relative z-10 flex w-full items-center justify-center rounded-lg bg-slate-700 px-6 py-2 transition duration-500 hover:bg-slate-600 ${
              isSelected ? 'border border-untele bg-untele/80 text-white' : ''
            }`}
          >
            {category.title}
          </span>
          <span className='absolute -bottom-[1px] left-[1.125rem] h-[2px] w-[calc(100%-2.25rem)] bg-gradient-to-r from-untele/0 via-untele/90 to-untele/0 transition-opacity duration-500 group-hover:opacity-60' />
        </button>
      </Link>
    );
  };

  return (
    <nav className='space-y-3 px-4 py-4'>
      <h3 className='mb-4 border-b border-untele/30 pb-2 text-lg font-bold text-slate-200'>
        Browse by Category
      </h3>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className='grid gap-3'
          style={{
            gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
          }}
        >
          {row.map((category) => (
            <ButtonComponent key={category._id} category={category} />
          ))}
        </div>
      ))}
    </nav>
  );
}

async function getArticleCategories() {
  try {
    const { data: categories } = await sanityFetch({
      query: queryCategories,
      tags: ['category'],
    });
    return (categories as Category[]).sort((a: Category, b: Category) => {
      const orderA = parseInt(a.order ?? '0', 10);
      const orderB = parseInt(b.order ?? '0', 10);
      return orderA - orderB;
    });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}
