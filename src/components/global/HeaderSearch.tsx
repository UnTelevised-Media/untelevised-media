'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { InstantSearch, useSearchBox, useHits } from 'react-instantsearch';
import type { Hit } from 'instantsearch.js';

const _appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const _apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;

// Wrap search() so that CSP blocks, ad-blockers, and network failures degrade
// to an empty dropdown instead of an unhandled RetryError surfacing in Sentry.
const searchClient = _appId && _apiKey
  ? (() => {
      const client = algoliasearch(_appId, _apiKey);
      return {
        ...client,
        search: async (requests: Parameters<typeof client.search>[0]) => {
          try {
            return await client.search(requests);
          } catch {
            const count = Array.isArray(requests) ? requests.length : 1;
            return {
              results: Array.from({ length: count }, () => ({
                hits: [], nbHits: 0, page: 0, nbPages: 0,
                hitsPerPage: 6, processingTimeMS: 0, query: '', params: '',
                exhaustiveNbHits: true,
              })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
          }
        },
      };
    })()
  : null;

interface HitFields {
  title: string;
  categories: string[];
  author: string;
}

const DEBOUNCE_MS = 300;

function SearchInner({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { query, refine } = useSearchBox({
    queryHook(newQuery, search) {
      // Skip the automatic empty query fired on mount — no visible result anyway.
      if (!newQuery) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => search(newQuery), DEBOUNCE_MS);
    },
  });
  const { hits } = useHits<HitFields>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const showDropdown = query.length > 1 && hits.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative mx-auto max-w-[1400px]">
      <div className="relative flex items-center">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-untele/20 to-red-400/20 blur" />
        <div className="relative flex w-full items-center">
          <MagnifyingGlassIcon className="absolute left-4 h-5 w-5 text-slate-600 dark:text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => refine(e.target.value)}
            placeholder="Search breaking news, investigations, live coverage..."
            className="w-full rounded-lg border border-slate-400 bg-slate-200/90 py-4 pl-12 pr-28 text-slate-900 placeholder-slate-600 backdrop-blur-sm focus:border-untele focus:outline-none focus:ring-2 focus:ring-untele/50 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder-slate-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => refine('')}
              className="absolute right-24 p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              aria-label="Clear"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 rounded-md bg-untele px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-untele/90"
          >
            Search
          </button>
        </div>
      </div>

      {/* Browse search page link — always visible when input is open */}
      <div className="mt-2 flex justify-end">
        <Link
          href={query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search'}
          onClick={onClose}
          className="text-xs font-bold uppercase tracking-widest text-untele hover:underline"
        >
          Browse all articles →
        </Link>
      </div>

      {/* Live results dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-[9999] mt-1 border border-slate-400 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-900">
          {hits.slice(0, 6).map((hit: Hit<HitFields>) => (
            <Link
              key={hit.objectID}
              href={`/articles/${hit.objectID}`}
              onClick={onClose}
              className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 last:border-0 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <MagnifyingGlassIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <div className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">
                  {hit.title}
                </span>
                {hit.categories?.[0] && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-untele">
                    {hit.categories[0]}
                  </span>
                )}
              </div>
            </Link>
          ))}
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={onClose}
            className="flex items-center gap-2 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-untele hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
          >
            <MagnifyingGlassIcon className="h-3.5 w-3.5" />
            See all results for &ldquo;{query}&rdquo;
          </Link>
        </div>
      )}
    </form>
  );
}

export default function HeaderSearch({ onClose }: { onClose: () => void }) {
  if (!searchClient) return null;
  return (
    <InstantSearch searchClient={searchClient} indexName="untele_articles">
      <SearchInner onClose={onClose} />
    </InstantSearch>
  );
}
