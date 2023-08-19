/* eslint-disable react/destructuring-assignment */
import Link from 'next/link';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

const StudioNavbar = (props: any) => {
  return (
    <div className=''>
      {/* <Image src='/fuzzbar.png' width={2000} height={300} alt='' className='z-0'/> */}
      <div className='z-10 flex items-center justify-between px-5 py-4'>
        <Link href='/' className='flex items-center font-bold text-untele'>
          <ArrowUturnLeftIcon className='mr-2 h-6 w-6' />{' '}
          <span>Go To Website</span>
        </Link>
        <Image
          src='/utprod.png'
          width={500}
          height={100}
          alt=''
          className='hidden md:flex'
        />
      </div>
      <>{props.renderDefault(props)}</>
    </div>
  );
};

export default StudioNavbar;
