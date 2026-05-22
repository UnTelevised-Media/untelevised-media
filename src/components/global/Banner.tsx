// src/components/global/Banner.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { CalendarIcon, ClockIcon, GlobeAltIcon, UsersIcon } from '@heroicons/react/24/outline';
import '@/components/global/ticker.css';
import Ticker from './Ticker';

const Banner = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 py-4 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'>
      {/* Animated Background Elements */}
      <div className='absolute inset-0'>
        {/* Grid Pattern */}
        <div className='bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23dc2626" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] absolute inset-0 opacity-40' />

        {/* Floating Orbs */}
        <div className='absolute left-1/4 top-10 h-48 w-48 animate-pulse rounded-full bg-gradient-to-r from-untele/20 to-red-400/20 blur-3xl' />
        <div
          className='absolute bottom-10 right-1/4 h-36 w-36 animate-pulse rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl'
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className='relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col space-y-6 lg:flex-row lg:items-stretch lg:justify-between lg:space-x-8 lg:space-y-0'>
          {/* Brand Section */}
          <div className='flex flex-col justify-between text-center lg:flex-shrink-0 lg:text-left'>
            {/* Breaking News Alert */}
            {/* <div className='mb-6 inline-flex items-center space-x-3 rounded-full border border-untele/30 bg-untele/10 px-6 py-2 backdrop-blur-sm'>
              <div className='h-2 w-2 animate-pulse rounded-full bg-untele' />
              <span className='text-sm font-bold uppercase tracking-wider text-untele'>
                Breaking Coverage
              </span>
              <div className='h-2 w-2 animate-pulse rounded-full bg-untele' />
            </div> */}

            <h1 className='mb-3 text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl lg:text-6xl'>
              <span className='bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent dark:from-white dark:via-slate-100 dark:to-slate-300'>
                UnTelevised
              </span>
              <div className='mt-2 flex items-center justify-center space-x-3 lg:justify-start'>
                <span className='bg-gradient-to-r from-untele to-red-400 bg-clip-text text-2xl font-normal text-transparent sm:text-3xl lg:text-4xl'>
                  Media
                </span>
                <div className='flex space-x-1'>
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
                </div>
              </div>
            </h1>

            <p className='mx-auto mb-4 max-w-[1400px] text-base text-slate-700 dark:text-slate-300 lg:mx-0 lg:text-lg'>
              <span className='font-semibold text-slate-900 dark:text-white'>Independent.</span>{' '}
              <span className='font-semibold text-slate-900 dark:text-white'>Unfiltered.</span>{' '}
              <span className='font-semibold text-untele'>Unstoppable.</span>
              <br />
              The Revolution will be{' '}
              <span className='font-bold text-untele underline decoration-2 underline-offset-4'>
                UnTelevised
              </span>
            </p>
          </div>

          {/* Ticker Section */}
          <div className='flex w-full flex-col justify-between lg:min-w-0 lg:flex-1'>
            {/* Top Section: Title Only */}
            <div>
              {/* Live News Feed Title */}
              <div className='mb-6 flex items-center justify-start'>
                <div className='flex items-center space-x-3'>
                  <div className='h-1 w-8 rounded-full bg-gradient-to-r from-transparent to-untele' />
                  <h2 className='text-lg font-semibold text-slate-900 dark:text-white lg:text-xl'>
                    Live News Feed
                  </h2>
                  <div className='h-1 w-8 rounded-full bg-gradient-to-l from-transparent to-untele' />
                </div>
              </div>
            </div>

            {/* Bottom Section: Stats + Ticker */}
            <div>
              {/* Stats Row - Attached to Ticker */}
              <div className='mb-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400'>
                <div className='flex items-center space-x-1'>
                  <CalendarIcon className='h-3 w-3 text-untele' />
                  <span>{currentDate}</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <ClockIcon className='h-3 w-3 text-untele' />
                  <span>{currentTime}</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <GlobeAltIcon className='h-3 w-3 text-untele' />
                  <span>Global Coverage</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <UsersIcon className='h-3 w-3 text-untele' />
                  <span>Independent Reporting</span>
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
