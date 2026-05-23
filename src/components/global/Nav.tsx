// src/components/global/Nav.tsx
'use client';
import React from 'react';

import { ChevronRight, Flame } from 'lucide-react';
import ClientSideRoute from '../providers/ClientSideRoute';

interface Category {
  _id: string;
  title: string;
  order: number;
}

interface NavProps {
  categories: Category[];
}

const Nav: React.FC<NavProps> = ({ categories }) => {
  const formatCategoryTitle = (title: string) => {
    // Convert to lowercase
    let formattedTitle = title.toLowerCase();
    // Remove symbols and spaces, and replace them with a dash
    formattedTitle = formattedTitle.replace(/[^a-z0-9]+/g, '-');
    return formattedTitle;
  };

  const sortedCategories = categories.sort((a, b) => a.order - b.order);

  // Split categories into primary (first 4) and secondary (rest)
  const primaryCategories = sortedCategories.slice(0, 6);
  const secondaryCategories = sortedCategories.slice(6);

  return (
    <nav aria-label='Article categories' className='from-slate-100/98 to-slate-200/98 dark:from-slate-900/98 dark:to-slate-800/98 sticky top-[56px] z-30 border-b border-slate-300/50 bg-gradient-to-r shadow-xl backdrop-blur-md dark:border-slate-700/50 md:top-[74px]'>
      <div className='mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8'>
        {/* Desktop Navigation */}
        <div className='hidden items-center justify-between py-3 md:flex'>
          {/* Left Section - Breaking Events */}
          <div className='flex items-center space-x-2'>
            <div className='flex items-center space-x-1 rounded-lg border border-red-400/50 bg-red-50/30 px-3 py-1.5 backdrop-blur-sm dark:border-red-600/50 dark:bg-red-900/20'>
              <Flame className='h-3 w-3 animate-pulse text-untele' aria-hidden='true' />
              <span className='text-xs font-bold uppercase tracking-wider text-untele'>
                Breaking
              </span>
            </div>
          </div>

          {/* Center Section - Primary Categories */}
          <ul role='list' className='flex flex-1 items-center justify-center space-x-1 overflow-x-auto px-4 scrollbar-hide'>
            {primaryCategories.map((category, index: number) => (
              <React.Fragment key={category._id}>
                <li>
                  <ClientSideRoute route={`/category/${formatCategoryTitle(category.title)}`}>
                    <div className='group relative flex cursor-pointer items-center space-x-2 whitespace-nowrap rounded-lg border border-transparent px-3 py-2 font-medium text-slate-700 transition-all duration-300 hover:border-slate-400/50 hover:bg-slate-300/30 hover:text-slate-900 hover:shadow-lg dark:text-slate-300 dark:hover:border-slate-600/50 dark:hover:bg-slate-700/30 dark:hover:text-white'>
                      {/* Animated background gradient */}
                      <div className='absolute inset-0 rounded-lg bg-gradient-to-r from-untele/0 via-untele/5 to-untele/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100' aria-hidden='true' />

                      <span className='relative z-10 font-medium md:text-xs lg:text-sm'>
                        {category.title}
                      </span>

                      {/* Active indicator line */}
                      <div className='absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-untele to-red-400 transition-all duration-300 group-hover:left-0 group-hover:w-full' aria-hidden='true' />

                      {/* Hover glow effect */}
                      <div className='absolute -inset-1 rounded-lg bg-gradient-to-r from-untele/20 to-red-400/20 opacity-0 blur transition-opacity duration-300 group-hover:opacity-50' aria-hidden='true' />
                    </div>
                  </ClientSideRoute>
                </li>

                {index < primaryCategories.length - 1 && (
                  <li aria-hidden='true'>
                    <ChevronRight className='h-4 w-4 text-slate-400 dark:text-slate-600' />
                  </li>
                )}
              </React.Fragment>
            ))}
          </ul>

          {/* Right Section - More Categories Dropdown */}
          {secondaryCategories.length > 0 && (
            <div className='group relative'>
              <button className='flex items-center space-x-2 rounded-lg border border-slate-400/50 bg-slate-200/30 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur-sm transition-all duration-200 hover:border-untele/50 hover:bg-slate-300/50 hover:text-slate-900 dark:border-slate-600/50 dark:bg-slate-800/30 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white'>
                <span>More</span>
                <ChevronRight className='h-4 w-4 transition-transform duration-200 group-hover:rotate-90' aria-hidden='true' />
              </button>

              {/* Dropdown Menu */}
              <div className='pointer-events-none absolute right-0 top-full z-[9999] mt-2 w-64 rounded-lg border border-slate-400/50 bg-slate-200/95 p-2 opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 dark:border-slate-600/50 dark:bg-slate-800/95'>
                <div className='grid grid-cols-2 gap-2'>
                  {secondaryCategories.map((category) => (
                    <ClientSideRoute
                      key={category._id}
                      route={`/category/${formatCategoryTitle(category.title)}`}
                    >
                      <div className='group/item cursor-pointer rounded-md px-3 py-2 text-sm text-slate-700 transition-colors duration-200 hover:bg-slate-300/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white'>
                        <div className='flex items-center space-x-2'>
                          <div className='h-1.5 w-1.5 rounded-full bg-untele/60 transition-colors duration-200 group-hover/item:bg-untele' />
                          <span>{category.title}</span>
                        </div>
                      </div>
                    </ClientSideRoute>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className='md:hidden'>
          {/* Mobile Breaking Events */}
          <div className='mb-3 flex items-center justify-center'>
            <div className='flex items-center space-x-1 rounded-lg border border-red-400/50 bg-red-50/30 px-3 py-1.5 backdrop-blur-sm dark:border-red-600/50 dark:bg-red-900/20'>
              <Flame className='h-3 w-3 animate-pulse text-untele' aria-hidden='true' />
              <span className='text-xs font-bold uppercase tracking-wider text-untele'>
                Breaking
              </span>
            </div>
          </div>

          {/* Mobile Categories - Improved Layout */}
          <div className='py-3'>
            <div className='mb-2 flex items-center space-x-2'>
              <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-untele' />
              <span className='text-xs font-medium text-slate-600 dark:text-slate-400'>
                Categories
              </span>
            </div>
            <ul role='list' className='flex flex-wrap gap-1.5'>
              {sortedCategories.map((category) => (
                <li key={category._id}>
                  <ClientSideRoute route={`/category/${formatCategoryTitle(category.title)}`}>
                    <div className='flex cursor-pointer items-center space-x-1 whitespace-nowrap rounded-full border border-slate-400/50 bg-slate-200/30 px-2.5 py-1 text-xs font-medium text-slate-600 backdrop-blur-sm transition-all duration-200 hover:border-untele/50 hover:bg-untele/10 hover:text-slate-900 dark:border-slate-600/50 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:text-white'>
                      <div className='h-1 w-1 rounded-full bg-untele/60' aria-hidden='true' />
                      <span>{category.title}</span>
                    </div>
                  </ClientSideRoute>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Activity Indicator */}
        {/* <div className='border-t border-slate-300/20 py-2 dark:border-slate-700/20'>
          <div className='flex items-center justify-center space-x-6 text-xs text-slate-600 dark:text-slate-500'>
            <div className='flex items-center space-x-2'>
              <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-green-400' />
              <span>Live Updates</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400' />
              <span>Breaking News</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400' />
              <span>Investigations</span>
            </div>
          </div>
        </div> */}
      </div>
    </nav>
  );
};

export default Nav;
