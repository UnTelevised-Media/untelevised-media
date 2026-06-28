import Link from 'next/link';

export default function SupportCTA() {
  return (
    <Link href='/support'>
      <div className='flex h-full flex-col border border-slate-300 bg-gradient-to-br from-slate-50 to-white p-6 transition-all hover:border-untele dark:border-slate-700 dark:from-slate-950 dark:to-black'>
        <div className='mb-4 flex h-10 w-10 items-center justify-center bg-untele text-sm font-black text-white'>
          ❤️
        </div>
        <h3 className='mb-2 text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white'>
          Support The Mission
        </h3>
        <p className='flex-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300'>
          Fund fearless, independent journalism. Your support keeps us uncensored and uncompromising.
        </p>
        <div className='mt-4 text-xs font-black uppercase tracking-widest text-untele transition-colors group-hover:text-red-600'>
          Learn More →
        </div>
      </div>
    </Link>
  );
}
