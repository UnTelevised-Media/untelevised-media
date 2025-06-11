import React from 'react';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import '@/components/global/ticker.css';
import Ticker from './Ticker';

const Banner = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <section className='relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-8'>
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-10'>
        <div className='bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] absolute inset-0' />
      </div>

      <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
          {/* Brand Section */}
          <div className='text-center lg:flex-1 lg:text-left'>
            <div className='mb-3 flex items-center justify-center space-x-3 lg:justify-start'>
              <div className='h-1 w-12 rounded-full bg-untele' />
              <span className='text-sm font-bold uppercase tracking-wider text-untele'>
                Independent Media
              </span>
              <div className='h-1 w-12 rounded-full bg-untele' />
            </div>

            <h1 className='text-4xl font-bold text-white sm:text-5xl lg:text-6xl'>
              <span className='bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent'>
                UnTelevised
              </span>
              <span className='mt-1 block text-2xl font-normal text-untele sm:text-3xl lg:text-4xl'>
                Media
              </span>
            </h1>

            <p className='mx-auto mt-4 max-w-md text-lg text-slate-300 lg:mx-0'>
              The Revolution will be{' '}
              <span className='font-bold text-untele underline decoration-2 underline-offset-4'>
                UnTelevised
              </span>
            </p>

            {/* Date and Time */}
            <div className='mt-6 flex flex-col items-center justify-center space-y-2 text-sm text-slate-400 sm:flex-row sm:space-x-6 sm:space-y-0 lg:justify-start'>
              <div className='flex items-center space-x-2'>
                <CalendarIcon className='h-4 w-4' />
                <span>{currentDate}</span>
              </div>
              <div className='flex items-center space-x-2'>
                <ClockIcon className='h-4 w-4' />
                <span>{currentTime}</span>
              </div>
            </div>
          </div>

          {/* Ticker Section */}
          <div className='lg:max-w-3xl lg:flex-1'>
            <div className='mb-4 text-center lg:text-right'>
              <h2 className='mb-2 text-lg font-semibold text-white'>
                Latest Headlines
              </h2>
              <div className='h-px bg-gradient-to-r from-transparent via-untele to-transparent' />
            </div>

            <div className='relative'>
              {/* Gradient overlays for fade effect */}
              <div className='pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-slate-900 to-transparent' />
              <div className='pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-slate-900 to-transparent' />

              <div className='overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 shadow-xl backdrop-blur-sm'>
                <Ticker />
              </div>
            </div>
          </div>
        </div>

        {/* Breaking News Alert (conditional) */}
        <div className='mt-8 hidden'>
          <div className='rounded-lg border border-red-500/30 bg-red-600/20 p-4 backdrop-blur-sm'>
            <div className='flex items-center space-x-3'>
              <div className='flex items-center space-x-2'>
                <div className='h-2 w-2 animate-pulse rounded-full bg-red-500' />
                <span className='text-sm font-bold uppercase tracking-wider text-red-400'>
                  Breaking
                </span>
              </div>
              <p className='text-white'>
                Major development in ongoing story - Full coverage available
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
