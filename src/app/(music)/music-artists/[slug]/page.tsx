/* eslint-disable react/function-component-definition */
// src/app/(user)/music-artists/[slug]/page.tsx
import Image from 'next/image';
import { Metadata } from 'next';
import { PortableText } from '@portabletext/react';
import { RichTextComponents } from '@/components/providers/RichTextComponents';
import SocialShare from '@/components/global/SocialShare';
import { RectangleAd, BannerAd } from '@/components/ads';

import urlForImage from '@/util/urlForImage';
import { getSongArtwork, getSongArtworkAlt } from '@/util/getSongArtwork';
import ClientSideRoute from '@/components/providers/ClientSideRoute';
import formatDate from '@/util/formatDate';
import { cacheLife, cacheTag } from 'next/cache';
import { groq } from 'next-sanity';
import sanityClient from '@/lib/sanity/lib/client';
import { queryMusicArtistBySlug } from '@/lib/sanity/lib/queries';
import { Music, Calendar, MapPin, ExternalLink, Instagram, Twitter, Youtube } from 'lucide-react';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type ArtistWithContent = MusicArtist & {
  songs: Song[];
  albums: Album[];
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artist: ArtistWithContent = (await getMusicArtistBySlug(slug)) as ArtistWithContent;

  if (!artist) {
    return {
      title: 'Artist Not Found',
      description: 'The requested artist could not be found.',
    };
  }

  const displayName = artist.stageName ?? artist.name;
  const canonicalUrl = `https://www.untelevised.media/music-artists/${slug}/`;
  const ogImageUrl = artist.image
    ? urlForImage(artist.image)?.width(1200).height(630).url() ?? ''
    : 'https://www.untelevised.media/og-default.jpg';
  const title = `${displayName} | Music Artist`;
  const description = `Discover songs and albums by ${displayName}. ${artist.bio ? 'Learn more about this artist and their music.' : ''}`;

  return {
    title,
    description,
    keywords: `${displayName}, ${artist.name}, music, artist, songs, albums, ${artist.genres?.join(', ') ?? ''}`,
    openGraph: {
      type: 'profile',
      title: displayName,
      description,
      url: canonicalUrl,
      siteName: 'UnTelevised Media',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${displayName} artist photo` }],
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

export default async function MusicArtistPage({ params }: Props) {
  const { slug } = await params;
  const artist: ArtistWithContent = (await getMusicArtistBySlug(slug)) as ArtistWithContent;

  if (!artist) {
    return (
      <div className='mx-auto max-w-4xl p-8 text-center'>
        <h1 className='text-3xl font-bold text-slate-900 dark:text-slate-100'>Artist Not Found</h1>
        <p className='mt-4 text-slate-600 dark:text-slate-400'>
          The requested artist could not be found.
        </p>
      </div>
    );
  }

  const displayName = artist.stageName ?? artist.name;

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      {/* Hero Section */}
      <section className='bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900'>
        <div className='container mx-auto px-4 py-16'>
          <div className='mx-auto max-w-6xl'>
            <div className='grid gap-8 lg:grid-cols-3 lg:gap-12'>
              {/* Artist Image */}
              <div className='lg:col-span-1'>
                {artist.image ? (
                  <div className='aspect-square overflow-hidden rounded-2xl bg-slate-200 shadow-xl dark:bg-slate-700'>
                    <Image
                      src={urlForImage(artist.image)?.url() ?? ''}
                      alt={`${displayName} artist photo`}
                      width={400}
                      height={400}
                      className='h-full w-full object-cover transition-transform hover:scale-105'
                      priority
                    />
                  </div>
                ) : (
                  <div className='aspect-square rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 shadow-xl dark:from-slate-600 dark:to-slate-700'>
                    <div className='flex h-full items-center justify-center'>
                      <Music className='h-24 w-24 text-slate-500 dark:text-slate-400' />
                    </div>
                  </div>
                )}
              </div>

              {/* Artist Info */}
              <div className='lg:col-span-2'>
                <div className='flex h-full flex-col justify-center'>
                  <div className='mb-4 flex items-center gap-2 text-slate-600 dark:text-slate-400'>
                    <Music className='h-5 w-5' />
                    <span className='text-sm font-medium uppercase tracking-wide'>
                      Music Artist
                    </span>
                  </div>

                  <h1 className='mb-4 text-4xl font-bold text-slate-900 dark:text-slate-100 md:text-5xl lg:text-6xl'>
                    {displayName}
                  </h1>

                  {artist.stageName && artist.name !== artist.stageName && (
                    <p className='mb-6 text-xl text-slate-600 dark:text-slate-400'>
                      Real name: {artist.name}
                    </p>
                  )}

                  {/* Artist Metadata */}
                  <div className='mb-6 flex flex-wrap gap-4 text-slate-600 dark:text-slate-400'>
                    {artist.genres && artist.genres.length > 0 && (
                      <div className='flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 dark:bg-slate-700'>
                        <span className='text-sm font-medium'>{artist.genres.join(', ')}</span>
                      </div>
                    )}
                    {artist.hometown && (
                      <div className='flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 dark:bg-slate-700'>
                        <MapPin className='h-4 w-4' />
                        <span className='text-sm font-medium'>{artist.hometown}</span>
                      </div>
                    )}
                    {artist.debutYear && (
                      <div className='flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 dark:bg-slate-700'>
                        <Calendar className='h-4 w-4' />
                        <span className='text-sm font-medium'>Since {artist.debutYear}</span>
                      </div>
                    )}
                  </div>

                  {/* Artist Bio Preview */}
                  {artist.bio && (
                    <div className='mb-6'>
                      <p className='text-lg leading-relaxed text-slate-700 dark:text-slate-300'>
                        Artist biography available below.
                      </p>
                    </div>
                  )}

                  {/* Social Links */}
                  {artist.socialMedia &&
                    Object.values(artist.socialMedia).some((link) => link) && (
                      <div className='flex gap-3'>
                        {artist.socialMedia.instagram && (
                          <a
                            href={artist.socialMedia.instagram}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white transition-transform hover:scale-110'
                          >
                            <Instagram className='h-5 w-5' />
                          </a>
                        )}
                        {artist.socialMedia.twitter && (
                          <a
                            href={artist.socialMedia.twitter}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white transition-transform hover:scale-110'
                          >
                            <Twitter className='h-5 w-5' />
                          </a>
                        )}
                        {artist.socialMedia.youtube && (
                          <a
                            href={artist.socialMedia.youtube}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-110'
                          >
                            <Youtube className='h-5 w-5' />
                          </a>
                        )}
                        {artist.website && (
                          <a
                            href={artist.website}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-600 text-white transition-transform hover:scale-110 dark:bg-slate-500'
                          >
                            <ExternalLink className='h-5 w-5' />
                          </a>
                        )}
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
          <div className='grid gap-12 lg:grid-cols-4'>
            {/* Main Content */}
            <div className='lg:col-span-3'>
              {/* Biography */}
              {artist.bio && (
                <div className='mb-12 rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                  <h2 className='mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100'>
                    Biography
                  </h2>
                  <div className='prose prose-slate dark:prose-invert max-w-none'>
                    <PortableText value={artist.bio} components={RichTextComponents} />
                  </div>
                </div>
              )}

              {/* Songs */}
              {artist.songs && artist.songs.length > 0 && (
                <div className='mb-12 rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                  <h2 className='mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100'>
                    Songs
                  </h2>
                  <div className='space-y-4'>
                    {artist.songs.slice(0, 10).map((song) => {
                      const artworkUrl = getSongArtwork(song);
                      const artworkAlt = getSongArtworkAlt(song);

                      return (
                        <ClientSideRoute key={song._id} route={`/lyrics/${song.slug.current}`}>
                          <div className='group flex cursor-pointer items-center gap-4 rounded-lg p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700'>
                            {artworkUrl && (
                              <div className='h-16 w-16 overflow-hidden rounded-lg'>
                                <Image
                                  src={artworkUrl}
                                  alt={artworkAlt}
                                  width={64}
                                  height={64}
                                  className='h-full w-full object-cover'
                                />
                              </div>
                            )}
                            <div className='flex-1'>
                              <h3 className='font-medium text-slate-900 group-hover:text-untele dark:text-slate-100'>
                                {song.title}
                              </h3>
                              <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
                                {song.album && <span>{song.album.title}</span>}
                                {song.releaseDate && (
                                  <>
                                    <span>•</span>
                                    <span>{formatDate(song.releaseDate)}</span>
                                  </>
                                )}
                                {song.duration && (
                                  <>
                                    <span>•</span>
                                    <span>{song.duration}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {song.featuredArtists && song.featuredArtists.length > 0 && (
                              <div className='text-sm text-slate-600 dark:text-slate-400'>
                                feat.{' '}
                                {song.featuredArtists.map((a) => a.stageName ?? a.name).join(', ')}
                              </div>
                            )}
                          </div>
                        </ClientSideRoute>
                      );
                    })}
                  </div>

                  {artist.songs.length > 10 && (
                    <div className='mt-6 text-center'>
                      <button className='rounded-lg bg-untele px-6 py-2 text-white transition-colors hover:bg-untele/90'>
                        View All Songs ({artist.songs.length})
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Albums */}
              {artist.albums && artist.albums.length > 0 && (
                <div className='rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                  <h2 className='mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100'>
                    Albums
                  </h2>
                  <div className='grid gap-6 sm:grid-cols-2'>
                    {artist.albums.map((album) => (
                      <ClientSideRoute key={album._id} route={`/albums/${album.slug.current}`}>
                        <div className='group cursor-pointer rounded-lg border border-slate-200 p-4 transition-colors hover:border-untele dark:border-slate-700 dark:hover:border-untele'>
                          {album.albumArt && (
                            <div className='mb-4 aspect-square overflow-hidden rounded-lg'>
                              <Image
                                src={urlForImage(album.albumArt)?.url() ?? ''}
                                alt={`${album.title} album artwork`}
                                width={200}
                                height={200}
                                className='h-full w-full object-cover transition-transform group-hover:scale-105'
                              />
                            </div>
                          )}
                          <h3 className='font-medium text-slate-900 group-hover:text-untele dark:text-slate-100'>
                            {album.title}
                          </h3>
                          <div className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
                            <div>{album.albumType}</div>
                            <div>{formatDate(album.releaseDate)}</div>
                          </div>
                        </div>
                      </ClientSideRoute>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className='space-y-8'>
              {/* Artist Details */}
              <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                <h3 className='mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100'>
                  Artist Details
                </h3>
                <div className='space-y-3 text-sm'>
                  {artist.recordLabel && (
                    <div>
                      <span className='font-medium text-slate-900 dark:text-slate-100'>
                        Label:
                      </span>
                      <span className='ml-2 text-slate-600 dark:text-slate-400'>
                        {artist.recordLabel}
                      </span>
                    </div>
                  )}
                  {artist.hometown && (
                    <div>
                      <span className='font-medium text-slate-900 dark:text-slate-100'>
                        Hometown:
                      </span>
                      <span className='ml-2 text-slate-600 dark:text-slate-400'>
                        {artist.hometown}
                      </span>
                    </div>
                  )}
                  {artist.debutYear && (
                    <div>
                      <span className='font-medium text-slate-900 dark:text-slate-100'>
                        Debut:
                      </span>
                      <span className='ml-2 text-slate-600 dark:text-slate-400'>
                        {artist.debutYear}
                      </span>
                    </div>
                  )}
                  {artist.genres && artist.genres.length > 0 && (
                    <div>
                      <span className='font-medium text-slate-900 dark:text-slate-100'>
                        Genres:
                      </span>
                      <span className='ml-2 text-slate-600 dark:text-slate-400'>
                        {artist.genres.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Media */}
              {artist.socialMedia && Object.values(artist.socialMedia).some((link) => link) && (
                <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                  <h3 className='mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100'>
                    Follow {displayName}
                  </h3>
                  <div className='space-y-3'>
                    {artist.socialMedia.instagram && (
                      <a
                        href={`https://instagram.com/${artist.socialMedia.instagram}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-3 text-slate-600 transition-colors hover:text-pink-600 dark:text-slate-400'
                      >
                        <Instagram className='h-5 w-5' />
                        <span>@{artist.socialMedia.instagram}</span>
                      </a>
                    )}
                    {artist.socialMedia.twitter && (
                      <a
                        href={`https://twitter.com/${artist.socialMedia.twitter}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-3 text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400'
                      >
                        <Twitter className='h-5 w-5' />
                        <span>@{artist.socialMedia.twitter}</span>
                      </a>
                    )}
                    {artist.socialMedia.youtube && (
                      <a
                        href={artist.socialMedia.youtube}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-3 text-slate-600 transition-colors hover:text-red-600 dark:text-slate-400'
                      >
                        <Youtube className='h-5 w-5' />
                        <span>YouTube</span>
                      </a>
                    )}
                    {artist.socialMedia.spotify && (
                      <a
                        href={artist.socialMedia.spotify}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-3 text-slate-600 transition-colors hover:text-green-600 dark:text-slate-400'
                      >
                        <ExternalLink className='h-5 w-5' />
                        <span>Spotify</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Ad Space */}
              <div className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'>
                <RectangleAd slot='2468013579' className='h-[250px] w-full' />
              </div>

              {/* Social Share */}
              <SocialShare
                url={`/music-artists/${artist.slug.current}`}
                title={`${displayName} | Music Artist`}
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

// Fetch artist data by slug — cached per-function with fine-grained tags
async function getMusicArtistBySlug(slug: string): Promise<ArtistWithContent | null> {
  'use cache';
  cacheTag('musicArtist', `musicArtist-${slug}`);
  cacheLife('hours');
  try {
    return await sanityClient.fetch<ArtistWithContent>(queryMusicArtistBySlug, { slug });
  } catch (error) {
    console.error('Failed to fetch artist:', error);
    return null;
  }
}

export async function generateStaticParams() {
  const queryMusicArtistStaticParams = groq`*[_type=='musicArtist'] { slug }`;
  const slugs: { slug: { current: string } }[] = await sanityClient.fetch(queryMusicArtistStaticParams);
  return (slugs ?? []).map((item) => ({ slug: item.slug.current }));
}
