import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {  
  return (
    <Link href='/' className='flex items-end space-x-2'>
      <Image src='/Logo.png' alt='' width={50} height={50} />
      <h1 className='hidden text-2xl font-semibold text-slate-200 lg:flex'>
        UnTelevised Media
      </h1>
    </Link>
  );
};

export default Logo;
