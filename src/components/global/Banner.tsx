import React from 'react';

const Banner = () => {
  return (
    <div className='mb-3 flex flex-col justify-between px-10 py-4 lg:flex-row lg:space-x-5'>
      <div className='w-full'>
        <h1 className='text-7xl font-bold text-untele w-full'>UnTelevised Media</h1>
        <h2 className='mt-5 md:mt-0'>
          The Revolution will be{' '}
          <span className='font-semibold underline decoration-untele decoration-2'>
            UnTelevised
          </span>
        </h2>
      </div>
      <div className='flex flex-col justify-between w-full items-end'>
        <p className='mt-5 max-w-md text-untele md:mt-2 lg:max-w-lg'>
          The latest breaking news you wont see on mainstream media
        </p>
        <div className='bg-slate-500 py-2 px-3 w-full rounded-md shadow-lg border-untele/30 border'>
          <p className='animate-pulse'>Live News Ticker Placeholder Coming Soon</p>
        </div>
      </div>
    </div>
  );
};

export default Banner;
