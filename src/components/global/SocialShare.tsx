'use client';
import React from 'react';
import {
  FaFacebookSquare,
  FaFacebookMessenger,
  FaTwitterSquare,
  FaRedditSquare,
  FaLinkedin,
  FaTelegram,
  FaWhatsappSquare,
  FaSms,
  FaCopy,
  FaPinterestSquare,
  FaMastodon,
  FaTumblrSquare,
  FaFlipboard,
} from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

interface SocialShareProps {
  url: string;
  title: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ url, title }) => {
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error('Failed to copy URL to clipboard:', err);
    }
  };

  return (
    <div className='w-full py-3'>
      {/* Header */}
      <div className='mb-2 flex items-center justify-center space-x-3'>
        <div className='h-0.5 w-8 bg-gradient-to-r from-transparent to-untele' />
        <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Share Article</h3>
        <div className='h-0.5 w-8 bg-gradient-to-l from-transparent to-untele' />
      </div>

      {/* Social Icons */}
      <div className='flex flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-300/50 bg-gradient-to-r from-slate-100/80 to-slate-200/80 p-3 backdrop-blur-sm dark:border-slate-600/50 dark:from-slate-800/80 dark:to-slate-700/80'>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://www.facebook.com/dialog/share?app_id=352985163722798&display=popup&href=${encodeURIComponent(url)}`}
          aria-label='Share on Facebook'
          className='group relative rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 backdrop-blur-sm transition-all duration-200 hover:border-[#1877f2]/50 hover:bg-[#1877f2]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#1877f2]/20'
        >
          <FaFacebookSquare className='h-6 w-6 text-slate-600 transition-colors duration-200 group-hover:text-[#1877f2] dark:text-slate-400' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=352985163722798&redirect_uri=${encodeURIComponent(url)}`}
          aria-label='Share via Facebook Messenger'
          className='group relative rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 backdrop-blur-sm transition-all duration-200 hover:border-[#1877f2]/50 hover:bg-[#1877f2]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#1877f2]/20'
        >
          <FaFacebookMessenger className='h-6 w-6 text-slate-600 transition-colors duration-200 group-hover:text-[#1877f2] dark:text-slate-400' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
          aria-label='Share on Twitter'
          className='group relative rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 backdrop-blur-sm transition-all duration-200 hover:border-[#1da1f2]/50 hover:bg-[#1da1f2]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#1da1f2]/20'
        >
          <FaTwitterSquare className='h-6 w-6 text-slate-600 transition-colors duration-200 group-hover:text-[#1da1f2] dark:text-slate-400' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://mastodonshare.com/?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
          aria-label='Share on Mastodon'
          className='group relative rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 backdrop-blur-sm transition-all duration-200 hover:border-[#6364ff]/50 hover:bg-[#6364ff]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#6364ff]/20'
        >
          <FaMastodon className='h-6 w-6 text-slate-600 transition-colors duration-200 group-hover:text-[#6364ff] dark:text-slate-400' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
          aria-label='Share on Reddit'
          className='group relative rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 backdrop-blur-sm transition-all duration-200 hover:border-[#ff4500]/50 hover:bg-[#ff4500]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#ff4500]/20'
        >
          <FaRedditSquare className='h-6 w-6 text-slate-600 transition-colors duration-200 group-hover:text-[#ff4500] dark:text-slate-400' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          aria-label='Share on LinkedIn'
          className='group relative rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 backdrop-blur-sm transition-all duration-200 hover:border-[#0a66c2]/50 hover:bg-[#0a66c2]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#0a66c2]/20'
        >
          <FaLinkedin className='h-6 w-6 text-slate-600 transition-colors duration-200 group-hover:text-[#0a66c2] dark:text-slate-400' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://www.pinterest.com/pin/create/bookmarklet/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}&media=`}
          aria-label='Share on Pinterest'
          className='group relative rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 backdrop-blur-sm transition-all duration-200 hover:border-[#bd081c]/50 hover:bg-[#bd081c]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#bd081c]/20'
        >
          <FaPinterestSquare className='h-6 w-6 text-slate-600 transition-colors duration-200 group-hover:text-[#bd081c] dark:text-slate-400' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`http://tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
          aria-label='Share on Tumblr'
          className='group relative rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 backdrop-blur-sm transition-all duration-200 hover:border-[#35465d]/50 hover:bg-[#35465d]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#35465d]/20'
        >
          <FaTumblrSquare className='h-6 w-6 text-slate-600 transition-colors duration-200 group-hover:text-[#35465d] dark:text-slate-400' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://share.flipboard.com/bookmarklet/popout?v=2&title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
          aria-label='Share on Flipboard'
          className='group relative rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 backdrop-blur-sm transition-all duration-200 hover:border-[#e12828]/50 hover:bg-[#e12828]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#e12828]/20'
        >
          <FaFlipboard className='h-6 w-6 text-slate-600 transition-colors duration-200 group-hover:text-[#e12828] dark:text-slate-400' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
          aria-label='Share on Telegram'
          className='group relative rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 backdrop-blur-sm transition-all duration-200 hover:border-[#0088cc]/50 hover:bg-[#0088cc]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#0088cc]/20'
        >
          <FaTelegram className='h-6 w-6 text-slate-600 transition-colors duration-200 group-hover:text-[#0088cc] dark:text-slate-400' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://api.whatsapp.com/send/?text=${encodeURIComponent(`${title} ${url}`)}`}
          aria-label='Share on WhatsApp'
          className='group relative rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 backdrop-blur-sm transition-all duration-200 hover:border-[#25d366]/50 hover:bg-[#25d366]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#25d366]/20'
        >
          <FaWhatsappSquare className='h-6 w-6 text-slate-600 transition-colors duration-200 group-hover:text-[#25d366] dark:text-slate-400' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`sms:?body=${encodeURIComponent(`${title} ${url}`)}`}
          aria-label='Share via SMS'
          className='group relative rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 backdrop-blur-sm transition-all duration-200 hover:border-[#a4c639]/50 hover:bg-[#a4c639]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#a4c639]/20'
        >
          <FaSms className='h-6 w-6 text-slate-600 transition-colors duration-200 group-hover:text-[#a4c639] dark:text-slate-400' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
          aria-label='Share via Email'
          className='group relative rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 backdrop-blur-sm transition-all duration-200 hover:border-[#7c8ba4]/50 hover:bg-[#7c8ba4]/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-[#7c8ba4]/20'
        >
          <MdEmail className='h-6 w-6 text-slate-600 transition-colors duration-200 group-hover:text-[#7c8ba4] dark:text-slate-400' />
        </a>
        <button
          onClick={handleCopyToClipboard}
          aria-label='Copy URL to clipboard'
          type='button'
          className='group relative rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 backdrop-blur-sm transition-all duration-200 hover:border-untele/50 hover:bg-untele/10 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30 dark:hover:bg-untele/20'
        >
          <FaCopy className='h-6 w-6 text-slate-600 transition-colors duration-200 group-hover:text-untele dark:text-slate-400' />
        </button>
      </div>
    </div>
  );
};

export default SocialShare;
