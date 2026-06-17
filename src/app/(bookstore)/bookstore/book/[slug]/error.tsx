'use client';

export default function BookDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className='mx-auto max-w-7xl px-4 py-16 text-center'>
      <h1 className='mb-4 text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
        Something went wrong
      </h1>
      <p className='mb-6 text-sm text-slate-600 dark:text-slate-400'>
        {error.message ?? 'An unexpected error occurred loading this page.'}
      </p>
      <button
        onClick={reset}
        className='bg-untele px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-red-600'
      >
        Try again
      </button>
    </main>
  );
}
