'use client';

import { useState } from 'react';
import ClientSideRoute from '../providers/ClientSideRoute';
import formatTitleForURL from '@/util/url/formatTitleForURL';
import resolveHref from '@/util/url/resolveHref';
import type { CategoryQueryResult } from '@/server/queries/content';

interface CategoryBadgesProps {
  categories: CategoryQueryResult[];
}

// Convert hex to RGB for opacity
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function CategoryBadges({ categories }: CategoryBadgesProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className='flex flex-wrap gap-2 border-t border-border pt-4'>
      {categories.map((category) => {
        const categoryColor = category.color?.hex ?? '#dc2626';
        const isHovered = hoveredId === category._id;
        const fadedColor = hexToRgba(categoryColor, 0.4);

        return (
          <ClientSideRoute
            route={resolveHref('category', formatTitleForURL(category.title)) ?? ''}
            key={category._id}
          >
            <div
              className='rounded border text-xs font-medium transition-all px-2 py-1'
              style={{
                borderColor: isHovered ? categoryColor : categoryColor,
                color: isHovered ? categoryColor : categoryColor,
                backgroundColor: isHovered ? fadedColor : 'transparent',
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
