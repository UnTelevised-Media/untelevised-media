import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    // Footer
    <div className='flex flex-col space-y-10 bg-slate-600 px-2 py-3'>
      <div className='flex flex-row space-x-6 justify-between px-12'>
        {/* News Sections & About  */}
        <div className='flex flex-col'>
          <p className='text-slate-950'>News Categories</p>
        </div>

        {/* Media */}
        <div className='flex flex-col'>
          <p className='text-slate-950'>Media</p>
          <Link href='/'>Photo</Link>
          <Link href='/'>Video</Link>
          <Link href='/'>Investigations</Link>
          <Link href='/'>RSS</Link>
        </div>
        {/* Social Links */}
        <div className='flex flex-col'>
          <p className='text-slate-950'>Social Links</p>
          <Link href='/'>Youtube</Link>
          <Link href='/'>Twitch</Link>
          <Link href='/'>TikTok</Link>
          <Link href='/'>Twitter/X</Link>
          <Link href='/'>Threads</Link>
          <Link href='/'>Facebook</Link>
          <Link href='/'>Instagram</Link>
          <Link href='/'>Reddit</Link>
          <Link href='/'>Discord</Link>
          <Link href='/'>D-Live</Link>
          <Link href='/'>Kick</Link>
        </div>
        {/* Principles & Policies  */}
        <div className='flex flex-col'>
          <p className='text-slate-950'>Principles & Policies</p>
          <Link href='/'>Terms of Service</Link>
          <Link href='/'>Licensing Terms</Link>
          <Link href='/'>Privacy Policy</Link>
          <Link href='/'>Cookie Settings</Link>
          <Link href='/'>RSS Terms of Service</Link>
          <Link href='/'>Ad Choices</Link>
          <Link href='/'>Discussion Policy</Link>
          <Link href='/'>Submissions Policy</Link>
        </div>
        {/* About */}
        <div className='flex flex-col'>
          <p className='text-slate-950'>About</p>
          <Link href='/'>About UnTelevised</Link>
          <Link href='/'>Meet Our Staff</Link>
          <Link href='/'>Join Our Team</Link>
          <Link href='/'>Contact the Newsroom</Link>
          <Link href='/'>Licensing & Syndication</Link>
          <Link href='/'>Advertise</Link>
          <Link href='/'>Send a News Tip</Link>
          <Link href='/'>Request a Correction</Link>
        </div>
      </div>

      {/* Copywrite Notice */}
      <div className='flex'>
        {/* Copywrite  */}
        <p className=''>
          © Copyright 2023 UnTelevised Media™ All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
