/* eslint-disable react/destructuring-assignment */
import Link from 'next/link';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/solid'; 
import Image from 'next/image';

const StudioNavbar = (props: any) => {
  return (
          <div className=''>
            {/* <Image src='/fuzzbar.png' width={2000} height={300} alt='' className='z-0'/> */}
        <div className='px-5 py-4 flex items-center justify-between z-10'>
<Link href='/' className='font-bold text-untele flex items-center'>
        <ArrowUturnLeftIcon className='w-6 h-6 mr-2'/> <span>Go To Website</span>
</Link>
<Image src='/utprod.png' width={500} height={100} alt='' className='hidden md:flex'/>
        </div>
        <>{props.renderDefault(props)}</>
        </div>
  )
}

export default StudioNavbar