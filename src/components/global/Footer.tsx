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
  FaTelegram,
} from 'react-icons/fa';
import { FaThreads } from 'react-icons/fa6';
import { MdLiveTv } from 'react-icons/md';
import { RiKickLine } from 'react-icons/ri';
import ClientSideRoute from '../providers/ClientSideRoute';
import formatTitleForURL from '@/util/url/formatTitleForURL';
import resolveHref from '@/util/url/resolveHref';
import { getNewsCategories, getPoliciesList, type CategoryQueryResult, type PolicyQueryResult } from '@/server/queries/content';

async function Footer() {
  const categories: CategoryQueryResult[] = await getNewsCategories();
  const sortedCategories = categories.sort(
    (a: CategoryQueryResult, b: CategoryQueryResult) => (a.order ?? 0) - (b.order ?? 0)
  );

  const policies: PolicyQueryResult[] = await getPoliciesList();
  const sortedPolicies = policies.sort(
    (a: PolicyQueryResult, b: PolicyQueryResult) => (a.order ?? 0) - (b.order ?? 0)
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

        {/* Bookstore + Music — shared column on desktop */}
        <div className='flex flex-col gap-6'>
          {/* Bookstore */}
          <div className='flex flex-wrap space-x-3 text-muted-foreground md:flex-col md:space-x-0'>
            <h4 className='pb-2 text-lg font-semibold text-foreground underline md:text-xl'>
              Bookstore
            </h4>
            <Link href='/bookstore'>Hurriya Publications</Link>
            <Link href='/bookstore/about'>Our Story</Link>
            <Link href='/bookstore/wishlist'>Wishlist</Link>
            <Link href='/bookstore/orders'>My Orders</Link>
            <Link href='/bookstore/downloads'>Download Vault</Link>
            <Link href='/bookstore/returns'>Returns &amp; Refunds</Link>
            <Link href='/secure-contact'>Publish With Us</Link>
          </div>

          {/* Music Section */}
          <div className='flex flex-wrap space-x-3 text-muted-foreground md:flex-col md:space-x-0'>
            <h4 className='pb-2 text-lg font-semibold text-foreground underline md:text-xl'>
              Music & Artists
            </h4>
            <ClientSideRoute route='/lyrics'>Music & Lyrics</ClientSideRoute>
            <ClientSideRoute route='/music-artists'>Featured Artists</ClientSideRoute>
          </div>
        </div>

        {/* Media */}
        <h4 className='pb-2 text-lg font-semibold text-foreground underline md:hidden'>Media</h4>
        <div className='flex flex-wrap space-x-3 text-muted-foreground md:flex-col md:space-x-0'>
          <h4 className='hidden pb-2 text-xl font-semibold text-foreground underline md:flex'>
            Media
          </h4>
          <Link href='/search'>Search Articles</Link>
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
            href='https://t.me/UnTelevised_Media'
            target='_blank'
          >
            <FaTelegram className='h-4 w-4' />
            Telegram
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
          <Link href='/support'>Support Our Outlet</Link>
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
