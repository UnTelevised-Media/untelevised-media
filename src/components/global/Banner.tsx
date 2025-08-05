// src/components/global/Banner.tsx
import React from 'react';
import { CalendarIcon, ClockIcon, GlobeAltIcon, UsersIcon } from '@heroicons/react/24/outline';
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
    <section className='relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 py-8 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'>
      {/* Animated Background Elements */}
      <div className='absolute inset-0'>
        {/* Grid Pattern */}
        <div className='bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23dc2626" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] absolute inset-0 opacity-40' />

        {/* Floating Orbs */}
        <div className='absolute left-1/4 top-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-r from-untele/20 to-red-400/20 blur-3xl' />
        <div
          className='absolute bottom-20 right-1/4 h-48 w-48 animate-pulse rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl'
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col space-y-8 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
          {/* Brand Section */}
          <div className='text-center lg:flex-1 lg:text-left'>
            {/* Breaking News Alert */}
            {/* <div className='mb-6 inline-flex items-center space-x-3 rounded-full border border-untele/30 bg-untele/10 px-6 py-2 backdrop-blur-sm'>
              <div className='h-2 w-2 animate-pulse rounded-full bg-untele' />
              <span className='text-sm font-bold uppercase tracking-wider text-untele'>
                Breaking Coverage
              </span>
              <div className='h-2 w-2 animate-pulse rounded-full bg-untele' />
            </div> */}

            <h1 className='mb-4 text-5xl font-bold text-slate-900 dark:text-white sm:text-6xl lg:text-7xl'>
              <span className='bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent dark:from-white dark:via-slate-100 dark:to-slate-300'>
                UnTelevised
              </span>
              <div className='mt-2 flex items-center justify-center space-x-3 lg:justify-start'>
                <span className='bg-gradient-to-r from-untele to-red-400 bg-clip-text text-3xl font-normal text-transparent sm:text-4xl lg:text-5xl'>
                  Media
                </span>
                {/* <div className='flex space-x-1'>
                  <div
                    className='h-2 w-2 animate-bounce rounded-full bg-untele'
                    style={{ animationDelay: '0s' }}
                  />
                  <div
                    className='h-2 w-2 animate-bounce rounded-full bg-untele'
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className='h-2 w-2 animate-bounce rounded-full bg-untele'
                    style={{ animationDelay: '0.4s' }}
                  />
                </div> */}
              </div>
            </h1>

            <p className='mx-auto mb-6 max-w-2xl text-lg text-slate-700 dark:text-slate-300 lg:mx-0 lg:text-xl'>
              <span className='font-semibold text-slate-900 dark:text-white'>Independent.</span>{' '}
              <span className='font-semibold text-slate-900 dark:text-white'>Unfiltered.</span>{' '}
              <span className='font-semibold text-untele'>Unstoppable.</span>
              <br />
              The Revolution will be{' '}
              <span className='font-bold text-untele underline decoration-2 underline-offset-4'>
                UnTelevised
              </span>
            </p>

            {/* Stats Row */}
            <div className='flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400 lg:justify-start'>
              <div className='flex items-center space-x-2'>
                <CalendarIcon className='h-4 w-4 text-untele' />
                <span>{currentDate}</span>
              </div>
              <div className='flex items-center space-x-2'>
                <ClockIcon className='h-4 w-4 text-untele' />
                <span>{currentTime}</span>
              </div>
              <div className='flex items-center space-x-2'>
                <GlobeAltIcon className='h-4 w-4 text-untele' />
                <span>Global Coverage</span>
              </div>
              <div className='flex items-center space-x-2'>
                <UsersIcon className='h-4 w-4 text-untele' />
                <span>Independent Reporting</span>
              </div>
            </div>
          </div>

          {/* Enhanced Ticker Section */}
          <div className='lg:max-w-2xl lg:flex-1'>

            {/* Warning  */}
            <div className='flex items-center justify-center mb-2 w-full mx-auto'>
              <div className='h-1 w-8 rounded-full bg-gradient-to-r from-transparent to-untele' />
              <h2 className='text-wrap text-xs font-light text-slate-900 dark:text-white'>
                Please excuse our mess we are now testing and rolling out new features and UI on
                the live site.
              </h2>
              <div className='h-1 w-8 rounded-full bg-gradient-to-l from-transparent to-untele' />
            </div>

            {/* Live News Feed */}
            <div className='mb-6 flex items-center justify-between text-center lg:text-right'>
              <div className='flex items-center justify-center space-x-3 lg:justify-end'>
                <div className='h-1 w-8 rounded-full bg-gradient-to-r from-transparent to-untele' />
                <h2 className='text-xl font-semibold text-slate-900 dark:text-white lg:text-2xl'>
                  Live News Feed
                </h2>
                <div className='h-1 w-8 rounded-full bg-gradient-to-l from-transparent to-untele' />
              </div>
              <div className='flex items-center justify-center space-x-2 lg:justify-end'>
                <div className='h-2 w-2 animate-pulse rounded-full bg-green-400' />
                <span className='text-sm text-slate-700 dark:text-slate-300'>
                  Real-time updates
                </span>
              </div>
            </div>

            <div className='relative'>
              {/* Enhanced Gradient overlays */}
              <div className='pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-slate-100 via-slate-100/80 to-transparent dark:from-slate-900 dark:via-slate-900/80' />
              <div className='pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-slate-100 via-slate-100/80 to-transparent dark:from-slate-900 dark:via-slate-900/80' />

              <div className='overflow-hidden rounded-xl border border-slate-400/50 bg-gradient-to-r from-slate-200/60 to-slate-300/60 shadow-2xl backdrop-blur-sm dark:border-slate-600/50 dark:from-slate-800/60 dark:to-slate-700/60'>
                <div className='border-b border-slate-400/30 bg-slate-200/40 px-4 py-2 dark:border-slate-600/30 dark:bg-slate-800/40'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <div className='h-2 w-2 rounded-full bg-green-400' />
                      <span className='text-xs font-medium text-slate-700 dark:text-slate-300'>
                        LIVE FEED
                      </span>
                    </div>
                    <div className='flex space-x-1'>
                      <div className='h-1 w-6 rounded-full bg-untele/60' />
                      <div className='h-1 w-4 rounded-full bg-slate-400 dark:bg-slate-600' />
                      <div className='h-1 w-3 rounded-full bg-slate-400 dark:bg-slate-600' />
                    </div>
                  </div>
                </div>
                <Ticker />
              </div>
            </div>

            {/* News Categories Quick Access */}
            <div className='mt-6 hidden lg:block'>
              <div className='flex flex-wrap justify-end gap-2'>
                {['Breaking', 'Politics', 'International', 'Investigation'].map((category) => (
                  <button
                    key={category}
                    className='rounded-full border border-slate-400/50 bg-slate-200/30 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur-sm transition-all duration-200 hover:border-untele/50 hover:bg-untele/10 hover:text-slate-900 dark:border-slate-600/50 dark:bg-slate-800/30 dark:text-slate-300 dark:hover:text-white'
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Breaking News Alert */}
        {/* <div className='mt-12 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-600/10 to-red-800/10 p-6 backdrop-blur-sm'>
          <div className='flex items-center justify-center space-x-4 md:justify-start'>
            <div className='flex items-center space-x-2'>
              <div className='h-3 w-3 animate-pulse rounded-full bg-red-500 shadow-lg' />
              <span className='text-sm font-bold uppercase tracking-wider text-red-400'>
                Alert
              </span>
            </div>
            <p className='text-center text-slate-900 dark:text-white md:text-left'>
              <span className='font-semibold'>Major Story Developing:</span> Continuous coverage of
              breaking events -
              <span className='ml-1 cursor-pointer text-untele underline transition-colors hover:text-red-300'>
                Follow live updates here
              </span>
            </p>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default Banner;
