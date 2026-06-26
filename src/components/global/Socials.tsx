'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { BsDiscord, BsTwitch, BsTwitter, BsYoutube } from 'react-icons/bs';
import { FaFacebookF, FaRedditAlien, FaTelegram, FaTiktok } from 'react-icons/fa';
import { FaThreads } from 'react-icons/fa6';
import { GrInstagram } from 'react-icons/gr';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const SOCIAL_LINKS = [
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@AntiWarTV',
    icon: BsYoutube,
    color: '#FF0000',
    hoverBorder: 'hover:border-[#FF0000]/50',
    hoverBg: 'hover:bg-[#FF0000]/10',
    hoverText: 'group-hover:text-[#FF0000]',
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/UnTelevisedLive',
    icon: BsTwitter,
    color: '#1DA1F2',
    hoverBorder: 'hover:border-[#1DA1F2]/50',
    hoverBg: 'hover:bg-[#1DA1F2]/10',
    hoverText: 'group-hover:text-[#1DA1F2]',
  },
  {
    name: 'Twitch',
    href: 'https://www.twitch.tv/untelevised',
    icon: BsTwitch,
    color: '#9146FF',
    hoverBorder: 'hover:border-[#9146FF]/50',
    hoverBg: 'hover:bg-[#9146FF]/10',
    hoverText: 'group-hover:text-[#9146FF]',
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@radical.edward',
    icon: FaTiktok,
    color: '#ff0050',
    hoverBorder: 'hover:border-[#ff0050]/50',
    hoverBg: 'hover:bg-[#ff0050]/10',
    hoverText: 'group-hover:text-[#ff0050]',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/untelevised.media/',
    icon: GrInstagram,
    color: '#C13584',
    hoverBorder: 'hover:border-[#C13584]/50',
    hoverBg: 'hover:bg-[#C13584]/10',
    hoverText: 'group-hover:text-[#C13584]',
  },
  {
    name: 'Threads',
    href: 'https://www.threads.com/@untelevised.media',
    icon: FaThreads,
    color: '#000000',
    hoverBorder: 'hover:border-black/50',
    hoverBg: 'hover:bg-black/10',
    hoverText: 'group-hover:text-black dark:group-hover:text-white',
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/UnTelevisedLive',
    icon: FaFacebookF,
    color: '#1877f2',
    hoverBorder: 'hover:border-[#1877f2]/50',
    hoverBg: 'hover:bg-[#1877f2]/10',
    hoverText: 'group-hover:text-[#1877f2]',
  },
  {
    name: 'Reddit',
    href: 'https://www.reddit.com/r/UnTelevisedMedia/',
    icon: FaRedditAlien,
    color: '#FF5700',
    hoverBorder: 'hover:border-[#FF5700]/50',
    hoverBg: 'hover:bg-[#FF5700]/10',
    hoverText: 'group-hover:text-[#FF5700]',
  },
  {
    name: 'Discord',
    href: 'https://discord.gg/w9vMH5zr6j',
    icon: BsDiscord,
    color: '#738ADB',
    hoverBorder: 'hover:border-[#738ADB]/50',
    hoverBg: 'hover:bg-[#738ADB]/10',
    hoverText: 'group-hover:text-[#738ADB]',
  },
  {
    name: 'Telegram',
    href: 'https://t.me/UnTelevised_Media',
    icon: FaTelegram,
    color: '#2CA5E0',
    hoverBorder: 'hover:border-[#2CA5E0]/50',
    hoverBg: 'hover:bg-[#2CA5E0]/10',
    hoverText: 'group-hover:text-[#2CA5E0]',
  },
];

function SocialIcon({ link }: { link: (typeof SOCIAL_LINKS)[0] }) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      target='_blank'
      rel='noopener noreferrer'
      className={`group border border-slate-300/50 bg-slate-200/30 p-1 backdrop-blur-sm transition-all duration-200 ${link.hoverBorder} ${link.hoverBg} hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 sm:p-1.5 md:p-2`}
      aria-label={link.name}
    >
      <Icon className={`h-4 w-4 text-slate-600 transition-colors duration-200 ${link.hoverText} dark:text-slate-400 sm:h-3 sm:w-3 md:h-3 md:w-3 lg:h-4 lg:w-4 xl:h-5 xl:w-5`} />
    </Link>
  );
}

function Socials({ dropdown, mobile }: { dropdown?: boolean; mobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (dropdown) {
    return (
      <div className='relative' ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='inline-flex items-center gap-2 border border-slate-300/50 bg-slate-200/30 px-2.5 py-1.5 text-sm font-semibold text-slate-700 backdrop-blur-sm transition-all duration-200 hover:border-untele/50 hover:bg-untele/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:text-slate-200 dark:hover:bg-untele/10 md:px-3 md:py-2'
          aria-label='Follow us'
          aria-expanded={isOpen}
        >
          Follow
          <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className='absolute right-0 top-full z-50 mt-2 grid w-64 grid-cols-5 gap-x-5 gap-y-4 border border-slate-300 bg-white/95 p-5 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95'>
            {SOCIAL_LINKS.map((link) => (
              <div key={link.name} className='flex justify-center'>
                <SocialIcon link={link} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (mobile) {
    return (
      <div className='grid w-full grid-cols-5 gap-2.5'>
        {SOCIAL_LINKS.map((link) => (
          <div key={link.name} className='flex justify-center'>
            <SocialIcon link={link} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='flex items-center gap-1 sm:gap-1.5'>
      {SOCIAL_LINKS.map((link) => (
        <SocialIcon key={link.name} link={link} />
      ))}
    </div>
  );
}

export default Socials;
