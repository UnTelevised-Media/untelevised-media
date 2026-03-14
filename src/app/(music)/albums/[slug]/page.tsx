/* eslint-disable react/function-component-definition */
// src/app/(user)/albums/[slug]/page.tsx
import Image from 'next/image';
import { Metadata } from 'next';
import { PortableText } from '@portabletext/react';
import { RichTextComponents } from '@/components/providers/RichTextComponents';
import SocialShare from '@/components/global/SocialShare';
import { RectangleAd, BannerAd } from '@/components/ads';

import urlForImage from '@/util/urlForImage';
import ClientSideRoute from '@/components/providers/ClientSideRoute';
import formatDate from '@/util/formatDate';
import { cacheLife, cacheTag } from 'next/cache';
import { groq } from 'next-sanity';
import sanityClient from '@/lib/sanity/lib/client';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryAlbumBySlug } from '@/lib/sanity/lib/queries';
import { Disc, Calendar, Clock, ExternalLink, Music } from 'lucide-react';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type AlbumWithSongs = Album & {
  songs: Song[];
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album: AlbumWithSongs = (await getAlbumBySlug(slug)) as AlbumWithSongs;

  if (!album) {
    return {
      title: 'Album Not Found',
      description: 'The requested album could not be found.',
    };
  }

  const artistNames = [
    album.artist.stageName ?? album.artist.name,
    ...(album.featuredArtists?.map((artist) => artist.stageName ?? artist.name) ?? []),
  ].join(', ');

  const canonicalUrl = album.seo?.canonicalUrl ?? `https://www.untelevised.media/albums/${slug}/`;
  const ogImageUrl = album.albumArt
    ? (urlForImage(album.albumArt)?.width(1200).height(630).url() ?? '')
    : 'https://www.untelevised.media/og-default.png';
  const computedTitle = `${album.title} - ${artistNames} | Album`;
  const title = album.seo?.metaTitle ?? computedTitle;
  const computedDescription = `Listen to ${album.title} by ${artistNames}. ${album.description ? 'Learn more about this album.' : ''}`;
  const description = album.seo?.metaDescription ?? computedDescription;

  return {
    title,
    description,
    keywords: `${album.title}, ${artistNames}, album, ${album.genres?.join(', ') ?? ''}`,
    openGraph: {
      type: 'music.album',
      title: `${album.title} - ${artistNames}`,
      description,
      url: canonicalUrl,
      siteName: 'UnTelevised Media',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${album.title} album artwork` }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@untelevised',
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: { canonical: canonicalUrl },
  };
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  const album: AlbumWithSongs = (await getAlbumBySlug(slug)) as AlbumWithSongs;

  if (!album) {
    return (
      <div className='mx-auto max-w-4xl p-8 text-center'>
        <h1 className='text-3xl font-bold text-slate-900 dark:text-slate-100'>Album Not Found</h1>
        <p className='mt-4 text-slate-600 dark:text-slate-400'>
          The requested album could not be found.
        </p>
      </div>
    );
  }

  const artistNames = [
    album.artist.stageName ?? album.artist.name,
    ...(album.featuredArtists?.map((artist) => artist.stageName ?? artist.name) ?? []),
  ].join(', ');

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      {/* Hero Section */}
      <section className='relative overflow-hidden'>
        {/* Background Image with Overlay */}
        <div className='relative h-[60vh] min-h-[400px]'>
          {album.albumArt && (
            <Image
              src={urlForImage(album.albumArt)?.url() ?? ''}
              alt={`${album.title} album artwork`}
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
                  <Disc className='h-5 w-5' />
                  <span className='text-sm font-medium'>{album.albumType.toUpperCase()}</span>
                </div>
                <h1 className='mb-4 text-4xl font-bold text-white md:text-6xl'>{album.title}</h1>
                <p className='mb-6 text-xl text-white/90 md:text-2xl'>by {artistNames}</p>

                {/* Album Metadata */}
                <div className='flex flex-wrap gap-4 text-sm text-white/80'>
                  <div className='flex items-center gap-1'>
                    <Calendar className='h-4 w-4' />
                    <span>{formatDate(album.releaseDate)}</span>
                  </div>
                  {album.totalTracks && (
                    <div className='flex items-center gap-1'>
                      <Music className='h-4 w-4' />
                      <span>{album.totalTracks} tracks</span>
                    </div>
                  )}
                  {album.duration && (
                    <div className='flex items-center gap-1'>
                      <Clock className='h-4 w-4' />
                      <span>{album.duration}</span>
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
        <div className='mx-auto max-w-6xl'>
          <div className='grid gap-12 lg:grid-cols-3'>
            {/* Main Content */}
            <div className='lg:col-span-2'>
              {/* Streaming Links */}
              {album.streamingLinks &&
                Object.values(album.streamingLinks).some((link) => link) && (
                  <div className='mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                    <h3 className='mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100'>
                      Listen Now
                    </h3>
                    <div className='flex flex-wrap gap-3'>
                      {album.streamingLinks.spotify && (
                        <a
                          href={album.streamingLinks.spotify}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700'
                        >
                          <ExternalLink className='h-4 w-4' />
                          Spotify
                        </a>
                      )}
                      {album.streamingLinks.appleMusic && (
                        <a
                          href={album.streamingLinks.appleMusic}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800'
                        >
                          <ExternalLink className='h-4 w-4' />
                          Apple Music
                        </a>
                      )}
                      {album.streamingLinks.youtube && (
                        <a
                          href={album.streamingLinks.youtube}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700'
                        >
                          <ExternalLink className='h-4 w-4' />
                          YouTube
                        </a>
                      )}
                    </div>
                  </div>
                )}

              {/* Track List */}
              {album.songs && album.songs.length > 0 && (
                <div className='mb-8 rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                  <h2 className='mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100'>
                    Track List
                  </h2>
                  <div className='space-y-2'>
                    {album.songs.map((song, index) => (
                      <ClientSideRoute key={song._id} route={`/lyrics/${song.slug.current}`}>
                        <div className='group flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700'>
                          <div className='flex h-8 w-8 items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-400'>
                            {song.trackNumber ?? index + 1}
                          </div>
                          <div className='flex-1'>
                            <h3 className='font-medium text-slate-900 group-hover:text-untele dark:text-slate-100'>
                              {song.title}
                            </h3>
                            {song.featuredArtists && song.featuredArtists.length > 0 && (
                              <p className='text-sm text-slate-600 dark:text-slate-400'>
                                feat.{' '}
                                {song.featuredArtists.map((a) => a.stageName ?? a.name).join(', ')}
                              </p>
                            )}
                          </div>
                          {song.duration && (
                            <div className='text-sm text-slate-500 dark:text-slate-400'>
                              {song.duration}
                            </div>
                          )}
                          {song.isExplicit && (
                            <div className='rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300'>
                              E
                            </div>
                          )}
                        </div>
                      </ClientSideRoute>
                    ))}
                  </div>
                </div>
              )}

              {/* Album Description */}
              {album.description && (
                <div className='rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                  <h2 className='mb-4 text-xl font-bold text-slate-900 dark:text-slate-100'>
                    About This Album
                  </h2>
                  <div className='prose prose-slate dark:prose-invert max-w-none'>
                    <PortableText value={album.description} components={RichTextComponents} />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className='space-y-8'>
              {/* Album Artwork */}
              <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                {album.albumArt && (
                  <div className='mb-4 aspect-square overflow-hidden rounded-lg'>
                    <Image
                      src={urlForImage(album.albumArt)?.url() ?? ''}
                      alt={`${album.title} album artwork`}
                      width={300}
                      height={300}
                      className='h-full w-full object-cover'
                    />
                  </div>
                )}
                <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                  {album.title}
                </h3>
                <p className='text-slate-600 dark:text-slate-400'>{artistNames}</p>
              </div>

              {/* Album Details */}
              <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                <h3 className='mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100'>
                  Album Details
                </h3>
                <div className='space-y-3 text-sm'>
                  <div>
                    <span className='font-medium text-slate-900 dark:text-slate-100'>Type:</span>
                    <span className='ml-2 text-slate-600 dark:text-slate-400'>
                      {album.albumType}
                    </span>
                  </div>
                  <div>
                    <span className='font-medium text-slate-900 dark:text-slate-100'>
                      Released:
                    </span>
                    <span className='ml-2 text-slate-600 dark:text-slate-400'>
                      {formatDate(album.releaseDate)}
                    </span>
                  </div>
                  {album.recordLabel && (
                    <div>
                      <span className='font-medium text-slate-900 dark:text-slate-100'>
                        Label:
                      </span>
                      <span className='ml-2 text-slate-600 dark:text-slate-400'>
                        {album.recordLabel}
                      </span>
                    </div>
                  )}
                  {album.totalTracks && (
                    <div>
                      <span className='font-medium text-slate-900 dark:text-slate-100'>
                        Tracks:
                      </span>
                      <span className='ml-2 text-slate-600 dark:text-slate-400'>
                        {album.totalTracks}
                      </span>
                    </div>
                  )}
                  {album.duration && (
                    <div>
                      <span className='font-medium text-slate-900 dark:text-slate-100'>
                        Duration:
                      </span>
                      <span className='ml-2 text-slate-600 dark:text-slate-400'>
                        {album.duration}
                      </span>
                    </div>
                  )}
                  {album.genres && album.genres.length > 0 && (
                    <div>
                      <span className='font-medium text-slate-900 dark:text-slate-100'>
                        Genres:
                      </span>
                      <span className='ml-2 text-slate-600 dark:text-slate-400'>
                        {album.genres.join(', ')}
                      </span>
                    </div>
                  )}
                  {album.producer && album.producer.length > 0 && (
                    <div>
                      <span className='font-medium text-slate-900 dark:text-slate-100'>
                        Producers:
                      </span>
                      <span className='ml-2 text-slate-600 dark:text-slate-400'>
                        {album.producer.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Artist Info */}
              <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                <h3 className='mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100'>
                  Artist{album.featuredArtists && album.featuredArtists.length > 0 ? 's' : ''}
                </h3>
                <div className='space-y-4'>
                  <ClientSideRoute route={`/music-artists/${album.artist.slug.current}`}>
                    <div className='group flex cursor-pointer items-center gap-3'>
                      {album.artist.image && (
                        <div className='h-12 w-12 overflow-hidden rounded-full'>
                          <Image
                            src={urlForImage(album.artist.image)?.url() ?? ''}
                            alt={album.artist.name}
                            width={48}
                            height={48}
                            className='h-full w-full object-cover'
                          />
                        </div>
                      )}
                      <div>
                        <h4 className='font-medium text-slate-900 group-hover:text-untele dark:text-slate-100'>
                          {album.artist.stageName ?? album.artist.name}
                        </h4>
                        <p className='text-sm text-slate-600 dark:text-slate-400'>
                          Primary Artist
                        </p>
                      </div>
                    </div>
                  </ClientSideRoute>

                  {album.featuredArtists?.map((artist) => (
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

              {/* Ad Space */}
              <div className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'>
                <RectangleAd slot='2468013579' className='h-[250px] w-full' />
              </div>

              {/* Social Share */}
              <SocialShare
                url={`/albums/${album.slug.current}`}
                title={`${album.title} - ${artistNames} | Album`}
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

// Fetch album data by slug — cached per-function with fine-grained tags
async function getAlbumBySlug(slug: string): Promise<AlbumWithSongs | null> {
  'use cache';
  cacheTag('album', `album-${slug}`);
  cacheLife('hours');
  try {
    return await sanityClient.fetch<AlbumWithSongs>(queryAlbumBySlug, { slug });
  } catch (error) {
    console.error('Failed to fetch album:', error);
    return null;
  }
}

export async function generateStaticParams() {
  const queryAlbumStaticParams = groq`*[_type=='album'] { slug }`;
  const slugs: { slug: { current: string } }[] = await sanityFetch({ query: queryAlbumStaticParams, tags: ['album'] });
  return (slugs ?? []).map((item) => ({ slug: item.slug.current }));
}
