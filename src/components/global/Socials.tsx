import Link from 'next/link';
import { BsDiscord, BsTwitch, BsTwitter, BsYoutube } from 'react-icons/bs';
import { FaFacebookF, FaRedditAlien, FaTelegram, FaTiktok } from 'react-icons/fa';
import { FaThreads } from 'react-icons/fa6';
import { GrInstagram } from 'react-icons/gr';

const Socials = () => {
  return (
    <div className='flex items-center gap-1 sm:gap-1.5'>
      <Link
        href='https://www.youtube.com/@AntiWarTV'
        className='group rounded-lg border border-slate-300/50 bg-slate-200/30 p-1 backdrop-blur-sm transition-all duration-200 hover:border-[#FF0000]/50 hover:bg-[#FF0000]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#FF0000]/20 sm:p-1.5 md:p-2'
      >
        <BsYoutube className='h-4 w-4 text-slate-600 transition-colors duration-200 group-hover:text-[#FF0000] dark:text-slate-400 sm:h-3 sm:w-3 md:h-3 md:w-3 lg:h-4 lg:w-4 xl:w-5 xl:h-5' />
      </Link>
      <Link
        href='https://twitter.com/UnTelevisedLive'
        className='group rounded-lg border border-slate-300/50 bg-slate-200/30 p-1 backdrop-blur-sm transition-all duration-200 hover:border-[#1DA1F2]/50 hover:bg-[#1DA1F2]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#1DA1F2]/20 sm:p-1.5 md:p-2'
      >
        <BsTwitter className='h-4 w-4 text-slate-600 transition-colors duration-200 group-hover:text-[#1DA1F2] dark:text-slate-400 sm:h-3 sm:w-3 md:h-3 md:w-3 lg:h-4 lg:w-4 xl:w-5 xl:h-5' />
      </Link>
      <Link
        href='https://www.twitch.tv/untelevised'
        className='group rounded-lg border border-slate-300/50 bg-slate-200/30 p-1 backdrop-blur-sm transition-all duration-200 hover:border-[#9146FF]/50 hover:bg-[#9146FF]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#9146FF]/20 sm:p-1.5 md:p-2'
      >
        <BsTwitch className='h-4 w-4 text-slate-600 transition-colors duration-200 group-hover:text-[#9146FF] dark:text-slate-400 sm:h-3 sm:w-3 md:h-3 md:w-3 lg:h-4 lg:w-4 xl:w-5 xl:h-5' />
      </Link>
      <Link
        href='https://www.tiktok.com/@radical.edward'
        className='group rounded-lg border border-slate-300/50 bg-slate-200/30 p-1 backdrop-blur-sm transition-all duration-200 hover:border-[#ff0050]/50 hover:bg-[#ff0050]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#ff0050]/20 sm:p-1.5 md:p-2'
      >
        <FaTiktok className='h-4 w-4 text-slate-600 transition-colors duration-200 group-hover:text-[#ff0050] dark:text-slate-400 sm:h-3 sm:w-3 md:h-3 md:w-3 lg:h-4 lg:w-4 xl:w-5 xl:h-5' />
      </Link>
      <Link
        href='https://www.instagram.com/untelevised.media/'
        className='group rounded-lg border border-slate-300/50 bg-slate-200/30 p-1 backdrop-blur-sm transition-all duration-200 hover:border-[#C13584]/50 hover:bg-[#C13584]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#C13584]/20 sm:p-1.5 md:p-2'
      >
        <GrInstagram className='h-4 w-4 text-slate-600 transition-colors duration-200 group-hover:text-[#C13584] dark:text-slate-400 sm:h-3 sm:w-3 md:h-3 md:w-3 lg:h-4 lg:w-4 xl:w-5 xl:h-5' />
      </Link>
      <Link
        href='https://www.threads.com/@untelevised.media'
        target='_blank'
        rel='noopener noreferrer'
        className='group rounded-lg border border-slate-300/50 bg-slate-200/30 p-1 backdrop-blur-sm transition-all duration-200 hover:border-black/50 hover:bg-black/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-white/10 sm:p-1.5 md:p-2'
      >
        <FaThreads className='h-4 w-4 text-slate-600 transition-colors duration-200 group-hover:text-black dark:text-slate-400 dark:group-hover:text-white sm:h-3 sm:w-3 md:h-3 md:w-3 lg:h-4 lg:w-4 xl:h-5 xl:w-5' />
      </Link>
      <Link
        href='https://www.facebook.com/UnTelevisedLive'
        className='group rounded-lg border border-slate-300/50 bg-slate-200/30 p-1 backdrop-blur-sm transition-all duration-200 hover:border-[#1877f2]/50 hover:bg-[#1877f2]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#1877f2]/20 sm:p-1.5 md:p-2'
      >
        <FaFacebookF className='h-4 w-4 text-slate-600 transition-colors duration-200 group-hover:text-[#1877f2] dark:text-slate-400 sm:h-3 sm:w-3 md:h-3 md:w-3 lg:h-4 lg:w-4 xl:w-5 xl:h-5' />
      </Link>
      <Link
        href='https://www.reddit.com/r/UnTelevisedMedia/'
        className='group rounded-lg border border-slate-300/50 bg-slate-200/30 p-1 backdrop-blur-sm transition-all duration-200 hover:border-[#FF5700]/50 hover:bg-[#FF5700]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#FF5700]/20 sm:p-1.5 md:p-2'
      >
        <FaRedditAlien className='h-4 w-4 text-slate-600 transition-colors duration-200 group-hover:text-[#FF5700] dark:text-slate-400 sm:h-3 sm:w-3 md:h-3 md:w-3 lg:h-4 lg:w-4 xl:w-5 xl:h-5' />
      </Link>
      <Link
        href='https://discord.gg/w9vMH5zr6j'
        className='group rounded-lg border border-slate-300/50 bg-slate-200/30 p-1 backdrop-blur-sm transition-all duration-200 hover:border-[#738ADB]/50 hover:bg-[#738ADB]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#738ADB]/20 sm:p-1.5 md:p-2'
      >
        <BsDiscord className='h-4 w-4 text-slate-600 transition-colors duration-200 group-hover:text-[#738ADB] dark:text-slate-400 sm:h-3 sm:w-3 md:h-3 md:w-3 lg:h-4 lg:w-4 xl:w-5 xl:h-5' />
      </Link>
      <Link
        href='https://t.me/UnTelevised_Media'
        target='_blank'
        rel='noopener noreferrer'
        className='group rounded-lg border border-slate-300/50 bg-slate-200/30 p-1 backdrop-blur-sm transition-all duration-200 hover:border-[#2CA5E0]/50 hover:bg-[#2CA5E0]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#2CA5E0]/20 sm:p-1.5 md:p-2'
      >
        <FaTelegram className='h-4 w-4 text-slate-600 transition-colors duration-200 group-hover:text-[#2CA5E0] dark:text-slate-400 sm:h-3 sm:w-3 md:h-3 md:w-3 lg:h-4 lg:w-4 xl:w-5 xl:h-5' />
      </Link>
    </div>
  );
};

export default Socials;
