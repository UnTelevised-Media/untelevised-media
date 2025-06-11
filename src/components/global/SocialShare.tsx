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
    <div className='mx-auto flex w-full justify-center py-3'>
      <h3 className='text-untele mr-3 hidden items-center justify-center text-xl font-semibold md:flex'>
        Share On |
      </h3>
      <div className='flex flex-wrap items-center justify-center space-x-2 rounded-md bg-slate-300 px-4 py-2'>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://www.facebook.com/dialog/share?app_id=352985163722798&display=popup&href=${encodeURIComponent(url)}`}
          aria-label='Share on Facebook'
        >
          <FaFacebookSquare className='h-auto w-12 text-[#1877f2]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=352985163722798&redirect_uri=${encodeURIComponent(url)}`}
          aria-label='Share via Facebook Messenger'
        >
          <FaFacebookMessenger className='h-auto w-12 text-[#1877f2]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
          aria-label='Share on Twitter'
        >
          <FaTwitterSquare className='h-auto w-12 text-[#1da1f2]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://mastodonshare.com/?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
          aria-label='Share on Mastodon'
        >
          <FaMastodon className='h-auto w-12 text-[#6364ff]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
          aria-label='Share on Reddit'
        >
          <FaRedditSquare className='h-auto w-12 text-[#ff4500]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          aria-label='Share on LinkedIn'
        >
          <FaLinkedin className='h-auto w-12 text-[#0a66c2]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://www.pinterest.com/pin/create/bookmarklet/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}&media=`}
          aria-label='Share on Pinterest'
        >
          <FaPinterestSquare className='h-auto w-12 text-[#bd081c]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`http://tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
          aria-label='Share on Tumblr'
        >
          <FaTumblrSquare className='h-auto w-12 text-[#35465d]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://share.flipboard.com/bookmarklet/popout?v=2&title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
          aria-label='Share on Flipboard'
        >
          <FaFlipboard className='h-auto w-12 text-[#e12828]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
          aria-label='Share on Telegram'
        >
          <FaTelegram className='h-auto w-12 text-[#0088cc]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://api.whatsapp.com/send/?text=${encodeURIComponent(`${title} ${url}`)}`}
          aria-label='Share on WhatsApp'
        >
          <FaWhatsappSquare className='h-auto w-12 text-[#25d366]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`sms:?body=${encodeURIComponent(`${title} ${url}`)}`}
          aria-label='Share via SMS'
        >
          <FaSms className='h-auto w-12 text-[#a4c639]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
          aria-label='Share via Email'
        >
          <MdEmail className='h-auto w-12 text-[#7c8ba4]' />
        </a>
        <button onClick={handleCopyToClipboard} aria-label='Copy URL to clipboard' type='button'>
          <FaCopy className='h-auto w-10 text-[#9370d5]' />
        </button>
      </div>
    </div>
  );
};

export default SocialShare;
