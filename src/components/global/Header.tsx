import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Socials from './Socials';

const Header = () => {
  return (
    <header className='flex w-full items-center justify-between space-x-2 border-b-2 border-untele/30 bg-static px-5 py-2 shadow-lg'>
      {/* Logo */}
      <div className='flex'>
        <Link href='/' className='flex items-end space-x-2'>
          <Image src='/Logo.png' alt='' width={50} height={50} />
          <h1 className='hidden text-2xl font-semibold text-slate-200 lg:flex'>
            UnTelevised Media
          </h1>
        </Link>
      </div>

      {/* Support */}
      <div className='hidden items-center md:flex'>
        <Link href='/donate'>
          <Image src='/sim.png' alt='' width={320} height={35} />
        </Link>
      </div>

      {/* Socials */}
      <div className='relative'>
        <Socials />
      </div>
    </header>
  );
};

export default Header;
