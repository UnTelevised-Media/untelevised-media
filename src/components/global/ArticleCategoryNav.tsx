 // src/components/global/ArticleCategoryNav.tsx
'use client';

import React, { useState, useEffect } from 'react';
import formatTitleForURL from '@/util/formatTitleForURL';

interface ArticleCategoryNavProps {
  categories: Category[];
  selectedCategory: Category | null;
  onCategoryChange: (category: Category) => void;
}

const ArticleCategoryNav: React.FC<ArticleCategoryNavProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  const [rows, setRows] = useState<Category[][]>([]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let buttonsPerRow: number;

      // Determine buttons per row based on screen width
      if (width < 640)
        buttonsPerRow = 2; // sm
      else if (width < 768)
        buttonsPerRow = 3; // md
      else if (width < 1024)
        buttonsPerRow = 4; // lg
      else if (width < 1280)
        buttonsPerRow = 5; // xl
      else buttonsPerRow = 6; // 2xl

      // Calculate how many rows we need
      const totalButtons = categories.length;
      const numberOfRows = Math.ceil(totalButtons / buttonsPerRow);

      // Distribute buttons evenly across rows
      const newRows: Category[][] = [];
      let remainingButtons = [...categories];

      for (let i = 0; i < numberOfRows; i++) {
        const buttonsThisRow = Math.ceil(remainingButtons.length / (numberOfRows - i));
        newRows.push(remainingButtons.slice(0, buttonsThisRow));
        remainingButtons = remainingButtons.slice(buttonsThisRow);
      }

      setRows(newRows);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categories]);

  const CategoryButton: React.FC<{ category: Category }> = ({ category }) => {
    const isSelected = selectedCategory?.slug?.current === category.slug?.current;
    
    return (
      <button
        onClick={() => onCategoryChange(category)}
        className='group relative inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-slate-600/50 p-[2px] text-xs font-semibold leading-6 text-slate-200 no-underline shadow-lg border border-slate-500 transition-all duration-300 hover:border-untele/50'
      >
        <span className='absolute inset-0 overflow-hidden rounded-lg'>
          <span
            className={`absolute inset-0 rounded-lg bg-gradient-to-r from-untele/20 via-untele/40 to-untele/20 transition-opacity duration-500 ${
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          />
        </span>

        <span
          className={`relative z-10 flex w-full items-center justify-center rounded-lg bg-slate-700 px-6 py-2 transition duration-500 hover:bg-slate-600 ${
            isSelected ? 'bg-untele/80 text-white border border-untele' : ''
          }`}
        >
          {category.title}
        </span>
        <span className='absolute -bottom-[1px] left-[1.125rem] h-[2px] w-[calc(100%-2.25rem)] bg-gradient-to-r from-untele/0 via-untele/90 to-untele/0 transition-opacity duration-500 group-hover:opacity-60' />
      </button>
    );
  };

  return (
    <nav className='space-y-3 py-4 px-4 bg-slate-600/30 rounded-lg border border-slate-500'>
      <h3 className='text-lg font-bold text-slate-200 mb-4 border-b border-untele/30 pb-2'>
        Filter by Category
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
            <CategoryButton key={category.slug?.current || category._id} category={category} />
          ))}
        </div>
      ))}
    </nav>
  );
};

export default ArticleCategoryNav;