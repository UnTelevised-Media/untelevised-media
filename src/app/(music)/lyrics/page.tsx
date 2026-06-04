/* eslint-disable react/function-component-definition */
// src/app/(user)/lyrics/page.tsx
import Image from 'next/image';
import { Metadata } from 'next';
import { BannerAd } from '@/components/ads';

import urlForImage from '@/util/urlForImage';
import { getSongArtwork, getSongArtworkAlt } from '@/util/getSongArtwork';
import ClientSideRoute from '@/components/providers/ClientSideRoute';
import formatDate from '@/util/formatDate';
import { sanityFetch } from '@/lib/sanity/lib/fetch';
import {
  queryFeaturedSongs,
  queryRecentSongs,
  queryFeaturedMusicArtists,
} from '@/lib/sanity/lib/queries';
import { Music, TrendingUp, Users, Clock } from 'lucide-react';
import { DEFAULT_OG_IMAGE, getCanonicalUrl, TWITTER_HANDLE } from '@/util/metadata';

export const metadata: Metadata = {
  title: 'Lyrics | Music & Songs',
  description:
    'Discover song lyrics from our featured artists. Read lyrics, learn about songs, and explore music from talented artists.',
  keywords: 'lyrics, songs, music, artists, hip hop, r&b, pop, rock',
  alternates: { canonical: getCanonicalUrl('lyrics') },
  openGraph: {
    type: 'website',
    title: 'Lyrics | Music & Songs',
    description: 'Discover song lyrics from our featured artists on UnTelevised Media.',
    url: getCanonicalUrl('lyrics'),
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'UnTelevised Media — Lyrics' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: TWITTER_HANDLE,
    title: 'Lyrics | Music & Songs',
    description: 'Discover song lyrics from our featured artists on UnTelevised Media.',
  },
};

export default async function LyricsIndexPage() {
  const [featuredSongs, recentSongs, featuredArtists] = await Promise.all([
    getFeaturedSongs(),
    getRecentSongs(),
    getFeaturedArtists(),
  ]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-gradient-to-r from-untele to-red-700 py-20'>
        <div className='container mx-auto px-4'>
          <div className='mx-auto max-w-4xl text-center'>
            <div className='mb-6 flex items-center justify-center gap-2 text-white/80'>
              <Music className='h-8 w-8' />
              <span className='text-lg font-medium'>LYRICS</span>
            </div>
            <h1 className='mb-6 text-4xl font-bold text-white md:text-6xl'>
              Discover Music & Lyrics
            </h1>
            <p className='mb-8 text-xl text-white/90 md:text-2xl'>
              Explore songs and lyrics from our featured artists
            </p>
            <div className='flex flex-wrap justify-center gap-4 text-sm text-white/80'>
              <div className='flex items-center gap-2'>
                <TrendingUp className='h-4 w-4' />
                <span>Latest Releases</span>
              </div>
              <div className='flex items-center gap-2'>
                <Users className='h-4 w-4' />
                <span>Featured Artists</span>
              </div>
              <div className='flex items-center gap-2'>
                <Music className='h-4 w-4' />
                <span>Original Content</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className='container mx-auto px-4 py-12'>
        <div className='mx-auto max-w-7xl'>
          {/* Featured Songs */}
          {featuredSongs && featuredSongs.length > 0 && (
            <section className='mb-16'>
              <div className='mb-8 flex items-center justify-between'>
                <h2 className='text-3xl font-bold text-slate-900 dark:text-slate-100'>
                  Featured Songs
                </h2>
                <ClientSideRoute route='/lyrics/featured'>
                  <span className='text-untele transition-colors hover:text-untele/80'>
                    View All →
                  </span>
                </ClientSideRoute>
              </div>

              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {featuredSongs.map((song) => {
                  const artworkUrl = getSongArtwork(song);
                  const artworkAlt = getSongArtworkAlt(song);

                  return (
                    <ClientSideRoute key={song._id} route={`/lyrics/${song.slug.current}`}>
                      <div className='group cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800'>
                        {artworkUrl && (
                          <div className='aspect-square overflow-hidden'>
                            <Image
                              src={artworkUrl}
                              alt={artworkAlt}
                              width={300}
                              height={300}
                              className='h-full w-full object-cover transition-transform group-hover:scale-105'
                            />
                          </div>
                        )}
                        <div className='p-6'>
                          <h3 className='mb-2 text-lg font-semibold text-slate-900 group-hover:text-untele dark:text-slate-100'>
                            {song.title}
                          </h3>
                          <p className='mb-3 text-slate-600 dark:text-slate-400'>
                            by {song.primaryArtist.stageName ?? song.primaryArtist.name}
                            {song.featuredArtists && song.featuredArtists.length > 0 && (
                              <span>
                                {' '}
                                feat.{' '}
                                {song.featuredArtists.map((a) => a.stageName ?? a.name).join(', ')}
                              </span>
                            )}
                          </p>
                          <div className='flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400'>
                            {song.album && <span>{song.album.title}</span>}
                            {song.releaseDate && (
                              <>
                                <span>•</span>
                                <span>{formatDate(song.releaseDate)}</span>
                              </>
                            )}
                          </div>
                          {song.isExplicit && (
                            <div className='mt-3'>
                              <span className='rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300'>
                                Explicit
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </ClientSideRoute>
                  );
                })}
              </div>
            </section>
          )}

          {/* Featured Artists */}
          {featuredArtists && featuredArtists.length > 0 && (
            <section className='mb-16'>
              <div className='mb-8 flex items-center justify-between'>
                <h2 className='text-3xl font-bold text-slate-900 dark:text-slate-100'>
                  Featured Artists
                </h2>
                <ClientSideRoute route='/music-artists'>
                  <span className='text-untele transition-colors hover:text-untele/80'>
                    View All →
                  </span>
                </ClientSideRoute>
              </div>

              <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                {featuredArtists.map((artist) => (
                  <ClientSideRoute
                    key={artist._id}
                    route={`/music-artists/${artist.slug.current}`}
                  >
                    <div className='group cursor-pointer text-center'>
                      <div className='mb-4 overflow-hidden rounded-full'>
                        {artist.image ? (
                          <Image
                            src={urlForImage(artist.image)?.url() ?? ''}
                            alt={artist.name}
                            width={200}
                            height={200}
                            className='h-48 w-48 object-cover transition-transform group-hover:scale-105'
                          />
                        ) : (
                          <div className='flex h-48 w-48 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700'>
                            <Users className='h-16 w-16 text-slate-400' />
                          </div>
                        )}
                      </div>
                      <h3 className='mb-2 text-lg font-semibold text-slate-900 group-hover:text-untele dark:text-slate-100'>
                        {artist.stageName ?? artist.name}
                      </h3>
                      <p className='mb-2 text-sm text-slate-600 dark:text-slate-400'>
                        {artist.genres?.slice(0, 2).join(', ')}
                      </p>
                      {artist.songCount !== undefined && (
                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                          {artist.songCount} song{artist.songCount !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </ClientSideRoute>
                ))}
              </div>
            </section>
          )}

          {/* Recent Songs */}
          {recentSongs && recentSongs.length > 0 && (
            <section className='mb-16'>
              <div className='mb-8 flex items-center justify-between'>
                <h2 className='text-3xl font-bold text-slate-900 dark:text-slate-100'>
                  Recent Releases
                </h2>
                <ClientSideRoute route='/lyrics/recent'>
                  <span className='text-untele transition-colors hover:text-untele/80'>
                    View All →
                  </span>
                </ClientSideRoute>
              </div>

              <div className='rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                <div className='divide-y divide-slate-200 dark:divide-slate-700'>
                  {recentSongs.map((song, index) => {
                    const artworkUrl = getSongArtwork(song);
                    const artworkAlt = getSongArtworkAlt(song);

                    return (
                      <ClientSideRoute key={song._id} route={`/lyrics/${song.slug.current}`}>
                        <div className='group flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700'>
                          <div className='flex h-8 w-8 items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-400'>
                            {index + 1}
                          </div>

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
                            <p className='text-sm text-slate-600 dark:text-slate-400'>
                              {song.primaryArtist.stageName ?? song.primaryArtist.name}
                              {song.featuredArtists && song.featuredArtists.length > 0 && (
                                <span>
                                  {' '}
                                  feat.{' '}
                                  {song.featuredArtists
                                    .map((a) => a.stageName ?? a.name)
                                    .join(', ')}
                                </span>
                              )}
                            </p>
                            {song.album && (
                              <p className='text-xs text-slate-500 dark:text-slate-400'>
                                {song.album.title}
                              </p>
                            )}
                          </div>

                          <div className='text-right text-sm text-slate-500 dark:text-slate-400'>
                            {song.releaseDate && (
                              <div className='flex items-center gap-1'>
                                <Clock className='h-4 w-4' />
                                <span>{formatDate(song.releaseDate)}</span>
                              </div>
                            )}
                          </div>

                          {song.isExplicit && (
                            <div className='rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300'>
                              E
                            </div>
                          )}
                        </div>
                      </ClientSideRoute>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Ad Section */}
          <section className='mb-16'>
            <div className='rounded-lg border border-slate-200 bg-slate-50/50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/50'>
              <BannerAd slot='1357924680' className='mx-auto h-[200px] max-w-4xl' />
            </div>
          </section>

          {/* Call to Action */}
          <section className='rounded-lg bg-gradient-to-r from-untele to-red-700 p-8 text-center text-white'>
            <h2 className='mb-4 text-2xl font-bold'>Are You an Artist?</h2>
            <p className='mb-6 text-white/90'>
              Share your music and lyrics with our community. Get featured and reach new audiences.
            </p>
            <ClientSideRoute route='/support'>
              <button className='rounded-lg bg-white px-6 py-3 font-medium text-untele transition-colors hover:bg-white/90'>
                Submit Your Music
              </button>
            </ClientSideRoute>
          </section>
        </div>
      </main>
    </div>
  );
}

// Data fetching functions
async function getFeaturedSongs(): Promise<Song[]> {
  try {
    const { data } = await sanityFetch({
      query: queryFeaturedSongs,
      tags: ['song'],
    });
    return data as Song[];
  } catch (error) {
    console.error('Failed to fetch featured songs:', error);
    return [];
  }
}

async function getRecentSongs(): Promise<Song[]> {
  try {
    const { data } = await sanityFetch({
      query: queryRecentSongs,
      tags: ['song'],
    });
    return data as Song[];
  } catch (error) {
    console.error('Failed to fetch recent songs:', error);
    return [];
  }
}

async function getFeaturedArtists(): Promise<(MusicArtist & { songCount?: number })[]> {
  try {
    const { data } = await sanityFetch({
      query: queryFeaturedMusicArtists,
      tags: ['musicArtist'],
    });
    return data as (MusicArtist & { songCount?: number })[];
  } catch (error) {
    console.error('Failed to fetch featured artists:', error);
    return [];
  }
}
