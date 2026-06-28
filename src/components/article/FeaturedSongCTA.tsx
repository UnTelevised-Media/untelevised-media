import Image from 'next/image';
import Link from 'next/link';
import urlForImage from '@/util/url/urlForImage';

interface FeaturedSongCTAProps {
  song: {
    _id?: string;
    title?: string;
    slug?: { current?: string } | string;
    primaryArtist?: { name?: string };
    trackArt?: { asset?: { _ref: string }; alt?: string };
  };
}

export default function FeaturedSongCTA({ song }: FeaturedSongCTAProps) {
  if (!song?.title || !song?.slug) {
    return null;
  }

  const slugStr = typeof song.slug === 'string' ? song.slug : song.slug.current;
  if (!slugStr) {
    return null;
  }

  const art = song.trackArt?.asset
    ? urlForImage(song.trackArt).width(300).height(300).url()
    : null;

  return (
    <div className='flex flex-col border border-slate-300 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-slate-700 dark:from-slate-950 dark:to-black'>
      {/* Track Art */}
      <div className='relative aspect-square w-full overflow-hidden border border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800'>
        {art ? (
          <Image
            src={art}
            alt={song.trackArt?.alt ?? song.title ?? 'Track art'}
            fill
            className='object-cover'
            sizes='(max-width: 1024px) 100vw, 22vw'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-slate-300 dark:bg-slate-700'>
            <span className='text-center text-xs font-semibold text-slate-600 dark:text-slate-400'>
              {song.title}
            </span>
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className='flex flex-1 flex-col'>
        <h3 className='mb-1 mt-4 line-clamp-2 text-sm font-black uppercase leading-tight tracking-wide text-slate-900 dark:text-white'>
          {song.title}
        </h3>
        {song.primaryArtist?.name && (
          <p className='mb-4 text-xs text-slate-600 dark:text-slate-400'>{song.primaryArtist.name}</p>
        )}

        {/* Buttons */}
        <div className='mt-auto flex flex-col gap-2'>
          <Link
            href={`/lyrics/${slugStr}`}
            className='flex items-center justify-center border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-900 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800'
          >
            View Lyrics
          </Link>
          <Link
            href={`/music-artists/${song.primaryArtist?.name?.toLowerCase().replace(/\s+/g, '-')}`}
            className='flex items-center justify-center bg-untele px-3 py-2 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-red-700'
          >
            Artist
          </Link>
        </div>
      </div>
    </div>
  );
}
