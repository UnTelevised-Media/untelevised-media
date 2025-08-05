// src/components/sanity/DraftModeBanner.tsx
'use client';

import Link from 'next/link';
import { EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DraftModeBannerProps {
  isEnabled: boolean;
}

const DraftModeBanner: React.FC<DraftModeBannerProps> = ({ isEnabled }) => {
  if (!isEnabled) {
    return null;
  }

  return (
    <div className='fixed left-0 right-0 top-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-3'>
        <div className='flex items-center space-x-3'>
          <EyeIcon className='h-5 w-5' />
          <div>
            <p className='font-semibold'>Preview Mode Active</p>
            <p className='text-xs text-blue-100'>
              You&apos;re viewing draft content with live updates
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          <Link
            href='/studio'
            className='rounded bg-blue-800 px-3 py-1 text-sm font-medium transition-colors hover:bg-blue-900'
          >
            Open Studio
          </Link>

          <Link
            href='/api/disable-draft'
            className='flex items-center space-x-1 rounded bg-red-600 px-3 py-1 text-sm font-medium transition-colors hover:bg-red-700'
          >
            <XMarkIcon className='h-4 w-4' />
            <span>Exit Preview</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DraftModeBanner;
