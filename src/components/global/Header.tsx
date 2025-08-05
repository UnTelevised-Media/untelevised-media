// src/components/global/Header.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

import Socials from './Socials';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-100/98 dark:bg-slate-900/98 border-b border-untele/20 shadow-2xl backdrop-blur-md'
          : 'border-b-2 border-untele/30 bg-slate-100/95 shadow-lg backdrop-blur-md dark:bg-slate-900/95'
      }`}
    >
      {/* Breaking News Ticker Bar */}
      <div className='bg-untele/90 px-4 py-1 text-center'>
        <div className='flex items-center justify-center space-x-2'>
          <div className='flex items-center space-x-1'>
            <div className='h-2 w-2 animate-pulse rounded-full bg-white' />
            <span className='text-xs font-bold text-white'>LIVE</span>
          </div>
          <span className='text-xs text-white'>
            Breaking: Ongoing coverage of major developments • Stay tuned for updates
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className='flex w-full items-center justify-between px-4 py-3 lg:px-8'>
        {/* Logo Section */}
        <Link
          href='/'
          className='group flex items-center space-x-3 transition-transform hover:scale-105'
        >
          <div className='relative'>
            <div className='absolute -inset-1 rounded-full bg-gradient-to-r from-untele/50 to-red-400/50 opacity-75 blur transition-opacity group-hover:opacity-100' />
            <div className='relative'>
              <Image
                src='/Logo.png'
                alt='UnTelevised Media Logo'
                width={50}
                height={50}
                className='rounded-full border-2 border-untele/50 shadow-lg'
              />
              <div className='absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-untele shadow-sm' />
            </div>
          </div>
          <div className='hidden lg:block'>
            <h1 className='bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-white dark:to-slate-200'>
              UnTelevised
            </h1>
            <p className='text-xs font-medium text-untele'>Independent Media</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className='hidden items-center space-x-8 lg:flex'>
          <Link
            href='/'
            className='group relative font-medium text-slate-700 transition-colors duration-200 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'
          >
            Home
            <div className='absolute -bottom-1 left-0 h-0.5 w-0 bg-untele transition-all duration-200 group-hover:w-full' />
          </Link>
          <Link
            href='/live-events'
            className='group flex items-center space-x-2 font-medium text-slate-700 transition-colors duration-200 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'
          >
            <PlayIcon className='h-4 w-4 text-untele' />
            <span>Live Coverage</span>
            <div className='h-2 w-2 animate-pulse rounded-full bg-red-500' />
          </Link>
          <Link
            href='/staff'
            className='group relative font-medium text-slate-700 transition-colors duration-200 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'
          >
            Our Team
            <div className='absolute -bottom-1 left-0 h-0.5 w-0 bg-untele transition-all duration-200 group-hover:w-full' />
          </Link>
          <Link
            href='/about'
            className='group relative font-medium text-slate-700 transition-colors duration-200 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'
          >
            Mission
            <div className='absolute -bottom-1 left-0 h-0.5 w-0 bg-untele transition-all duration-200 group-hover:w-full' />
          </Link>
        </nav>

        {/* Right Section */}
        <div className='flex items-center space-x-3'>
          {/* Notifications */}
          <button
            className='relative rounded-lg p-2 text-slate-700 transition-all duration-200 hover:bg-slate-200/50 hover:text-untele dark:text-slate-200 dark:hover:bg-slate-800/50'
            aria-label='Notifications'
          >
            <BellIcon className='h-5 w-5' />
            <div className='absolute right-1 top-1 h-2 w-2 rounded-full bg-untele' />
          </button>

          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className='rounded-lg p-2 text-slate-700 transition-all duration-200 hover:bg-slate-200/50 hover:text-untele dark:text-slate-200 dark:hover:bg-slate-800/50'
            aria-label='Search articles'
          >
            <MagnifyingGlassIcon className='h-5 w-5' />
          </button>

          {/* Theme Toggle */}
          <div className='hidden md:flex'>
            <ThemeToggle />
          </div>

          {/* Support Button */}
          <Link
            href='/donate'
            className='hidden items-center space-x-2 rounded-lg bg-gradient-to-r from-untele to-red-500 px-4 py-2 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl md:flex'
          >
            <span>Support</span>
            <div className='h-2 w-2 animate-pulse rounded-full bg-white/80' />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className='rounded-lg p-2 text-slate-700 transition-all duration-200 hover:bg-slate-200/50 hover:text-untele dark:text-slate-200 dark:hover:bg-slate-800/50 lg:hidden'
            aria-label='Toggle menu'
          >
            {isMenuOpen ? <XMarkIcon className='h-6 w-6' /> : <Bars3Icon className='h-6 w-6' />}
          </button>

          {/* Desktop Socials */}
          <div className='hidden lg:flex'>
            <Socials />
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      {isSearchOpen && (
        <div className='border-t border-slate-300 bg-gradient-to-r from-slate-100 to-slate-200 p-6 backdrop-blur-md dark:border-slate-700 dark:from-slate-900 dark:to-slate-800'>
          <div className='mx-auto max-w-3xl'>
            <div className='relative'>
              <div className='absolute inset-0 rounded-lg bg-gradient-to-r from-untele/20 to-red-400/20 blur' />
              <div className='relative flex items-center'>
                <MagnifyingGlassIcon className='absolute left-4 h-5 w-5 text-slate-600 dark:text-slate-400' />
                <input
                  type='text'
                  placeholder='Search breaking news, investigations, live coverage...'
                  className='w-full rounded-lg border border-slate-400 bg-slate-200/90 py-4 pl-12 pr-4 text-slate-900 placeholder-slate-600 backdrop-blur-sm focus:border-untele focus:outline-none focus:ring-2 focus:ring-untele/50 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder-slate-400'
                  autoFocus
                />
                <button className='absolute right-2 rounded-md bg-untele px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-untele/90'>
                  Search
                </button>
              </div>
            </div>
            <div className='mt-4 flex flex-wrap gap-2'>
              {['Breaking News', 'Live Events', 'Investigations', 'Field Reports'].map((tag) => (
                <button
                  key={tag}
                  className='rounded-full border border-slate-400 bg-slate-200/50 px-3 py-1 text-xs text-slate-700 transition-colors hover:border-untele hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:text-white'
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Mobile Menu */}
      {isMenuOpen && (
        <div className='border-t border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 backdrop-blur-md dark:border-slate-700 dark:from-slate-900 dark:to-slate-800 lg:hidden'>
          <nav className='flex flex-col space-y-6 p-6'>
            <Link
              href='/'
              className='flex items-center space-x-3 py-2 font-medium text-slate-700 transition-colors duration-200 hover:text-untele dark:text-slate-200'
              onClick={() => setIsMenuOpen(false)}
            >
              <div className='h-2 w-2 rounded-full bg-untele' />
              <span>Home</span>
            </Link>
            <Link
              href='/live-events'
              className='flex items-center space-x-3 py-2 font-medium text-slate-700 transition-colors duration-200 hover:text-untele dark:text-slate-200'
              onClick={() => setIsMenuOpen(false)}
            >
              <PlayIcon className='h-4 w-4 text-untele' />
              <span>Live Coverage</span>
              <span className='h-2 w-2 animate-pulse rounded-full bg-red-500' />
            </Link>
            <Link
              href='/staff'
              className='flex items-center space-x-3 py-2 font-medium text-slate-700 transition-colors duration-200 hover:text-untele dark:text-slate-200'
              onClick={() => setIsMenuOpen(false)}
            >
              <div className='h-2 w-2 rounded-full bg-untele' />
              <span>Our Team</span>
            </Link>
            <Link
              href='/about'
              className='flex items-center space-x-3 py-2 font-medium text-slate-700 transition-colors duration-200 hover:text-untele dark:text-slate-200'
              onClick={() => setIsMenuOpen(false)}
            >
              <div className='h-2 w-2 rounded-full bg-untele' />
              <span>Mission</span>
            </Link>

            <div className='border-t border-slate-300 pt-6 dark:border-slate-700'>
              {/* Mobile Theme Toggle */}
              <div className='mb-4 flex items-center justify-between'>
                <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
                  Theme
                </span>
                <ThemeToggle />
              </div>

              <Link
                href='/donate'
                className='mb-6 flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-untele to-red-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl'
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Support Independent Journalism</span>
                <div className='h-2 w-2 animate-pulse rounded-full bg-white/80' />
              </Link>
              <Socials />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
