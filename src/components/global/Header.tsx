'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import Socials from './Socials';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className='sticky top-0 z-50 w-full border-b-2 border-untele/30 bg-slate-900/95 shadow-lg backdrop-blur-md'>
      {/* Main Header */}
      <div className='flex w-full items-center justify-between px-4 py-3 lg:px-8'>
        {/* Logo Section */}
        <Link
          href='/'
          className='flex items-center space-x-3 transition-transform hover:scale-105'
        >
          <div className='relative'>
            <Image
              src='/Logo.png'
              alt='UnTelevised Media Logo'
              width={45}
              height={45}
              className='rounded-full border-2 border-untele/30'
            />
            <div className='absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-untele' />
          </div>
          <div className='hidden lg:block'>
            <h1 className='text-xl font-bold tracking-tight text-slate-100'>
              UnTelevised
            </h1>
            <p className='text-xs font-medium text-untele'>Breaking News</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className='hidden items-center space-x-8 lg:flex'>
          <Link
            href='/'
            className='font-medium text-slate-200 transition-colors duration-200 hover:text-untele'
          >
            Home
          </Link>
          <Link
            href='/live-events'
            className='flex items-center space-x-1 font-medium text-slate-200 transition-colors duration-200 hover:text-untele'
          >
            <span className='h-2 w-2 animate-pulse rounded-full bg-red-500' />
            <span>Live</span>
          </Link>
          <Link
            href='/staff'
            className='font-medium text-slate-200 transition-colors duration-200 hover:text-untele'
          >
            Staff
          </Link>
          <Link
            href='/about'
            className='font-medium text-slate-200 transition-colors duration-200 hover:text-untele'
          >
            About
          </Link>
        </nav>

        {/* Right Section */}
        <div className='flex items-center space-x-4'>
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className='rounded-lg p-2 text-slate-200 transition-colors duration-200 hover:bg-slate-800/50 hover:text-untele'
            aria-label='Search articles'
          >
            <MagnifyingGlassIcon className='h-5 w-5' />
          </button>

          {/* Support Button */}
          <Link
            href='/donate'
            className='hidden items-center space-x-2 rounded-lg bg-untele px-4 py-2 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-untele/90 md:flex'
          >
            <span>Support Us</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className='p-2 text-slate-200 transition-colors duration-200 hover:text-untele lg:hidden'
            aria-label='Toggle menu'
          >
            {isMenuOpen ? (
              <XMarkIcon className='h-6 w-6' />
            ) : (
              <Bars3Icon className='h-6 w-6' />
            )}
          </button>

          {/* Desktop Socials */}
          <div className='hidden lg:flex'>
            <Socials />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className='border-t border-slate-700 bg-slate-800/95 p-4 backdrop-blur-md'>
          <div className='mx-auto max-w-2xl'>
            <div className='relative'>
              <MagnifyingGlassIcon className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-slate-400' />
              <input
                type='text'
                placeholder='Search articles, authors, or topics...'
                className='w-full rounded-lg border border-slate-600 bg-slate-700 py-3 pl-10 pr-4 text-slate-100 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-untele'
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='border-t border-slate-700 bg-slate-800/95 backdrop-blur-md lg:hidden'>
          <nav className='flex flex-col space-y-4 p-4'>
            <Link
              href='/'
              className='py-2 font-medium text-slate-200 transition-colors duration-200 hover:text-untele'
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href='/live-events'
              className='flex items-center space-x-2 py-2 font-medium text-slate-200 transition-colors duration-200 hover:text-untele'
              onClick={() => setIsMenuOpen(false)}
            >
              <span className='h-2 w-2 animate-pulse rounded-full bg-red-500' />
              <span>Live Events</span>
            </Link>
            <Link
              href='/staff'
              className='py-2 font-medium text-slate-200 transition-colors duration-200 hover:text-untele'
              onClick={() => setIsMenuOpen(false)}
            >
              Staff
            </Link>
            <Link
              href='/about'
              className='py-2 font-medium text-slate-200 transition-colors duration-200 hover:text-untele'
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href='/donate'
              className='mt-4 rounded-lg bg-untele px-4 py-3 text-center font-medium text-white transition-all duration-200 hover:bg-untele/90'
              onClick={() => setIsMenuOpen(false)}
            >
              Support Our Journalism
            </Link>
            <div className='border-t border-slate-700 pt-4'>
              <Socials />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
