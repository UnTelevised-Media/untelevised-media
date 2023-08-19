import React from 'react'

const Banner = () => {
  return (
    <div className='flex flex-col lg:flex-row lg:space-x-5 justify-between px-10 py-4 mb-10'>
        <div className=''>
            <h1 className='text-untele text-7xl font-bold'>UnTelevised Media</h1>
            <h2 className='mt-5 md:mt-0'>The Revolution will be {' '}<span className='underline decoration-2 decoration-untele font-semibold'>UnTelevised</span></h2>
        </div>
        <p className='mt-5 md:mt-2 text-untele max-w-md lg:max-w-lg'>The latest breaking news you wont hear on mainstream media</p> 
    </div>
  )
}

export default Banner