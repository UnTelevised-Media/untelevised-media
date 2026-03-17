/* eslint-disable react/function-component-definition */
// src/components/global/Footer.tsx
import Link from 'next/link';
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
import ClientSideRoute from '../providers/ClientSideRoute';

import { sanityFetch } from '@/lib/sanity/lib/live';
import formatTitleForURL from '@/util/formatTitleForURL';
import resolveHref from '@/util/resolveHref';
import { queryCategories, queryPoliciesList } from '@/lib/sanity/lib/queries';

// Types for the specific query results
interface CategoryQueryResult {
  _id: string;
  title: string;
  order: number;
}

interface PolicyQueryResult {
  _id: string;
  title: string;
  order: number;
}

async function Footer() {
  const categories: CategoryQueryResult[] = await getNewsCategories();
  const sortedCategories = categories.sort(
    (a: CategoryQueryResult, b: CategoryQueryResult) => a.order - b.order
  );

  const policies: PolicyQueryResult[] = await getPoliciesList();
  const sortedPolicies = policies.sort(
    (a: PolicyQueryResult, b: PolicyQueryResult) => a.order - b.order
  );

  return (
    <div className='flex flex-col space-y-10 border-t border-border bg-background px-2 py-3'>
      <div className='flex flex-col justify-between space-y-2 px-12 md:flex-row md:space-x-6 md:space-y-0'>
        {/* News Sections & About  */}
        <h4 className='pb-2 text-lg font-semibold text-foreground underline md:hidden'>
          News Categories
        </h4>
        <div className='flex flex-wrap space-x-3 text-muted-foreground md:flex-col md:space-x-0'>
          <h4 className='hidden pb-2 text-xl font-semibold text-foreground underline md:flex'>
            News Categories
          </h4>
          {sortedCategories
            // .sort((a, b) => a.order - b.order)
            .map((category: CategoryQueryResult) => (
              <ClientSideRoute
                route={resolveHref('category', formatTitleForURL(category.title)) ?? ''}
                key={category._id}
              >
                {category.title}
              </ClientSideRoute>
            ))}
        </div>

        {/* Music Section */}
        <div className='flex flex-wrap space-x-3 text-muted-foreground md:flex-col md:space-x-0'>
          <h4 className='pb-2 text-lg font-semibold text-foreground underline md:text-xl'>
            Music & Artists
          </h4>
          <ClientSideRoute route='/lyrics'>Music & Lyrics</ClientSideRoute>
          <ClientSideRoute route='/music-artists'>Featured Artists</ClientSideRoute>
        </div>

        {/* Media */}
        <h4 className='pb-2 text-lg font-semibold text-foreground underline md:hidden'>Media</h4>
        <div className='flex flex-wrap space-x-3 text-muted-foreground md:flex-col md:space-x-0'>
          <h4 className='hidden pb-2 text-xl font-semibold text-foreground underline md:flex'>
            Media
          </h4>
          <Link href='/'>Photo</Link>
          <Link href='/'>Video</Link>
          <Link href='/'>Investigations</Link>
          <Link href='/'>RSS</Link>
        </div>

        {/* Social Links */}
        <h4 className='pb-2 text-lg font-semibold text-foreground underline md:hidden'>
          Social Media Platforms
        </h4>
        <div className='flex flex-wrap space-x-3 text-muted-foreground md:flex-col md:space-x-0'>
          <h4 className='hidden pb-2 text-xl font-semibold text-foreground underline md:flex'>
            Social Media Platforms
          </h4>
          <Link
            className='flex items-center gap-x-2'
            href='https://www.youtube.com/@AntiWarTV'
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
            href='https://www.tiktok.com/@radical.edward'
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
        <h4 className='pb-2 text-lg font-semibold text-foreground underline md:hidden'>
          Policies
        </h4>
        <div className='flex flex-row flex-wrap space-x-3 text-muted-foreground md:flex-col md:space-x-0'>
          <h4 className='hidden pb-2 text-xl font-semibold text-foreground underline md:flex'>
            Policies
          </h4>
          {sortedPolicies.map((policy: PolicyQueryResult) => (
            <ClientSideRoute
              route={resolveHref('policies', formatTitleForURL(policy.title)) ?? ''}
              key={policy._id}
            >
              {policy.title}
            </ClientSideRoute>
          ))}
        </div>

        {/* About */}
        <h4 className='pb-2 text-lg font-semibold text-foreground underline md:hidden'>About</h4>
        <div className='flex flex-wrap space-x-3 text-muted-foreground md:flex-col md:space-x-0'>
          <h4 className='hidden pb-2 text-xl font-semibold text-foreground underline md:flex'>
            About
          </h4>
          <Link href='/about'>About UnTelevised</Link>
          <Link href='/editorial-standards'>Editorial Standards</Link>
          <Link href='/staff'>Meet Our Staff</Link>
          <Link href='/careers'>Careers / Join Our Team</Link>
          <Link href='/donate'>Donate/Support Our Outlet</Link>
          <Link href='mailto:newsroom@untelevised.media'>Contact the Newsroom</Link>
          <Link href='mailto:newsroom@untelevised.media'>Licensing & Syndication</Link>
          <Link href='mailto:newsroom@untelevised.media'>Advertise</Link>
          <Link href='mailto:newsroom@untelevised.media'>Send a News Tip</Link>
          <Link href='mailto:newsroom@untelevised.media'>Request a Correction</Link>
        </div>
      </div>

      {/* Copywrite Notice */}
      <div className='flex justify-between'>
        {/* Copywrite  */}
        <p className='text-sm font-light text-foreground'>
          © Copyright 2023 UnTelevised Media™ All Rights Reserved.
        </p>
        <p className='text-sm font-extralight text-muted-foreground'>
          1156 Humboldt St, Denver, CO 80218
        </p>
      </div>
    </div>
  );
}

export default Footer;

// Call the Sanity Fetch Function for a list of All Policies
async function getPoliciesList(): Promise<PolicyQueryResult[]> {
  try {
    // Fetch policy data from Sanity
    const { data: policies } = await sanityFetch({
      query: queryPoliciesList,
      tags: ['policies'],
    });
    return policies;
  } catch (error) {
    console.error('Failed to fetch policies:', error);
    return [];
  }
}

// Call the Sanity Fetch Function for a list of All Categories
async function getNewsCategories(): Promise<CategoryQueryResult[]> {
  try {
    // Fetch category data from Sanity
    const { data: categories } = await sanityFetch({
      query: queryCategories,
      tags: ['category'],
    });
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}
