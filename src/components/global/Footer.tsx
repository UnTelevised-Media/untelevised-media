import Link from 'next/link';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import {
  FaYoutube,
  FaTwitch,
  FaTiktok,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaReddit,
  FaDiscord,
} from 'react-icons/fa';
import { FaThreads } from 'react-icons/fa6';
import { MdLiveTv } from 'react-icons/md';
import { RiKickLine } from 'react-icons/ri';
import ClientSideRoute from '../ClientSideRoute';

const categoryQuery = groq`
  *[_type == "category"] {
    _id,
    title,
    order
  }  
`;

const policyQuery = groq`
  *[_type == "policies"] {
    _id,
    title,
    order
  }  
`;

async function Footer() {
  const categories: any = await client.fetch(categoryQuery);
  const formatCategoryTitle = (title) => {
    // Convert to lowercase
    let formattedTitle = title.toLowerCase();

    // Remove symbols and spaces, and replace them with a dash
    formattedTitle = formattedTitle.replace(/[^a-z0-9]+/g, '-');

    return formattedTitle;
  };

  const policies: any = await client.fetch(policyQuery);
  const formatPolicyTitle = (title) => {
    // Convert to lowercase
    let formattedName = title.toLowerCase();

    // Remove symbols and spaces, and replace them with a dash
    formattedName = formattedName.replace(/[^a-z0-9]+/g, '-');

    return formattedName;
  };

  return (
    <div className='flex flex-col space-y-10 bg-slate-600 px-2 py-3'>
      <div className='flex justify-between space-y-2 px-12 flex-col md:flex-row md:space-x-6 md:space-y-0'>
        {/* News Sections & About  */}
        <h4 className='pb-2 text-lg font-semibold text-slate-950 underline md:hidden'>
          News Categories
        </h4>
        <div className='flex flex-wrap space-x-3 text-slate-900 md:flex-col md:space-x-0'>
          <h4 className='hidden pb-2 text-xl font-semibold text-slate-950 underline md:flex'>
            News Categories
          </h4>
          {categories
            .sort((a, b) => a.order - b.order)
            .map((category) => (
              <ClientSideRoute
                route={`/category/${formatCategoryTitle(category.title)}`}
                key={category._id}
              >
                {category.title}
              </ClientSideRoute>
            ))}
        </div>

        {/* Media */}
        <h4 className='pb-2 text-lg font-semibold text-slate-950 underline md:hidden'>
          Media
        </h4>
        <div className='flex flex-wrap space-x-3 text-slate-900 md:flex-col md:space-x-0'>
          <h4 className='hidden pb-2 text-xl font-semibold text-slate-950 underline md:flex'>
            Media
          </h4>
          <Link href='/'>Photo</Link>
          <Link href='/'>Video</Link>
          <Link href='/'>Investigations</Link>
          <Link href='/'>RSS</Link>
        </div>

        {/* Social Links */}
        <h4 className='pb-2 text-lg font-semibold text-slate-950 underline md:hidden'>
          Social Media Platforms
        </h4>
        <div className='flex flex-wrap space-x-3 text-slate-900 md:flex-col md:space-x-0'>
          <h4 className='hidden pb-2 text-xl font-semibold text-slate-950 underline md:flex'>
            Social Media Platforms
          </h4>
          <Link
            className='flex items-center gap-x-2'
            href='https://www.youtube.com/@UnTelevised'
            target='_blank'
          >
            <FaYoutube className='h-4 w-4' />
            Youtube
          </Link>
          <Link
            className='flex items-center gap-x-2'
            href='https://www.twitch.tv/untelevised'
            target='_blank'
          >
            <FaTwitch className='h-4 w-4' />
            Twitch
          </Link>
          <Link
            className='flex items-center gap-x-2'
            href='https://www.tiktok.com/@untelevisedmedia'
            target='_blank'
          >
            <FaTiktok className='h-4 w-4' />
            TikTok
          </Link>
          <Link
            className='flex items-center gap-x-2'
            href='https://twitter.com/UnTelevisedLive'
            target='_blank'
          >
            <FaTwitter className='h-4 w-4' />
            Twitter/X
          </Link>
          <Link
            className='flex items-center gap-x-2'
            href='https://www.threads.net/@untelevised.media'
            target='_blank'
          >
            <FaThreads className='h-4 w-4' />
            Threads
          </Link>
          <Link
            className='flex items-center gap-x-2'
            href='https://www.facebook.com/UnTelevisedLive'
            target='_blank'
          >
            <FaFacebook className='h-4 w-4' />
            Facebook
          </Link>
          <Link
            className='flex items-center gap-x-2'
            href='https://www.instagram.com/untelevised.media/'
            target='_blank'
          >
            <FaInstagram className='h-4 w-4' />
            Instagram
          </Link>
          <Link
            className='flex items-center gap-x-2'
            href='https://www.reddit.com/r/UnTelevisedMedia/'
            target='_blank'
          >
            <FaReddit className='h-4 w-4' />
            Reddit
          </Link>
          <Link
            className='flex items-center gap-x-2'
            href='https://discord.gg/w9vMH5zr6j'
            target='_blank'
          >
            <FaDiscord className='h-4 w-4' />
            Discord
          </Link>
          <Link
            className='flex items-center gap-x-2'
            href='https://dlive.tv/UnTelevised'
            target='_blank'
          >
            <MdLiveTv className='h-4 w-4' />
            D-Live
          </Link>
          <Link
            className='flex items-center gap-x-2'
            href='https://kick.com/untelevised'
            target='_blank'
          >
            <RiKickLine className='h-4 w-4' />
            Kick
          </Link>
        </div>

        {/* Principles & Policies  */}
        <h4 className='pb-2 text-lg font-semibold text-slate-950 underline md:hidden'>
          Policies
        </h4>
        <div className='flex flex-row flex-wrap space-x-3 text-slate-900 md:flex-col md:space-x-0'>
          <h4 className='hidden pb-2 text-xl font-semibold text-slate-950 underline md:flex'>
            Policies
          </h4>
          {policies
            .sort((a, b) => a.order - b.order)
            .map((policy) => (
              <ClientSideRoute
                route={`/policies/${formatPolicyTitle(policy.title)}`}
                key={policy._id}
              >
                {policy.title}
              </ClientSideRoute>
            ))}
        </div>

        {/* About */}
        <h4 className='pb-2 text-lg font-semibold text-slate-950 underline md:hidden'>
          About
        </h4>
        <div className='flex flex-wrap space-x-3 text-slate-900 md:flex-col md:space-x-0'>
          <h4 className='hidden pb-2 text-xl font-semibold text-slate-950 underline md:flex'>
            About
          </h4>
          <Link href='/'>About UnTelevised</Link>
          <Link href='/'>Meet Our Staff</Link>
          <Link href='/'>Join Our Team</Link>
          <Link href='/donate'>Donate/Support Our Outlet</Link>
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
        <p className='text-sm font-light text-slate-950'>
          © Copyright 2023 UnTelevised Media™ All Rights Reserved.
        </p>
      </div>
    </div>
  );
}

export default Footer;
