/* eslint-disable react/function-component-definition */
// src/app/(user)/lyrics/[slug]/page.tsx
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import { RichTextComponents } from '@/components/providers/RichTextComponents';
import SocialShare from '@/components/global/SocialShare';
import { RectangleAd, BannerAd } from '@/components/ads';

import urlForImage from '@/util/urlForImage';
import { getSongArtworkInfo } from '@/util/getSongArtwork';
import ClientSideRoute from '@/components/providers/ClientSideRoute';
import formatDate from '@/util/formatDate';
import { groq } from 'next-sanity';
import sanityClient from '@/lib/sanity/lib/client';
import { sanityFetch } from '@/lib/sanity/lib/fetch';
import { querySongBySlug } from '@/lib/sanity/lib/queries';
import { Music, Clock, Calendar, ExternalLink } from 'lucide-react';
import { SongStructuredData } from '@/components/seo/StructuredData';
import { getCanonicalUrl, truncate, DEFAULT_OG_IMAGE, TWITTER_HANDLE } from '@/util/metadata';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const song: Song = (await getSongBySlug(slug)) as Song;

  if (!song) {
    return { title: 'Song Not Found', description: 'The requested song could not be found.' };
  }

  const primaryName = song.primaryArtist.stageName ?? song.primaryArtist.name;
  const artistNames = [
    primaryName,
    ...(song.featuredArtists?.map((a) => a.stageName ?? a.name) ?? []),
  ].join(', ');

  const artworkInfo = getSongArtworkInfo(song);
  const canonicalUrl = song.seo?.canonicalUrl ?? getCanonicalUrl('lyrics', slug);
  const ogImage = artworkInfo.url ?? DEFAULT_OG_IMAGE;
  const title = truncate(song.seo?.metaTitle ?? `${song.title} - ${artistNames} | Lyrics`, 60);
  const description = truncate(
    song.seo?.metaDescription ??
      `Read the lyrics to "${song.title}" by ${artistNames} on UnTelevised Media.`,
    160,
  );

  return {
    title,
    description,
    keywords: [song.title, artistNames, 'lyrics', ...(song.genres ?? [])].join(', '),
    publisher: 'UnTelevised Media',
    openGraph: {
      type: 'music.song',
      title: `${song.title} — ${primaryName}`,
      description,
      url: canonicalUrl,
      siteName: 'UnTelevised Media',
      images: [{ url: ogImage, width: 1200, height: 630, alt: artworkInfo.alt ?? song.title }],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
      images: [ogImage],
    },
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
  };
}

export default async function LyricsPage({ params }: Props) {
  const { slug } = await params;
  const song: Song = (await getSongBySlug(slug)) as Song;

  if (!song) notFound();

  const artistNames = [
    song.primaryArtist.name,
    ...(song.featuredArtists?.map((artist) => artist.name) ?? []),
  ].join(', ');

  const artworkInfo = getSongArtworkInfo(song);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      <SongStructuredData song={song} />
      {/* Hero Section */}
      <section className='relative overflow-hidden'>
        {/* Background Image with Overlay */}
        <div className='relative h-[50vh] min-h-[300px]'>
          {artworkInfo.url && (
            <Image
              src={artworkInfo.url}
              alt={artworkInfo.alt}
              fill
              className='object-cover'
              priority
            />
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20' />

          {/* Hero Content */}
          <div className='absolute inset-0 flex items-end'>
            <div className='container mx-auto px-4 pb-8'>
              <div className='max-w-4xl'>
                <div className='mb-4 flex items-center gap-2 text-white/80'>
                  <Music className='h-5 w-5' />
                  <span className='text-sm font-medium'>LYRICS</span>
                </div>
                <h1 className='mb-4 text-4xl font-bold text-white md:text-6xl'>{song.title}</h1>
                <p className='mb-6 text-xl text-white/90 md:text-2xl'>by {artistNames}</p>

                {/* Song Metadata */}
                <div className='flex flex-wrap gap-4 text-sm text-white/80'>
                  {song.album && (
                    <div className='flex items-center gap-1'>
                      <span>Album: {song.album.title}</span>
                    </div>
                  )}
                  {song.releaseDate && (
                    <div className='flex items-center gap-1'>
                      <Calendar className='h-4 w-4' />
                      <span>{formatDate(song.releaseDate)}</span>
                    </div>
                  )}
                  {song.duration && (
                    <div className='flex items-center gap-1'>
                      <Clock className='h-4 w-4' />
                      <span>{song.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className='container mx-auto px-4 py-12'>
        <div className='mx-auto max-w-7xl'>
          <div className='grid gap-12 lg:grid-cols-4'>
            {/* Lyrics Content */}
            <div className='lg:col-span-3'>
              {/* Streaming Links */}
              {song.streamingLinks && Object.values(song.streamingLinks).some((link) => link) && (
                <div className='mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                  <h3 className='mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100'>
                    Listen Now
                  </h3>
                  <div className='flex flex-wrap gap-3'>
                    {song.streamingLinks.spotify && (
                      <a
                        href={song.streamingLinks.spotify}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700'
                      >
                        <ExternalLink className='h-4 w-4' />
                        Spotify
                      </a>
                    )}
                    {song.streamingLinks.appleMusic && (
                      <a
                        href={song.streamingLinks.appleMusic}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800'
                      >
                        <ExternalLink className='h-4 w-4' />
                        Apple Music
                      </a>
                    )}
                    {song.streamingLinks.youtube && (
                      <a
                        href={song.streamingLinks.youtube}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700'
                      >
                        <ExternalLink className='h-4 w-4' />
                        YouTube
                      </a>
                    )}
                    {song.streamingLinks.soundcloud && (
                      <a
                        href={song.streamingLinks.soundcloud}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700'
                      >
                        <ExternalLink className='h-4 w-4' />
                        SoundCloud
                      </a>
                    )}
                    {song.streamingLinks.bandcamp && (
                      <a
                        href={song.streamingLinks.bandcamp}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700'
                      >
                        <ExternalLink className='h-4 w-4' />
                        Bandcamp
                      </a>
                    )}
                    {song.streamingLinks.amazonMusic && (
                      <a
                        href={song.streamingLinks.amazonMusic}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700'
                      >
                        <ExternalLink className='h-4 w-4' />
                        Amazon Music
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Lyrics */}
              <div className='rounded-lg border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                <h2 className='mb-8 text-3xl font-bold text-slate-900 dark:text-slate-100'>
                  Lyrics
                </h2>

                {song.lyricsStructure && song.lyricsStructure.length > 0 ? (
                  <div className='space-y-8'>
                    {song.lyricsStructure
                      .sort((a, b) => a.order - b.order)
                      .map((section, index) => (
                        <div key={index} className='space-y-3'>
                          <h3 className='text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                            {section.sectionType}
                          </h3>
                          <div className='whitespace-pre-line text-lg leading-relaxed text-slate-900 dark:text-slate-100'>
                            {section.content}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className='whitespace-pre-line text-lg leading-relaxed text-slate-900 dark:text-slate-100'>
                    {song.lyrics}
                  </div>
                )}

                {song.isExplicit && (
                  <div className='mt-6 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20'>
                    <p className='text-sm text-yellow-800 dark:text-yellow-200'>
                      ⚠️ This song contains explicit content
                    </p>
                  </div>
                )}
              </div>

              {/* Song Description */}
              {song.description && (
                <div className='mt-8 rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                  <h2 className='mb-4 text-xl font-bold text-slate-900 dark:text-slate-100'>
                    About This Song
                  </h2>
                  <div className='prose prose-slate dark:prose-invert max-w-none'>
                    <PortableText value={song.description} components={RichTextComponents} />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className='space-y-8'>
              {/* Track/Album Artwork Info */}
              <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                <h3 className='mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100'>
                  {artworkInfo.isTrackArt ? 'Track Artwork' : 'Album'}
                </h3>
                {artworkInfo.url && (
                  <div className='mb-3 aspect-square overflow-hidden rounded-lg'>
                    <Image
                      src={artworkInfo.url}
                      alt={artworkInfo.alt}
                      width={200}
                      height={200}
                      className='h-full w-full object-cover'
                    />
                  </div>
                )}
                {artworkInfo.isTrackArt ? (
                  <div>
                    <h4 className='font-medium text-slate-900 dark:text-slate-100'>
                      {song.title}
                    </h4>
                    <p className='text-sm text-slate-600 dark:text-slate-400'>
                      Individual track artwork
                    </p>
                    {song.album && (
                      <p className='mt-2 text-xs text-slate-500 dark:text-slate-400'>
                        From album: {song.album.title}
                      </p>
                    )}
                  </div>
                ) : song.album ? (
                  <ClientSideRoute route={`/albums/${song.album.slug.current}`}>
                    <div className='group cursor-pointer'>
                      <h4 className='font-medium text-slate-900 group-hover:text-untele dark:text-slate-100'>
                        {song.album.title}
                      </h4>
                      <p className='text-sm text-slate-600 dark:text-slate-400'>
                        {formatDate(song.album.releaseDate)}
                      </p>
                    </div>
                  </ClientSideRoute>
                ) : null}
              </div>

              {/* Artist Info */}
              <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                <h3 className='mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100'>
                  Artist{song.featuredArtists && song.featuredArtists.length > 0 ? 's' : ''}
                </h3>
                <div className='space-y-4'>
                  <ClientSideRoute route={`/music-artists/${song.primaryArtist.slug.current}`}>
                    <div className='group flex cursor-pointer items-center gap-3'>
                      {song.primaryArtist.image && (
                        <div className='h-12 w-12 overflow-hidden rounded-full'>
                          <Image
                            src={urlForImage(song.primaryArtist.image)?.url() ?? ''}
                            alt={song.primaryArtist.name}
                            width={48}
                            height={48}
                            className='h-full w-full object-cover'
                          />
                        </div>
                      )}
                      <div>
                        <h4 className='font-medium text-slate-900 group-hover:text-untele dark:text-slate-100'>
                          {song.primaryArtist.stageName ?? song.primaryArtist.name}
                        </h4>
                        <p className='text-sm text-slate-600 dark:text-slate-400'>
                          Primary Artist
                        </p>
                      </div>
                    </div>
                  </ClientSideRoute>

                  {song.featuredArtists?.map((artist) => (
                    <ClientSideRoute
                      key={artist._id}
                      route={`/music-artists/${artist.slug.current}`}
                    >
                      <div className='group flex cursor-pointer items-center gap-3'>
                        {artist.image && (
                          <div className='h-12 w-12 overflow-hidden rounded-full'>
                            <Image
                              src={urlForImage(artist.image)?.url() ?? ''}
                              alt={artist.name}
                              width={48}
                              height={48}
                              className='h-full w-full object-cover'
                            />
                          </div>
                        )}
                        <div>
                          <h4 className='font-medium text-slate-900 group-hover:text-untele dark:text-slate-100'>
                            {artist.stageName ?? artist.name}
                          </h4>
                          <p className='text-sm text-slate-600 dark:text-slate-400'>Featured</p>
                        </div>
                      </div>
                    </ClientSideRoute>
                  ))}
                </div>
              </div>

              {/* Credits */}
              {song.contributingArtists && song.contributingArtists.length > 0 && (
                <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                  <h3 className='mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100'>
                    Credits
                  </h3>
                  <div className='space-y-3'>
                    {song.contributingArtists.map((contributor, index) => (
                      <div key={index} className='flex items-center justify-between'>
                        <span className='text-sm text-slate-900 dark:text-slate-100'>
                          {contributor.artist.stageName ?? contributor.artist.name}
                        </span>
                        <span className='text-sm text-slate-600 dark:text-slate-400'>
                          {contributor.role.replace('-', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ad Space */}
              <div className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'>
                <RectangleAd slot='2468013579' className='h-[250px] w-full' />
              </div>

              {/* Social Share */}
              <SocialShare
                url={`/lyrics/${song.slug.current}`}
                title={`${song.title} - ${artistNames} | Lyrics`}
              />
            </div>
          </div>
        </div>

        {/* Banner Ad */}
        <div className='mb-8 mt-12'>
          <BannerAd
            slot='1357924680'
            className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
          />
        </div>
      </main>
    </div>
  );
}

// Fetch song data by slug
async function getSongBySlug(slug: string): Promise<Song | null> {
  try {
    const { data } = await sanityFetch({ query: querySongBySlug, params: { slug }, tags: ['song'] });
    return data as Song | null;
  } catch (error) {
    console.error('Failed to fetch song:', error);
    return null;
  }
}

export async function generateStaticParams() {
  const querySongStaticParams = groq`*[_type=='song'] { slug }`;
  // Use sanityClient directly to avoid draftMode() call during static generation
  const slugs: { slug: { current: string } }[] = await sanityClient.fetch(querySongStaticParams);
  return (slugs ?? []).filter((item) => item?.slug?.current).map((item) => ({ slug: item.slug.current }));
}
