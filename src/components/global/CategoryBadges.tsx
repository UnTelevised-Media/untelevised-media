'use client';

import { useState } from 'react';
import Link from 'next/link';
import ClientSideRoute from '../providers/ClientSideRoute';
import formatTitleForURL from '@/util/url/formatTitleForURL';
import resolveHref from '@/util/url/resolveHref';
import type { CategoryQueryResult } from '@/server/queries/content';

interface CategoryBadgesProps {
  categories: CategoryQueryResult[];
}

export default function CategoryBadges({ categories }: CategoryBadgesProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className='flex flex-wrap gap-2 border-t border-border pt-4'>
      {categories.map((category) => {
        const categoryColor = category.color?.hex || '#dc2626';
        const isHovered = hoveredId === category._id;

        return (
          <ClientSideRoute
            route={resolveHref('category', formatTitleForURL(category.title)) ?? ''}
            key={category._id}
          >
            <div
              className='rounded border text-xs font-medium transition-all px-2 py-1'
              style={{
                borderColor: categoryColor,
                color: isHovered ? 'white' : categoryColor,
                backgroundColor: isHovered ? categoryColor : 'transparent',
              }}
              onMouseEnter={() => setHoveredId(category._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {category.title}
            </div>
          </ClientSideRoute>
        );
      })}
    </div>
  );
}
