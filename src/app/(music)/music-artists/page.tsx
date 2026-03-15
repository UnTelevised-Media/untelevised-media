/* eslint-disable react/function-component-definition */
// src/app/(user)/music-artists/page.tsx
import Image from 'next/image';
import { Metadata } from 'next';
import { BannerAd } from '@/components/ads';

import urlForImage from '@/util/urlForImage';
import ClientSideRoute from '@/components/providers/ClientSideRoute';
import { sanityFetch } from '@/lib/sanity/lib/live';
import { queryAllMusicArtists, queryFeaturedMusicArtists } from '@/lib/sanity/lib/queries';
import { Users, Music, Star, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Music Artists | Discover Talented Musicians',
  description:
    'Explore our roster of talented music artists. Discover new music, read artist biographies, and listen to their latest songs.',
  keywords: 'music artists, musicians, singers, rappers, hip hop, r&b, pop, rock',
  openGraph: {
    title: 'Music Artists | Discover Talented Musicians',
    description: 'Explore our roster of talented music artists',
  },
};

export default async function MusicArtistsPage() {
  const [featuredArtists, allArtists] = await Promise.all([getFeaturedArtists(), getAllArtists()]);

  // Filter out featured artists from all artists to avoid duplication
  const otherArtists = allArtists.filter(
    (artist) => !featuredArtists.some((featured) => featured._id === artist._id)
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-gradient-to-r from-untele to-red-700 py-20'>
        <div className='container mx-auto px-4'>
          <div className='mx-auto max-w-4xl text-center'>
            <div className='mb-6 flex items-center justify-center gap-2 text-white/80'>
              <Users className='h-8 w-8' />
              <span className='text-lg font-medium'>MUSIC ARTISTS</span>
            </div>
            <h1 className='mb-6 text-4xl font-bold text-white md:text-6xl'>
              Discover Talented Artists
            </h1>
            <p className='mb-8 text-xl text-white/90 md:text-2xl'>
              Explore our roster of musicians and their creative journeys
            </p>
            <div className='flex flex-wrap justify-center gap-4 text-sm text-white/80'>
              <div className='flex items-center gap-2'>
                <Star className='h-4 w-4' />
                <span>Featured Artists</span>
              </div>
              <div className='flex items-center gap-2'>
                <Music className='h-4 w-4' />
                <span>Original Music</span>
              </div>
              <div className='flex items-center gap-2'>
                <Users className='h-4 w-4' />
                <span>Diverse Genres</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className='container mx-auto px-4 py-12'>
        <div className='mx-auto max-w-7xl'>
          {/* Featured Artists */}
          {featuredArtists && featuredArtists.length > 0 && (
            <section className='mb-16'>
              <div className='mb-8'>
                <h2 className='mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100'>
                  Featured Artists
                </h2>
                <p className='text-slate-600 dark:text-slate-400'>
                  Spotlight on our most prominent and active artists
                </p>
              </div>

              <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {featuredArtists.map((artist) => (
                  <ClientSideRoute
                    key={artist._id}
                    route={`/music-artists/${artist.slug.current}`}
                  >
                    <div className='group cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800'>
                      <div className='aspect-square overflow-hidden'>
                        {artist.image ? (
                          <Image
                            src={urlForImage(artist.image)?.url() ?? ''}
                            alt={artist.name}
                            width={300}
                            height={300}
                            className='h-full w-full object-cover transition-transform group-hover:scale-105'
                          />
                        ) : (
                          <div className='flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-700'>
                            <Users className='h-16 w-16 text-slate-400' />
                          </div>
                        )}
                      </div>
                      <div className='p-6'>
                        <div className='mb-2 flex items-center gap-2'>
                          <Star className='h-4 w-4 text-yellow-500' />
                          <span className='text-xs font-medium text-yellow-600 dark:text-yellow-400'>
                            FEATURED
                          </span>
                        </div>
                        <h3 className='mb-2 text-lg font-semibold text-slate-900 group-hover:text-untele dark:text-slate-100'>
                          {artist.stageName ?? artist.name}
                        </h3>
                        {artist.stageName && artist.name !== artist.stageName && (
                          <p className='mb-2 text-sm text-slate-500 dark:text-slate-400'>
                            {artist.name}
                          </p>
                        )}
                        <div className='mb-3 flex flex-wrap gap-1'>
                          {artist.genres?.slice(0, 2).map((genre) => (
                            <span
                              key={genre}
                              className='rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                        <div className='flex items-center justify-between text-sm text-slate-500 dark:text-slate-400'>
                          {artist.hometown && (
                            <div className='flex items-center gap-1'>
                              <MapPin className='h-3 w-3' />
                              <span>{artist.hometown}</span>
                            </div>
                          )}
                          {artist.songCount !== undefined && (
                            <span>
                              {artist.songCount} song{artist.songCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </ClientSideRoute>
                ))}
              </div>
            </section>
          )}

          {/* All Artists */}
          {otherArtists && otherArtists.length > 0 && (
            <section className='mb-16'>
              <div className='mb-8'>
                <h2 className='mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100'>
                  All Artists
                </h2>
                <p className='text-slate-600 dark:text-slate-400'>
                  Browse our complete roster of talented musicians
                </p>
              </div>

              <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {otherArtists.map((artist) => (
                  <ClientSideRoute
                    key={artist._id}
                    route={`/music-artists/${artist.slug.current}`}
                  >
                    <div className='group cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800'>
                      <div className='aspect-square overflow-hidden'>
                        {artist.image ? (
                          <Image
                            src={urlForImage(artist.image)?.url() ?? ''}
                            alt={artist.name}
                            width={250}
                            height={250}
                            className='h-full w-full object-cover transition-transform group-hover:scale-105'
                          />
                        ) : (
                          <div className='flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-700'>
                            <Users className='h-12 w-12 text-slate-400' />
                          </div>
                        )}
                      </div>
                      <div className='p-4'>
                        <h3 className='mb-1 text-lg font-semibold text-slate-900 group-hover:text-untele dark:text-slate-100'>
                          {artist.stageName ?? artist.name}
                        </h3>
                        {artist.stageName && artist.name !== artist.stageName && (
                          <p className='mb-2 text-sm text-slate-500 dark:text-slate-400'>
                            {artist.name}
                          </p>
                        )}
                        <div className='mb-2 flex flex-wrap gap-1'>
                          {artist.genres?.slice(0, 2).map((genre) => (
                            <span
                              key={genre}
                              className='rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                        <div className='flex items-center justify-between text-sm text-slate-500 dark:text-slate-400'>
                          {artist.hometown && (
                            <div className='flex items-center gap-1'>
                              <MapPin className='h-3 w-3' />
                              <span className='truncate'>{artist.hometown}</span>
                            </div>
                          )}
                          {artist.debutYear && <span>Since {artist.debutYear}</span>}
                        </div>
                      </div>
                    </div>
                  </ClientSideRoute>
                ))}
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
            <h2 className='mb-4 text-2xl font-bold'>Join Our Artist Community</h2>
            <p className='mb-6 text-white/90'>
              Are you a talented musician looking to share your art? Join our platform and connect
              with music lovers worldwide.
            </p>
            <div className='flex flex-wrap justify-center gap-4'>
              <ClientSideRoute route='/join'>
                <button className='rounded-lg bg-white px-6 py-3 font-medium text-untele transition-colors hover:bg-white/90'>
                  Apply to Join
                </button>
              </ClientSideRoute>
              <ClientSideRoute route='/lyrics'>
                <button className='rounded-lg border border-white px-6 py-3 font-medium text-white transition-colors hover:bg-white/10'>
                  Browse Lyrics
                </button>
              </ClientSideRoute>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// Data fetching functions
async function getFeaturedArtists(): Promise<(MusicArtist & { songCount?: number })[]> {
  try {
    const { data } = await sanityFetch({
      query: queryFeaturedMusicArtists,
      tags: ['musicArtist'],
    });
    return data;
  } catch (error) {
    console.error('Failed to fetch featured artists:', error);
    return [];
  }
}

async function getAllArtists(): Promise<MusicArtist[]> {
  try {
    const { data } = await sanityFetch({
      query: queryAllMusicArtists,
      tags: ['musicArtist'],
    });
    return data;
  } catch (error) {
    console.error('Failed to fetch all artists:', error);
    return [];
  }
}
