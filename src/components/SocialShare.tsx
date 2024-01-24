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

const SocialShare = ({ url, title }) => {
  return (
    <div className='mx-auto flex w-full justify-center py-3'>
      <h3 className='mr-3 hidden items-center justify-center text-xl font-semibold text-untele md:flex'>
        Share On |
      </h3>
      <div className='flex flex-wrap items-center justify-center space-x-2 rounded-md bg-slate-300 px-4 py-2'>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://www.facebook.com/dialog/share?app_id=352985163722798&display=popup&href=${url}`}
        >
          <FaFacebookSquare className='h-auto w-12  text-[#1877f2]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://www.facebook.com/dialog/send?link=${url}&app_id=352985163722798&redirect_uri=${url}`}
        >
          <FaFacebookMessenger className='h-auto w-12  text-[#1877f2]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://twitter.com/intent/tweet?url=${url}`}
        >
          <FaTwitterSquare className='h-auto w-12  text-[#1da1f2]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://mastodonshare.com/?text=${title}&url=${url}`}
        >
          <FaMastodon className='h-auto w-12  text-[#6364ff]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://www.reddit.com/submit?url=${url}&title=${title}`}
        >
          <FaRedditSquare className='h-auto w-12  text-[#ff4500]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}
        >
          <FaLinkedin className='h-auto w-12  text-[#0a66c2]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://www.pinterest.com/pin/create/bookmarklet/?url=${url}&description=${title}media=''`}
        >
          <FaPinterestSquare className='h-auto w-12  text-[#bd081c]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`http://tumblr.com/widgets/share/tool?canonicalUrl=${url}`}
        >
          <FaTumblrSquare className='h-auto w-12  text-[#35465d]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://share.flipboard.com/bookmarklet/popout?v=2&title=${title}&url=${url}`}
        >
          <FaFlipboard className='h-auto w-12  text-[#e12828]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://t.me/share/url?url=${url}&text=${title}`}
        >
          <FaTelegram className='h-auto w-12  text-[#0088cc]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`https://api.whatsapp.com/send/?text=${url}`}
        >
          <FaWhatsappSquare className='h-auto w-12  text-[#25d366]' />
        </a>
        <a rel='noreferrer' target='_blank' href={`sms:body=${url}`}>
          <FaSms className='h-auto w-12  text-[#a4c639]' />
        </a>
        <a
          rel='noreferrer'
          target='_blank'
          href={`mailto:?subject=${title}&body=${url}`}
        >
          <MdEmail className='h-auto w-12  text-[#7c8ba4]' />
        </a>
        <button onClick={() => navigator.clipboard.writeText(url)}>
          <FaCopy className='h-auto w-10  text-[#9370d5]' />
        </button>
      </div>
    </div>
  );
};

export default SocialShare;
