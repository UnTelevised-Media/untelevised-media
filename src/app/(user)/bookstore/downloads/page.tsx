'use client';
// src/app/(user)/bookstore/downloads/page.tsx
// Digital download vault — authenticated, lists all digital purchases with download buttons.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useConsentAwareTracking } from '@/components/analytics/ConsentAwareAnalytics';

interface DownloadRecord {
  id: string;
  order_item_id: string;
  download_count: number;
  max_downloads: number;
  expires_at: string | null;
  supabase_storage_path: string;
  order_items: {
    book_title: string;
    format_label: string;
    order_id: string;
  } | null;
}

function DownloadButton({
  orderItemId,
  bookTitle,
  formatLabel,
}: {
  orderItemId: string;
  bookTitle: string;
  formatLabel: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackEvent } = useConsentAwareTracking();

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookstore/download?order_item_id=${orderItemId}`);
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Download failed');
        return;
      }
      trackEvent('download_file', { book_title: bookTitle, format: formatLabel });
      window.location.href = data.url;
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className='bg-untele px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
      >
        {loading ? 'Generating...' : 'Download'}
      </button>
      {error && <p className='mt-1 text-[10px] text-red-500'>{error}</p>}
    </div>
  );
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackEvent } = useConsentAwareTracking();

  useEffect(() => {
    fetch('/api/bookstore/my-downloads')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load downloads');
        const data = (await res.json()) as { downloads: DownloadRecord[] };
        const items = data.downloads ?? [];
        setDownloads(items);
        trackEvent('view_downloads', { download_count: items.length });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [trackEvent]);

  return (
    <main className='mx-auto max-w-4xl px-4 py-8 sm:px-6'>
      <div className='mb-6 flex items-center gap-3'>
        <div className='bg-untele px-3 py-1'>
          <span className='text-sm font-black uppercase tracking-widest text-white'>
            Download Vault
          </span>
        </div>
        <div className='h-px flex-1 bg-slate-200 dark:bg-slate-800' />
      </div>

      {loading && (
        <p className='text-sm text-slate-500'>Loading your downloads...</p>
      )}

      {error && (
        <div className='border border-red-200 bg-red-50 px-4 py-3'>
          <p className='text-sm text-red-700'>{error}</p>
          <Link href='/sign-in' className='text-xs text-untele hover:underline'>
            Sign in to view downloads
          </Link>
        </div>
      )}

      {!loading && !error && downloads.length === 0 && (
        <div className='border border-slate-200 bg-white px-4 py-12 text-center dark:border-slate-700 dark:bg-slate-900'>
          <p className='mb-4 text-xs font-bold uppercase tracking-widest text-slate-400'>
            No digital purchases yet
          </p>
          <Link
            href='/bookstore'
            className='inline-block bg-untele px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:opacity-90'
          >
            Browse Books
          </Link>
        </div>
      )}

      {!loading && downloads.length > 0 && (
        <div className='flex flex-col gap-3'>
          {downloads.map((dl) => {
            const expired = dl.expires_at ? new Date(dl.expires_at) < new Date() : false;
            const exhausted = dl.download_count >= dl.max_downloads;
            const available = !expired && !exhausted && !!dl.supabase_storage_path;

            return (
              <div
                key={dl.id}
                className='flex flex-col gap-3 border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between'
              >
                <div>
                  <p className='text-sm font-black text-slate-900 dark:text-white'>
                    {dl.order_items?.book_title ?? 'Unknown Book'}
                  </p>
                  <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                    {dl.order_items?.format_label ?? 'Digital'}
                  </p>
                  <p className='mt-1 text-[10px] text-slate-400'>
                    {dl.download_count} / {dl.max_downloads} downloads used
                    {dl.expires_at && (
                      <>
                        {' · '}
                        Expires {new Date(dl.expires_at).toLocaleDateString()}
                      </>
                    )}
                  </p>
                  {expired && (
                    <p className='text-[10px] font-bold text-slate-400'>Download expired</p>
                  )}
                  {exhausted && !expired && (
                    <p className='text-[10px] font-bold text-slate-400'>Download limit reached</p>
                  )}
                  {!dl.supabase_storage_path && !expired && !exhausted && (
                    <p className='text-[10px] text-amber-500'>File being prepared — check back soon</p>
                  )}
                </div>
                {available && (
                  <DownloadButton
                    orderItemId={dl.order_item_id}
                    bookTitle={dl.order_items?.book_title ?? 'Unknown'}
                    formatLabel={dl.order_items?.format_label ?? 'digital'}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
