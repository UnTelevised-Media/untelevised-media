import Link from 'next/link';
import { BsDiscord, BsTwitch, BsTwitter, BsYoutube } from 'react-icons/bs';
import { FaFacebookF, FaRedditAlien, FaTiktok } from 'react-icons/fa';
import { GrInstagram } from 'react-icons/gr';

const Socials = () => {
  return (
    <div className='flex items-center gap-x-4'>
      <Link
        href='https://www.youtube.com/@UnTelevised'
        className='text-[#FF0000] '
      >
        <BsYoutube className='h-8 w-8' />
      </Link>
      <Link
        href='https://twitter.com/UnTelevisedLive'
        className='text-[#1DA1F2] '
      >
        <BsTwitter className='h-8 w-8' />
      </Link>
      <Link
        href='https://www.twitch.tv/untelevised'
        className='text-[#9146FF] '
      >
        <BsTwitch className='h-8 w-8' />
      </Link>
      <Link
        href='https://www.tiktok.com/@untelevisedmedia'
        className='text-[#ff0050] '
      >
        <FaTiktok className='h-8 w-8' />
      </Link>
      <Link
        href='https://www.instagram.com/untelevised.media/'
        className='text-[#C13584] '
      >
        <GrInstagram className='h-8 w-8' />
      </Link>
      <Link
        href='https://www.facebook.com/UnTelevisedLive'
        className='text-[#1DA1F2] '
      >
        <FaFacebookF className='h-8 w-8' />
      </Link>
      <Link
        href='https://www.reddit.com/r/UnTelevisedMedia/'
        className='text-[#FF5700] '
      >
        <FaRedditAlien className='h-8 w-8' />
      </Link>
      <Link 
        href='https://discord.gg/w9vMH5zr6j' 
        className='text-[#738ADB] '>
        <BsDiscord className='h-8 w-8' />
      </Link>
    </div>
  );
};

export default Socials;
