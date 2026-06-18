// src/components/seo/StructuredData.tsx
// Note: plain <script> tags are correct for inline JSON-LD in RSC. next/script is for third-party loading strategies.
import type { Song, MusicArtist, Album } from '#/sanity.types';
import { getSongArtwork } from '@/util/getSongArtwork';

interface SongStructuredDataProps {
  song: Song;
}

interface ArtistStructuredDataProps {
  artist: MusicArtist;
  songs?: Song[];
}

interface AlbumStructuredDataProps {
  album: Album;
  songs?: Song[];
}

function SongStructuredData({ song }: SongStructuredDataProps) {
  const artistNames = [
    (song.primaryArtist as any)?.stageName ?? (song.primaryArtist as any)?.name,
    ...(song.featuredArtists?.map((artist: any) => artist?.stageName ?? artist?.name) ?? []),
  ].filter(Boolean);

  const artworkUrl = getSongArtwork(song);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: song.title,
    byArtist: artistNames.map((name) => ({
      '@type': 'MusicGroup',
      name: name,
    })),
    inAlbum: song.album
      ? {
          '@type': 'MusicAlbum',
          name: (song.album as any)?.title,
          albumReleaseType: (song.album as any)?.albumType,
          datePublished: (song.album as any)?.releaseDate,
        }
      : undefined,
    datePublished: song.releaseDate,
    duration: song.duration ? `PT${song.duration.replace(':', 'M')}S` : undefined,
    genre: song.genres,
    recordLabel: song.recordLabel,
    isExplicitContent: song.isExplicit,
    image: artworkUrl,
    lyrics: {
      '@type': 'CreativeWork',
      text: song.lyrics,
    },
    url: `https://www.untelevised.media/lyrics/${song.slug?.current ?? ''}`,
  };

  return (
    <script
      id={`song-structured-data-${song._id}`}
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    ></script>
  );
}

function ArtistStructuredData({ artist, songs }: ArtistStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: artist.stageName ?? artist.name,
    alternateName: artist.stageName && artist.name !== artist.stageName ? artist.name : undefined,
    description: artist.bio ? 'Music artist and performer' : undefined,
    genre: artist.genres,
    foundingDate: artist.debutYear ? `${artist.debutYear}-01-01` : undefined,
    foundingLocation: artist.hometown
      ? {
          '@type': 'Place',
          name: artist.hometown,
        }
      : undefined,
    recordLabel: artist.recordLabel,
    url: `https://www.untelevised.media/music-artists/${artist.slug?.current ?? ''}`,
    sameAs: [
      artist.website,
      artist.socialMedia?.spotify,
      artist.socialMedia?.youtube,
      artist.socialMedia?.instagram
        ? `https://instagram.com/${artist.socialMedia.instagram}`
        : undefined,
      artist.socialMedia?.twitter
        ? `https://twitter.com/${artist.socialMedia.twitter}`
        : undefined,
      artist.socialMedia?.facebook,
    ].filter(Boolean),
    track: songs?.map((song: any) => ({
      '@type': 'MusicRecording',
      name: song.title,
      url: `https://www.untelevised.media/lyrics/${song.slug?.current ?? ''}`,
    })),
  };

  return (
    <script
      id={`artist-structured-data-${artist._id}`}
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    ></script>
  );
}

function AlbumStructuredData({ album, songs }: AlbumStructuredDataProps) {
  const artistNames = [
    (album.artist as any)?.stageName ?? (album.artist as any)?.name,
    ...(album.featuredArtists?.map((artist: any) => artist?.stageName ?? artist?.name) ?? []),
  ].filter(Boolean);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: album.title,
    byArtist: artistNames.map((name) => ({
      '@type': 'MusicGroup',
      name: name,
    })),
    albumReleaseType: album.albumType,
    datePublished: album.releaseDate,
    genre: album.genres,
    recordLabel: album.recordLabel,
    numTracks: album.totalTracks,
    duration: album.duration ? `PT${album.duration.replace(':', 'M')}S` : undefined,
    producer: album.producer?.map((producer) => ({
      '@type': 'Person',
      name: producer,
    })),
    track: songs?.map((song: any, index) => ({
      '@type': 'MusicRecording',
      name: song.title,
      position: song.trackNumber ?? index + 1,
      url: `https://www.untelevised.media/lyrics/${song.slug?.current ?? ''}`,
      duration: song.duration ? `PT${song.duration.replace(':', 'M')}S` : undefined,
    })),
    url: `https://www.untelevised.media/albums/${album.slug?.current ?? ''}`,
  };

  return (
    <script
      id={`album-structured-data-${album._id}`}
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    ></script>
  );
}

function MusicWebsiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Untelevised Media - Music & Lyrics',
    description:
      'Discover song lyrics and music from talented artists. Read lyrics, learn about artists, and explore original music content.',
    url: 'https://www.untelevised.media',
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.untelevised.media/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Untelevised Media',
      url: 'https://www.untelevised.media',
    },
  };

  return (
    <script
      id='music-website-structured-data'
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    ></script>
  );
}

function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      id='breadcrumb-structured-data'
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    ></script>
  );
}

export default SongStructuredData;
export { ArtistStructuredData, AlbumStructuredData, MusicWebsiteStructuredData, BreadcrumbStructuredData };
