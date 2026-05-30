// src/components/global/Nav.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame } from 'lucide-react';

interface Category {
  _id: string;
  title: string;
  order: number;
}

interface NavProps {
  categories: Category[];
}

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const Nav: React.FC<NavProps> = ({ categories }) => {
  const pathname = usePathname();
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // already horizontal
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <nav
      aria-label='Article categories'
      className='sticky top-[56px] z-30 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-black md:top-[74px]'
    >
      <div className='relative mx-auto max-w-[1400px]'>
        {/* Fade edges to hint at scroll */}
        <div className='pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-white dark:from-black' />
        <div className='pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-white dark:from-black' />

        <div ref={scrollRef} className='flex items-center overflow-x-auto scrollbar-hide'>
          {/* Breaking anchor — always visible */}
          <Link
            href='/breaking'
            className='flex shrink-0 items-center gap-1.5 border-r border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-widest text-untele transition-colors hover:bg-untele hover:text-white dark:border-slate-800'
          >
            <Flame className='h-3 w-3 shrink-0 animate-pulse' aria-hidden='true' />
            Breaking
          </Link>

          {/* Category links */}
          {sorted.map((category) => {
            const slug = toSlug(category.title);
            const active = pathname === `/category/${slug}`;
            return (
              <Link
                key={category._id}
                href={`/category/${slug}`}
                aria-current={active ? 'page' : undefined}
                className={`relative shrink-0 whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                  active
                    ? 'text-untele after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-untele after:content-[""]'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {category.title}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
