/* eslint-disable react/function-component-definition */
import Link from 'next/link';
import React from 'react';

export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900'>
      <h1 className='mb-8 text-9xl font-bold text-untele'>
        404
      </h1>
      <p className='mb-8 text-2xl text-slate-200'>
        Oops! The page you're looking for can't be found.
      </p>
      <p className='mb-12 text-lg text-slate-300'>
        It seems you've reached a broken link or a page that no longer exists.
      </p>

      <div className='flex gap-6'>
        <Link
          href='/'
          className='rounded-lg bg-untele px-4 py-2 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-untele/90'
        >
          Back to Home
        </Link>
        <Link
          href='/contact'
          className='rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 font-medium text-slate-200 shadow-lg transition-all duration-200 hover:bg-slate-700/50 hover:text-white backdrop-blur-sm'
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
