// src/util/getSongArtwork.ts
import type { Song } from '@/models/types/sanity';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any — Album can be a reference or populated object from Sanity GROQ query results
  if ((song.album as any)?.albumArt) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any — Runtime album structure varies by query expansion
    return urlForImage((song.album as any)?.albumArt)?.url() ?? null;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any — Album structure varies: reference vs. populated object
  if ((song.album as any)?.albumArt?.alt) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any — Dynamic album nesting based on GROQ expansion
    return (song.album as any)?.albumArt?.alt ?? '';
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
  } else if (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any — Album reference vs. populated object based on query context
    (song.album as any)?.albumArt
  ) {
    source = 'album';
  }

  return {
    url,
    alt,
    isTrackArt,
    source,
  };
}
