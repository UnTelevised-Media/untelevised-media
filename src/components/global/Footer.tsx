// src/components/global/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import { BsDiscord, BsTwitch, BsTwitter, BsYoutube } from 'react-icons/bs';
import { FaFacebookF, FaRedditAlien, FaTelegram, FaTiktok } from 'react-icons/fa';
import { FaThreads } from 'react-icons/fa6';
import { GrInstagram } from 'react-icons/gr';
import { MdLiveTv } from 'react-icons/md';
import { RiKickLine } from 'react-icons/ri';
import { LuMap, LuRss } from 'react-icons/lu';
import ClientSideRoute from '../providers/ClientSideRoute';
import CategoryBadges from './CategoryBadges';
import formatTitleForURL from '@/util/url/formatTitleForURL';
import resolveHref from '@/util/url/resolveHref';
import {
  getNewsCategories,
  getPoliciesList,
  type CategoryQueryResult,
  type PolicyQueryResult,
} from '@/server/queries/content';

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
    href: 'https://www.threads.net/@untelevised.media',
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
  {
    name: 'D-Live',
    href: 'https://dlive.tv/UnTelevised',
    icon: MdLiveTv,
    color: '#4CAF50',
    hoverBorder: 'hover:border-[#4CAF50]/50',
    hoverBg: 'hover:bg-[#4CAF50]/10',
    hoverText: 'group-hover:text-[#4CAF50]',
  },
  {
    name: 'Kick',
    href: 'https://kick.com/untelevised',
    icon: RiKickLine,
    color: '#10B981',
    hoverBorder: 'hover:border-[#10B981]/50',
    hoverBg: 'hover:bg-[#10B981]/10',
    hoverText: 'group-hover:text-[#10B981]',
  },
];

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
    <div className='border-t border-border bg-background'>
      {/* Main Footer Content */}
      <div className='space-y-8 px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid gap-12 lg:grid-cols-4'>
          {/* Left Sidebar - Logo & Mission */}
          <div className='flex flex-col space-y-4 lg:pr-6'>
            <div className='flex items-center gap-3'>
              <Image
                src='/Logo.webp'
                alt='UnTelevised Media'
                width={48}
                height={48}
                className='flex-shrink-0'
                unoptimized
              />
              <div>
                <h3 className='text-sm font-semibold text-foreground'>UnTelevised Media</h3>
                <p className='text-xs text-muted-foreground'>Independent Journalism</p>
              </div>
            </div>

            <p className='text-xs leading-relaxed text-muted-foreground'>
              Unfiltered, uncensored, and uncompromising coverage of the stories that matter.
            </p>

            {/* Social Icons - Match header styling exactly */}
            <div className='flex flex-wrap gap-2'>
              {SOCIAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={`group border border-slate-300/50 bg-slate-200/30 p-2 backdrop-blur-sm transition-all duration-200 ${link.hoverBorder} ${link.hoverBg} hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/30`}
                    aria-label={link.name}
                  >
                    <Icon
                      className={`h-4 w-4 text-slate-600 transition-colors duration-200 ${link.hoverText} dark:text-slate-400`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Categories as Badges */}
            <CategoryBadges categories={sortedCategories} />
          </div>

          {/* Platform Column */}
          <div className='flex flex-col space-y-3'>
            <h4 className='text-xs font-bold uppercase tracking-wider text-foreground'>
              Platform
            </h4>
            <div className='flex flex-col space-y-2'>
              <h5 className='text-xs font-bold text-muted-foreground underline'>News</h5>

              <Link
                href='/'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                News Articles
              </Link>
              <Link
                href='/breaking'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Breaking
              </Link>
              <Link
                href='/archive'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Archive
              </Link>
              <Link
                href='/fact-check'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Fact Check
              </Link>
              <Link
                href='/search'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Search Articles
              </Link>
              <Link
                href='https://untelevised.live/'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Live TV
              </Link>
              <Link
                href='https://radio.untelevised.live/'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Radio
              </Link>
              <div className='flex gap-3 pt-2'>
                <Link
                  href='/sitemap.xml'
                  className='flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'
                >
                  <LuMap className='h-3.5 w-3.5' />
                  Sitemap
                </Link>
                <Link
                  href='/feed.xml'
                  className='flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'
                >
                  <LuRss className='h-3.5 w-3.5' />
                  RSS
                </Link>
              </div>
            </div>

            <div className='flex flex-col space-y-2 border-t border-border pt-3'>
              <h5 className='text-xs font-bold text-muted-foreground underline'>Bookstore</h5>
              <Link
                href='/bookstore'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Hurriya Publications
              </Link>
              <Link
                href='/bookstore/about'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Our Story
              </Link>
              <Link
                href='/bookstore/wishlist'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Wishlist
              </Link>
              <Link
                href='/bookstore/orders'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                My Orders
              </Link>
              <Link
                href='/bookstore/downloads'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Download Vault
              </Link>
              <Link
                href='/bookstore/returns'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Returns &amp; Refunds
              </Link>
              <Link
                href='/secure-contact'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Publish With Us
              </Link>
            </div>

            <div className='flex flex-col space-y-2 border-t border-border pt-3'>
              <h5 className='text-xs font-bold text-muted-foreground underline'>Music</h5>
              <Link
                href='/lyrics'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Music &amp; Lyrics
              </Link>
              <Link
                href='/music-artists'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Featured Artists
              </Link>
            </div>
          </div>

          {/* Community Column */}
          <div className='flex flex-col space-y-3'>
            <h4 className='text-xs font-bold uppercase tracking-wider text-foreground'>
              Community
            </h4>
            <div className='flex flex-col space-y-2'>
              <h5 className='text-xs font-bold text-muted-foreground underline'>About</h5>
              <Link
                href='/about'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                About UnTelevised
              </Link>
              <Link
                href='/editorial-standards'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Editorial Standards
              </Link>
              <Link
                href='/staff'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Meet Our Staff
              </Link>
            </div>

            <div className='flex flex-col space-y-2 border-t border-border pt-3'>
              <h5 className='text-xs font-bold text-muted-foreground underline'>
                Support UnTelevised Media
              </h5>
              <Link
                href='/support'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Support Our Outlet
              </Link>
              <Link
                href='/support/#member'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Become a Member
              </Link>
              <Link
                href='/careers'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Careers / Join Our Team
              </Link>
            </div>

            <div className='flex flex-col space-y-2 border-t border-border pt-3'>
              <h4 className='text-xs font-bold uppercase tracking-wider text-foreground'>Newsroom</h4>
              <h5 className='text-xs font-bold text-muted-foreground underline'>Newsroom</h5>
              <Link
                href='mailto:newsroom@untelevised.media'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Contact Newsroom
              </Link>
              <Link
                href='mailto:newsroom@untelevised.media'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Send a News Tip
              </Link>
              <Link
                href='mailto:newsroom@untelevised.media'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Request a Correction
              </Link>
            </div>

            <div className='flex flex-col space-y-2 border-t border-border pt-3'>
              <h5 className='text-xs font-bold text-muted-foreground underline'>Secure Portals</h5>
              <Link
                href='mailto:newsroom@untelevised.media'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Secure Contact
              </Link>
              <Link
                href='mailto:newsroom@untelevised.media'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Whistleblower Portal
              </Link>
            </div>

            <div className='flex flex-col space-y-2 border-t border-border pt-3'>
              <h5 className='text-xs font-bold text-muted-foreground underline'>Contact</h5>
              <Link
                href='mailto:newsroom@untelevised.media'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Get Help
              </Link>
              <Link
                href='mailto:newsroom@untelevised.media'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Report a Vulnerability
              </Link>
              <Link
                href='mailto:newsroom@untelevised.media'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Partnerships
              </Link>
              <Link
                href='mailto:newsroom@untelevised.media'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Advertise With Us
              </Link>
            </div>
          </div>

          {/* Media + Syndication Column */}
          <div className='flex flex-col space-y-3'>
            <h4 className='text-xs font-bold uppercase tracking-wider text-foreground'>Media</h4>
            <div className='flex flex-col space-y-2'>
              <h5 className='text-xs font-bold text-muted-foreground underline'>Media Types</h5>
              <Link
                href='/'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Photo
              </Link>
              <Link
                href='/'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Video
              </Link>
            </div>

            <div className='flex flex-col space-y-2 border-t border-border pt-3'>
              <h5 className='text-xs font-bold text-muted-foreground underline'>Syndication</h5>
              <Link
                href='/syndication/buy-our-media'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Buy Our Media
              </Link>
              <Link
                href='/syndication/licensing'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Licensing &amp; Rights
              </Link>
              <Link
                href='/syndication/buy-from-journalists'
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                Buy From Journalists
              </Link>
            </div>

            <div className='flex flex-col space-y-2 border-t border-border pt-3'>
              <h4 className='text-xs font-bold uppercase tracking-wider text-foreground'>Legal</h4>
              <div className='flex flex-col space-y-2'>
                <h5 className='text-xs font-bold text-muted-foreground underline'>Compliance</h5>
                <Link
                  href='/legal/dmca-takedown'
                  className='text-xs text-muted-foreground transition-colors hover:text-foreground'
                >
                  DMCA Takedown Request
                </Link>
                <Link
                  href='/legal/copyright-claim'
                  className='text-xs text-muted-foreground transition-colors hover:text-foreground'
                >
                  Copyright Claim
                </Link>
                <Link
                  href='/legal/defamation-claim'
                  className='text-xs text-muted-foreground transition-colors hover:text-foreground'
                >
                  Defamation or Legal Notice
                </Link>
                <Link
                  href='/legal/abuse-report'
                  className='text-xs text-muted-foreground transition-colors hover:text-foreground'
                >
                  Report Abuse
                </Link>
              </div>

              <div className='flex flex-col space-y-2 border-t border-border pt-3'>
                <h5 className='text-xs font-bold text-muted-foreground underline'>Policies</h5>
                <div className='flex flex-col'>
                  {sortedPolicies.map((policy: PolicyQueryResult) => (
                    <ClientSideRoute
                      route={resolveHref('policies', formatTitleForURL(policy.title)) ?? ''}
                      key={policy._id}
                    >
                      <span className='text-xs text-muted-foreground transition-colors hover:text-foreground'>
                        {policy.title}
                      </span>
                    </ClientSideRoute>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className='border-t border-border bg-slate-50/50 px-4 py-6 text-xs text-muted-foreground dark:bg-slate-950/50'>
        <div className='flex flex-col justify-between gap-4 text-xs sm:flex-row'>
          <p>© Copyright 2026 UnTelevised Media™ All Rights Reserved.</p>
          <p className='flex items-center gap-2'>
            Made with <span className='text-lg'>✊</span> by the UnTelevised team
          </p>
        </div>
      </div>
    </div>
  );
}

export default Footer;
