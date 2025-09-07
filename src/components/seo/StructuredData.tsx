// src/components/seo/StructuredData.tsx
import Script from 'next/script';
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

export const SongStructuredData = ({ song }: SongStructuredDataProps) => {
  const artistNames = [
    song.primaryArtist.stageName ?? song.primaryArtist.name,
    ...(song.featuredArtists?.map((artist) => artist.stageName ?? artist.name) ?? []),
  ];

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
          name: song.album.title,
          albumReleaseType: song.album.albumType,
          datePublished: song.album.releaseDate,
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
    url: `https://www.untelevised.media/lyrics/${song.slug.current}`,
  };

  return (
    <Script
      id={`song-structured-data-${song._id}`}
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
};

export const ArtistStructuredData = ({ artist, songs }: ArtistStructuredDataProps) => {
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
    url: `https://www.untelevised.media/music-artists/${artist.slug.current}`,
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
    track: songs?.map((song) => ({
      '@type': 'MusicRecording',
      name: song.title,
      url: `https://www.untelevised.media/lyrics/${song.slug.current}`,
    })),
  };

  return (
    <Script
      id={`artist-structured-data-${artist._id}`}
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
};

export const AlbumStructuredData = ({ album, songs }: AlbumStructuredDataProps) => {
  const artistNames = [
    album.artist.stageName ?? album.artist.name,
    ...(album.featuredArtists?.map((artist) => artist.stageName ?? artist.name) ?? []),
  ];

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
    track: songs?.map((song, index) => ({
      '@type': 'MusicRecording',
      name: song.title,
      position: song.trackNumber || index + 1,
      url: `https://www.untelevised.media/lyrics/${song.slug.current}`,
      duration: song.duration ? `PT${song.duration.replace(':', 'M')}S` : undefined,
    })),
    url: `https://www.untelevised.media/albums/${album.slug.current}`,
  };

  return (
    <Script
      id={`album-structured-data-${album._id}`}
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
};

export const MusicWebsiteStructuredData = () => {
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
    <Script
      id='music-website-structured-data'
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
};

export const BreadcrumbStructuredData = ({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) => {
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
    <Script
      id='breadcrumb-structured-data'
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
};
