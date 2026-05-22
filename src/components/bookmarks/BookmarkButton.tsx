'use client';
// src/components/bookmarks/BookmarkButton.tsx
import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import type { BookmarkEntry } from '@/lib/bookmarks/storage';

type BookmarkButtonProps = Omit<BookmarkEntry, 'bookmarkedAt'> & {
  /** Optional extra class names on the button wrapper */
  className?: string;
  /** Render mode — 'icon' shows icon only; 'full' shows icon + label */
  variant?: 'icon' | 'full';
};

export function BookmarkButton({
  slug,
  title,
  description,
  imageUrl,
  authorName,
  publishedAt,
  readingTime,
  className = '',
  variant = 'icon',
}: BookmarkButtonProps) {
  const { isBookmarked, toggle, ready } = useBookmarks();
  const saved = isBookmarked(slug);

  const handleToggle = () => {
    toggle({ slug, title, description, imageUrl, authorName, publishedAt, readingTime });
  };

  // Render stable placeholder before hook is ready (prevents hydration mismatch / layout shift)
  if (!ready) {
    return (
      <button
        disabled
        aria-label='Bookmark this article'
        className={`flex items-center gap-2 rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 text-slate-500 opacity-50 backdrop-blur-sm dark:border-slate-600/50 dark:bg-slate-800/30 ${className}`}
      >
        <Bookmark className='h-5 w-5' />
        {variant === 'full' && (
          <span className='text-xs font-black uppercase tracking-widest'>Save</span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={saved ? 'Remove bookmark' : 'Bookmark this article'}
      aria-pressed={saved}
      type='button'
      className={`group flex items-center gap-2 rounded-lg border p-2 backdrop-blur-sm transition-all duration-200 ${
        saved
          ? 'border-untele/60 bg-untele/10 text-untele hover:bg-untele/20 dark:bg-untele/20 dark:hover:bg-untele/30'
          : 'border-slate-300/50 bg-slate-200/30 text-slate-600 hover:border-untele/50 hover:bg-untele/10 hover:text-untele dark:border-slate-600/50 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:bg-untele/20'
      } ${className}`}
    >
      {saved ? (
        <BookmarkCheck className='h-5 w-5 transition-transform duration-200 group-hover:scale-110' />
      ) : (
        <Bookmark className='h-5 w-5 transition-transform duration-200 group-hover:scale-110' />
      )}
      {variant === 'full' && (
        <span className='text-xs font-black uppercase tracking-widest'>
          {saved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
