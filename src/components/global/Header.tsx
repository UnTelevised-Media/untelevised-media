import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Socials from './Socials';

const Header = () => {
  return (
    <header className='flex w-full items-center justify-between space-x-2 border-b-2 shadow-lg border-untele/30 bg-static px-5 py-2'>
      {/* Logo */}
      <div className='flex'>
        <Link href='/' className='flex items-end space-x-2'>
          <Image src='/Logo.png' alt='' width={50} height={50} />
          {/* <h1 className='text-xl font-semibold text-untele'>
            UnTelevised Media
          </h1> */}
        </Link>
      </div>

      {/* Support */}
      <div className='hidden lg:flex items-center'>
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
