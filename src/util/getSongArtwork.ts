// src/util/getSongArtwork.ts
import urlForImage from './urlForImage';

/**
 * Gets the appropriate artwork for a song, with fallback logic:
 * 1. Use track artwork if available
 * 2. Fallback to album artwork if track artwork is not available
 * 3. Return null if neither is available
 */
export function getSongArtwork(song: Song): string | null {
  // First try to use track artwork
  if (song.trackArt) {
    return urlForImage(song.trackArt)?.url() ?? null;
  }

  // Fallback to album artwork
  if (song.album?.albumArt) {
    return urlForImage(song.album.albumArt)?.url() ?? null;
  }

  // No artwork available
  return null;
}

/**
 * Gets the alt text for song artwork
 */
export function getSongArtworkAlt(song: Song): string {
  // Use track art alt text if available
  if (song.trackArt?.alt) {
    return song.trackArt.alt;
  }

  // Fallback to album art alt text
  if (song.album?.albumArt?.alt) {
    return song.album.albumArt.alt;
  }

  // Default alt text
  return `${song.title} artwork`;
}

/**
 * Determines if the song is using track artwork (true) or album artwork (false)
 */
export function isUsingTrackArtwork(song: Song): boolean {
  return !!song.trackArt;
}

/**
 * Gets artwork info with metadata about the source
 */
export function getSongArtworkInfo(song: Song): {
  url: string | null;
  alt: string;
  isTrackArt: boolean;
  source: 'track' | 'album' | 'none';
} {
  const url = getSongArtwork(song);
  const alt = getSongArtworkAlt(song);
  const isTrackArt = isUsingTrackArtwork(song);

  let source: 'track' | 'album' | 'none' = 'none';
  if (song.trackArt) {
    source = 'track';
  } else if (song.album?.albumArt) {
    source = 'album';
  }

  return {
    url,
    alt,
    isTrackArt,
    source,
  };
}
