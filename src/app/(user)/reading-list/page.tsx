'use client';
// src/app/(user)/reading-list/page.tsx
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, BookmarkX, Trash2, ArrowUpRight, Clock } from 'lucide-react';
import {
  getBookmarks,
  removeBookmark,
  clearBookmarks,
  type BookmarkEntry,
} from '@/lib/bookmarks/storage';
import formatDate from '@/util/formatDate';

export default function ReadingListPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setBookmarks(getBookmarks());
    setMounted(true);
  }, []);

  const handleRemove = (slug: string) => {
    const next = removeBookmark(slug);
    setBookmarks(next);
  };

  const handleClearAll = () => {
    clearBookmarks();
    setBookmarks([]);
  };

  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* HERO */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-12 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-5xl px-4'>
          <div className='mb-6 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-white md:text-3xl'>
                <Bookmark className='h-6 w-6' />
                READING LIST
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>
          <p className='max-w-2xl text-slate-600 dark:text-slate-400'>
            Articles you&rsquo;ve saved for later. Stored locally in your browser — no account
            required.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <main className='mx-auto max-w-5xl px-4 py-10'>
        {!mounted ? (
          /* Loading skeleton — prevents flash of empty state on hydration */
          <div className='space-y-4'>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className='animate-pulse border border-slate-200 bg-slate-100 p-6 dark:border-slate-800 dark:bg-slate-900'
              >
                <div className='flex gap-4'>
                  <div className='h-20 w-28 flex-shrink-0 bg-slate-300 dark:bg-slate-700' />
                  <div className='flex-1 space-y-3'>
                    <div className='h-4 w-3/4 bg-slate-300 dark:bg-slate-700' />
                    <div className='h-3 w-1/2 bg-slate-200 dark:bg-slate-800' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          /* Empty state */
          <div className='flex flex-col items-center justify-center py-24 text-center'>
            <Bookmark className='mb-6 h-16 w-16 text-slate-300 dark:text-slate-700' />
            <h2 className='mb-3 text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
              YOUR READING LIST IS EMPTY
            </h2>
            <p className='mb-8 max-w-md text-slate-600 dark:text-slate-400'>
              When you find an article you want to read later, tap the bookmark icon to save it
              here. No sign-in required.
            </p>
            <Link
              href='/'
              className='bg-untele px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
            >
              BROWSE ARTICLES
            </Link>
          </div>
        ) : (
          <>
            {/* Header row */}
            <div className='mb-6 flex items-center justify-between'>
              <p className='text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                {bookmarks.length} {bookmarks.length === 1 ? 'ARTICLE' : 'ARTICLES'} SAVED
              </p>
              <button
                onClick={handleClearAll}
                className='flex items-center gap-2 border border-slate-300 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 transition-colors hover:border-untele hover:text-untele dark:border-slate-700 dark:text-slate-400 dark:hover:border-untele dark:hover:text-untele'
              >
                <Trash2 className='h-3.5 w-3.5' />
                CLEAR ALL
              </button>
            </div>

            {/* Bookmark list */}
            <ul className='space-y-4' role='list'>
              {bookmarks.map((bookmark) => (
                <li
                  key={bookmark.slug}
                  className='group border border-slate-200 bg-slate-50 transition-all hover:border-untele dark:border-slate-800 dark:bg-slate-950'
                >
                  <div className='flex gap-0'>
                    {/* Thumbnail */}
                    {bookmark.imageUrl && (
                      <Link
                        href={`/articles/${bookmark.slug}`}
                        className='relative hidden h-auto w-36 flex-shrink-0 overflow-hidden sm:block'
                        tabIndex={-1}
                        aria-hidden='true'
                      >
                        <Image
                          src={bookmark.imageUrl}
                          alt={bookmark.title}
                          fill
                          className='object-cover transition-transform duration-300 group-hover:scale-105'
                          sizes='144px'
                        />
                      </Link>
                    )}

                    {/* Content */}
                    <div className='flex flex-1 flex-col justify-between p-5'>
                      <div>
                        <Link href={`/articles/${bookmark.slug}`} className='group/link'>
                          <h2 className='mb-1 text-base font-bold leading-snug text-slate-900 transition-colors group-hover/link:text-untele dark:text-white'>
                            {bookmark.title}
                          </h2>
                        </Link>
                        {bookmark.description && (
                          <p className='mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400'>
                            {bookmark.description}
                          </p>
                        )}
                      </div>

                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        {/* Meta */}
                        <div className='flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-500'>
                          {bookmark.authorName && <span>{bookmark.authorName}</span>}
                          {bookmark.publishedAt && (
                            <time>{formatDate(bookmark.publishedAt)}</time>
                          )}
                          {bookmark.readingTime && (
                            <span className='flex items-center gap-1'>
                              <Clock className='h-3 w-3' />
                              {bookmark.readingTime}
                            </span>
                          )}
                          <span className='text-slate-400 dark:text-slate-600'>
                            Saved {formatDate(bookmark.bookmarkedAt)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleRemove(bookmark.slug)}
                            aria-label={`Remove "${bookmark.title}" from reading list`}
                            className='flex items-center gap-1 border border-slate-300 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-slate-500 transition-colors hover:border-untele hover:text-untele dark:border-slate-700 dark:text-slate-500'
                          >
                            <BookmarkX className='h-3.5 w-3.5' />
                            Remove
                          </button>
                          <Link
                            href={`/articles/${bookmark.slug}`}
                            className='flex items-center gap-1 bg-untele px-3 py-1.5 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
                          >
                            Read
                            <ArrowUpRight className='h-3.5 w-3.5' />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer note */}
            <p className='mt-10 text-center text-xs text-slate-400 dark:text-slate-600'>
              Bookmarks are stored only in this browser. Clearing your browser data will remove
              them.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
