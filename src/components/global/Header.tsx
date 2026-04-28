// src/components/global/Header.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Bookmark } from 'lucide-react';
import { Show, UserButton } from '@clerk/nextjs';

import Socials from './Socials';
import ThemeToggle from './ThemeToggle';
import { Flame, Music, Radio } from 'lucide-react';

const Header = ({ logoSlot }: { logoSlot: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-100/98 dark:bg-slate-900/98 border-b border-untele/20 shadow-2xl backdrop-blur-md'
          : 'border-b-2 border-untele/30 bg-slate-100/95 shadow-lg backdrop-blur-md dark:bg-slate-900/95'
      }`}
    >
      {/* Main Header */}
      <div className='flex w-full items-center justify-between px-4 py-2 md:py-3 lg:px-8'>
        {/* Logo Section — server-hoisted to avoid re-renders on client interactions */}
        {logoSlot}

        {/* Desktop Navigation */}
        <nav className='hidden items-center space-x-6 lg:flex'>
          <Link
            href='https://untelevised.live'
            className='group flex items-center space-x-2 rounded-lg py-2 transition-all duration-200 hover:bg-green-50 dark:hover:bg-green-900/20'
          >
            <Radio className='h-4 w-4 animate-pulse text-green-500' />
            <span className='text-sm font-medium text-green-600 dark:text-green-400'>
              Live Coverage
            </span>
          </Link>

          <Link
            href='/category/breaking'
            className='group flex items-center space-x-2 rounded-lg py-2 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20'
          >
            <Flame className='h-4 w-4 animate-pulse text-untele' />
            <span className='text-sm font-medium text-untele'>Breaking Events</span>
          </Link>

          <Link
            href='/past-events'
            className='group relative text-sm font-medium text-slate-700 transition-colors duration-200 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'
          >
            Past Events
            <div className='absolute -bottom-1 left-0 h-0.5 w-0 bg-untele transition-all duration-200 group-hover:w-full' />
          </Link>
          <Link
            href='https://radio.untelevised.live'
            className='group flex items-center space-x-2 rounded-lg py-2 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            target='_blank'
            rel='noopener noreferrer'
          >
            <Music className='h-4 w-4 animate-pulse text-blue-500' />
            <span className='text-sm font-medium text-blue-600 dark:text-blue-400'>Radio</span>
          </Link>
          <Link
            href='/lyrics'
            className='group relative text-sm font-medium text-slate-700 transition-colors duration-200 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'
          >
            Music
            <div className='absolute -bottom-1 left-0 h-0.5 w-0 bg-untele transition-all duration-200 group-hover:w-full' />
          </Link>

          <Link
            href='/staff'
            className='group relative text-sm font-medium text-slate-700 transition-colors duration-200 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'
          >
            Our Team
            <div className='absolute -bottom-1 left-0 h-0.5 w-0 bg-untele transition-all duration-200 group-hover:w-full' />
          </Link>

          <Link
            href='/about'
            className='group relative text-sm font-medium text-slate-700 transition-colors duration-200 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'
          >
            Mission
            <div className='absolute -bottom-1 left-0 h-0.5 w-0 bg-untele transition-all duration-200 group-hover:w-full' />
          </Link>

          <Link
            href='/bookstore'
            className='flex items-center rounded-lg border border-untele/50 bg-untele/10 px-3 py-1.5 text-sm font-black uppercase tracking-widest text-untele transition-all duration-200 hover:bg-untele hover:text-white'
          >
            Bookstore
          </Link>
        </nav>

        {/* Right Section */}
        <div className='flex items-center space-x-2 md:space-x-3'>
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className='rounded-lg p-1.5 text-slate-700 transition-all duration-200 hover:bg-slate-200/50 hover:text-untele dark:text-slate-200 dark:hover:bg-slate-800/50 md:p-2'
            aria-label='Search articles'
          >
            <MagnifyingGlassIcon className='h-4 w-4 md:h-5 md:w-5' />
          </button>

          {/* Reading List */}
          <Link
            href='/reading-list'
            className='rounded-lg p-1.5 text-slate-700 transition-all duration-200 hover:bg-slate-200/50 hover:text-untele dark:text-slate-200 dark:hover:bg-slate-800/50 md:p-2'
            aria-label='Reading list'
          >
            <Bookmark className='h-4 w-4 md:h-5 md:w-5' />
          </Link>

          {/* Theme Toggle */}
          <div className='hidden md:flex'>
            <ThemeToggle />
          </div>

          {/* User Account */}
          <Show when='signed-in'>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8',
                  userButtonPopoverCard: 'shadow-xl border border-slate-200 dark:border-slate-700',
                },
              }}
            />
          </Show>
          <Show when='signed-out'>
            <Link
              href='/sign-in'
              className='hidden text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-untele dark:text-slate-400 md:block'
            >
              Sign In
            </Link>
          </Show>

          {/* Support Button */}
          <Link
            href='/donate'
            className='hidden items-center space-x-1.5 rounded-lg bg-gradient-to-r from-untele to-red-500 px-3 py-1.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl md:flex md:px-4 md:py-2'
          >
            <span>Support</span>
            <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-white/80 md:h-2 md:w-2' />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className='rounded-lg p-1.5 text-slate-700 transition-all duration-200 hover:bg-slate-200/50 hover:text-untele dark:text-slate-200 dark:hover:bg-slate-800/50 md:p-2 lg:hidden'
            aria-label='Toggle menu'
          >
            {isMenuOpen ? (
              <XMarkIcon className='h-5 w-5 md:h-6 md:w-6' />
            ) : (
              <Bars3Icon className='h-5 w-5 md:h-6 md:w-6' />
            )}
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
          <div className='mx-auto max-w-[1400px]'>
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
              href='https://untelevised.live'
              className='flex items-center space-x-3 py-2 font-medium text-slate-700 transition-colors duration-200 hover:text-untele dark:text-slate-200'
              onClick={() => setIsMenuOpen(false)}
            >
              <div className='h-2 w-2 rounded-full bg-untele' />
              {/* Live Coverage Link */}
              <div className='group flex cursor-pointer items-center space-x-2 rounded-lg py-2 backdrop-blur-sm transition-all duration-200 hover:shadow-lg'>
                <span className='text-sm font-bold tracking-wider text-green-400'>
                  Live Coverage
                </span>
                <Radio className='h-4 w-4 animate-pulse text-green-400' />
              </div>
            </Link>

            <Link
              href='https://radio.untelevised.live'
              className='flex items-center space-x-3 py-2 font-medium text-slate-700 transition-colors duration-200 hover:text-untele dark:text-slate-200'
              onClick={() => setIsMenuOpen(false)}
              target='_blank'
              rel='noopener noreferrer'
            >
              <div className='h-2 w-2 rounded-full bg-untele' />
              {/* Radio Link */}
              <div className='group flex cursor-pointer items-center space-x-2 rounded-lg py-2 backdrop-blur-sm transition-all duration-200 hover:shadow-lg'>
                <span className='text-sm font-bold tracking-wider text-blue-400'>Radio</span>
                <Radio className='h-4 w-4 animate-pulse text-blue-400' />
              </div>
            </Link>

            <Link
              href='/live-events'
              className='duration-20 group flex max-w-54 cursor-pointer items-center space-x-3 rounded-lg py-2 font-medium text-slate-700 backdrop-blur-sm transition-colors hover:text-untele hover:shadow-lg dark:text-slate-200'
              onClick={() => setIsMenuOpen(false)}
            >
              <div className='h-2 w-2 rounded-full bg-untele' />
              <span className='text-sm font-bold tracking-wider text-untele'>Breaking Events</span>
              <Flame className='h-4 w-4 animate-pulse text-untele' />
            </Link>

            <Link
              href='/past-events'
              className='flex items-center space-x-3 py-2 font-medium text-slate-700 transition-colors duration-200 hover:text-untele dark:text-slate-200'
              onClick={() => setIsMenuOpen(false)}
            >
              <div className='h-2 w-2 rounded-full bg-untele' />
              <span>Past Events</span>
            </Link>

            <Link
              href='/lyrics'
              className='flex items-center space-x-3 py-2 font-medium text-slate-700 transition-colors duration-200 hover:text-untele dark:text-slate-200'
              onClick={() => setIsMenuOpen(false)}
            >
              <div className='h-2 w-2 rounded-full bg-untele' />
              <span>Music</span>
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

            <Link
              href='/bookstore'
              className='flex items-center space-x-3 py-2 font-black uppercase tracking-widest text-untele transition-colors duration-200'
              onClick={() => setIsMenuOpen(false)}
            >
              <div className='h-2 w-2 rounded-full bg-untele' />
              <span>Bookstore</span>
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
