// src/components/global/Nav.tsx
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  _id: string;
  title: string;
  order: number;
  slug?: { current: string };
}

interface NavProps {
  categories: Category[];
}

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const SCROLL_SPEED = 6;

const Nav: React.FC<NavProps> = ({ categories }) => {
  const pathname = usePathname();
  const sorted = [...categories].sort((a, b) => Number(a.order ?? 999) - Number(b.order ?? 999));
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const directionRef = useRef<0 | -1 | 1>(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      ro.disconnect();
    };
  }, [updateArrows]);

  // Vertical wheel → horizontal scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const tick = useCallback(() => {
    const el = scrollRef.current;
    if (!el || directionRef.current === 0) return;
    el.scrollLeft += directionRef.current * SCROLL_SPEED;
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startScroll = useCallback((dir: -1 | 1) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    directionRef.current = dir;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopScroll = useCallback(() => {
    directionRef.current = 0;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  return (
    <nav
      aria-label='Article categories'
      className='sticky top-[56px] z-30 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-black md:top-[74px]'
    >
      <div className='relative mx-auto max-w-[1400px]'>

        {/* Left scroll button */}
        <button
          aria-label='Scroll categories left'
          onMouseDown={() => startScroll(-1)}
          onMouseUp={stopScroll}
          onMouseLeave={stopScroll}
          onTouchStart={() => startScroll(-1)}
          onTouchEnd={stopScroll}
          className={`absolute bottom-0 left-0 top-0 z-20 flex w-8 items-center justify-center bg-gradient-to-r from-white via-white/90 to-transparent transition-opacity dark:from-black dark:via-black/90 ${
            canScrollLeft ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <ChevronLeft className='h-4 w-4 text-slate-500 dark:text-slate-400' />
        </button>

        {/* Right scroll button */}
        <button
          aria-label='Scroll categories right'
          onMouseDown={() => startScroll(1)}
          onMouseUp={stopScroll}
          onMouseLeave={stopScroll}
          onTouchStart={() => startScroll(1)}
          onTouchEnd={stopScroll}
          className={`absolute bottom-0 right-0 top-0 z-20 flex w-8 items-center justify-center bg-gradient-to-l from-white via-white/90 to-transparent transition-opacity dark:from-black dark:via-black/90 ${
            canScrollRight ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <ChevronRight className='h-4 w-4 text-slate-500 dark:text-slate-400' />
        </button>

        <div ref={scrollRef} className='flex items-center overflow-x-auto scrollbar-hide'>
          {sorted.map((category) => {
            const slug = category.slug?.current ?? toSlug(category.title);
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
