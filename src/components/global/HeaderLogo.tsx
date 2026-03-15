// src/components/global/HeaderLogo.tsx
import Image from 'next/image';
import Link from 'next/link';

const HeaderLogo = () => (
  <Link
    href='/'
    className='group flex items-center space-x-2 transition-transform hover:scale-105 md:space-x-3'
  >
    <div className='relative'>
      <div className='absolute -inset-1 rounded-full bg-gradient-to-r from-untele/50 to-red-400/50 opacity-75 blur transition-opacity group-hover:opacity-100' />
      <div className='relative'>
        <Image
          src='/Logo.png'
          alt='UnTelevised Media Logo'
          width={40}
          height={40}
          className='rounded-full border-2 border-untele/50 shadow-lg md:h-[50px] md:w-[50px]'
          priority
        />
        <div className='absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-untele shadow-sm md:h-3 md:w-3' />
      </div>
    </div>
    <div className='hidden xl:block'>
      <h1 className='bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-lg font-bold tracking-tight text-transparent dark:from-white dark:to-slate-200 md:text-xl'>
        UnTelevised
      </h1>
      <p className='text-xs font-medium text-untele'>Independent Media</p>
    </div>
  </Link>
);

export default HeaderLogo;
