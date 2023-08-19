import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Socials from './Socials';

const Header = () => {
  return (
    <header className='flex w-full items-center justify-between space-x-2 bg-static px-5 py-2'>
      
      {/* Logo */}
      <div className='flex items-end space-x-2'>
        <Link href='/'>
          <Image src='/Logo.png' alt='' width={50} height={50} />
        </Link>
        <h1 className='text-2xl font-semibold text-untele'>
          UnTelevised Media
        </h1>
      </div>


      {/* Support */}
      <div>
        <Image src='/sim.png' alt='' width={720} height={50} />
      </div>

      {/* Socials */}
      <div>
        <Socials />
      </div>

    </header>
  );
};

export default Header;
