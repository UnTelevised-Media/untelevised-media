import Link from 'next/link';

interface Props {
  headline: string;
  linkUrl?: string;
  linkLabel: string;
}

export default function LatestAlertsTicker({ headline, linkUrl, linkLabel }: Props) {
  const isExternal = linkUrl?.startsWith('http');

  return (
    <div
      role='alert'
      aria-label='Latest alert'
      className='w-full border-b-2 border-red-800 bg-untele'
    >
      <div className='mx-auto flex max-w-[1400px] items-center px-4'>
        {/* Alert indicator - left block with right border */}
        <div className='flex shrink-0 items-center gap-2 border-r border-white/25 py-2.5 pr-4'>
          <span className='h-2 w-2 animate-pulse rounded-full bg-white' aria-hidden='true' />
          <span className='text-[11px] font-black uppercase tracking-[0.2em] text-white'>
            Alert
          </span>
        </div>

        {/* Headline - flexible middle */}
        <p className='mx-4 flex-1 truncate text-sm font-bold leading-snug text-white'>
          {headline}
        </p>

        {/* CTA - right side */}
        {linkUrl &&
          (isExternal ? (
            <a
              href={linkUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='flex shrink-0 border border-white/50 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-untele'
            >
              {linkLabel} →
            </a>
          ) : (
            <Link
              href={linkUrl}
              className='flex shrink-0 border border-white/50 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-untele'
            >
              {linkLabel} →
            </Link>
          ))}
      </div>
    </div>
  );
}
