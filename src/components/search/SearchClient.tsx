'use client';

import { useState } from 'react';
import Link from 'next/link';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import type { Hit } from 'instantsearch.js';
import {
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
  useInstantSearch,
} from 'react-instantsearch';
import { Search } from 'lucide-react';

const _algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const _algoliaApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;

// Wrap search to catch network failures (ad blockers, firewalls) and return empty
// results instead of an unhandled rejection that bubbles to Sentry as noise.
const searchClient =
  _algoliaAppId && _algoliaApiKey
    ? (() => {
        const client = algoliasearch(_algoliaAppId, _algoliaApiKey);
        return {
          ...client,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          search: async (requests: any) => {
            try {
              return await client.search(requests);
            } catch {
              const count = Array.isArray(requests) ? requests.length : 1;
              return {
                results: Array.from({ length: count }, () => ({
                  hits: [],
                  nbHits: 0,
                  page: 0,
                  nbPages: 0,
                  hitsPerPage: 20,
                  processingTimeMS: 0,
                  query: '',
                  params: '',
                  exhaustiveNbHits: true,
                })),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any;
            }
          },
        };
      })()
    : null;

interface ArticleHitFields {
  title: string;
  description: string;
  author: string;
  categories: string[];
  tags: string[];
  publishedAt: number;
  imageUrl: string;
}

type ArticleHit = Hit<ArticleHitFields>;

function ArticleHitCard({ hit }: { hit: ArticleHit }) {
  const date = hit.publishedAt
    ? new Date(hit.publishedAt * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <article className='flex gap-4 border border-border p-4 transition-colors duration-200 hover:border-untele'>
      {hit.imageUrl && (
        <Link
          href={'/articles/' + hit.objectID}
          className='hidden shrink-0 sm:block'
          aria-hidden='true'
          tabIndex={-1}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hit.imageUrl}
            alt={hit.title}
            className='h-20 w-28 object-cover'
            loading='lazy'
          />
        </Link>
      )}
      <div className='min-w-0 flex-1'>
        <Link href={'/articles/' + hit.objectID} className='group block'>
          <h3 className='text-sm font-bold leading-snug tracking-wide transition-colors duration-150 group-hover:text-untele sm:text-base'>
            <Highlight
              attribute='title'
              hit={hit}
              classNames={{ highlighted: 'bg-untele/20 text-untele' }}
            />
          </h3>
        </Link>
        {hit.description && (
          <p className='mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
            <Highlight
              attribute='description'
              hit={hit}
              classNames={{ highlighted: 'bg-untele/20 text-untele' }}
            />
          </p>
        )}
        <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-muted-foreground'>
          {hit.author && <span>{hit.author}</span>}
          {hit.categories?.[0] && (
            <span className='font-bold text-untele'>{hit.categories[0]}</span>
          )}
          {date && <span>{date}</span>}
        </div>
      </div>
    </article>
  );
}

function NoResults() {
  const { indexUiState } = useInstantSearch();
  if (!indexUiState.query) return null;
  return (
    <div className='border border-border px-6 py-12 text-center'>
      <p className='text-sm uppercase tracking-widest text-muted-foreground'>
        No results for{' '}
        <span className='font-bold text-foreground'>&ldquo;{indexUiState.query}&rdquo;</span>
      </p>
    </div>
  );
}

function RefinementSection({ attribute, label }: { attribute: string; label: string }) {
  return (
    <div>
      <p className='mb-2 text-xs font-black uppercase tracking-widest'>{label}</p>
      <RefinementList
        attribute={attribute}
        classNames={{
          root: 'text-xs',
          list: 'space-y-1',
          item: 'flex items-center gap-2 cursor-pointer group',
          selectedItem: 'font-bold',
          checkbox: 'accent-untele h-3 w-3 cursor-pointer rounded-none border border-border',
          label:
            'cursor-pointer group-hover:text-untele transition-colors tracking-wide uppercase',
          count: 'ml-auto text-[10px] text-muted-foreground',
        }}
      />
    </div>
  );
}

export default function SearchClient({ initialQuery = '' }: { initialQuery?: string }) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  if (!searchClient) {
    return (
      <div className='border border-border px-6 py-12 text-center'>
        <p className='text-sm uppercase tracking-widest text-muted-foreground'>
          Search unavailable
        </p>
      </div>
    );
  }

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName='untele_articles'
      initialUiState={{ untele_articles: { query: initialQuery } }}
      routing={{
        router: {
          read() {
            if (typeof window === 'undefined') return { q: '' };
            return { q: new URLSearchParams(window.location.search).get('q') ?? '' };
          },
          write(routeState) {
            const url = new URL(window.location.href);
            if (routeState.q) {
              url.searchParams.set('q', String(routeState.q));
            } else {
              url.searchParams.delete('q');
            }
            window.history.replaceState({}, '', url.toString());
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          createURL(options: any) {
            const url = new URL(window.location.href);
            const q = options?.routeState?.q ?? options?.q;
            if (q) url.searchParams.set('q', String(q));
            return url.toString();
          },
          onUpdate() {},
          dispose() {},
        },
        stateMapping: {
          stateToRoute(uiState) {
            return { q: uiState['untele_articles']?.query ?? '' };
          },
          routeToState(routeState) {
            return { untele_articles: { query: (routeState as { q?: string }).q ?? '' } };
          },
        },
      }}
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <div className='mb-6 flex items-center gap-3 bg-untele px-4 py-3'>
        <Search className='h-4 w-4 text-white' aria-hidden='true' />
        <h1 className='text-xs font-black uppercase tracking-widest text-white'>Search</h1>
      </div>
      <div className='mb-6'>
        <SearchBox
          placeholder='Search articles, topics, investigations...'
          classNames={{
            root: 'relative',
            form: 'flex gap-2',
            input:
              'flex-1 border border-border bg-background px-4 py-2 text-sm tracking-wide placeholder:text-muted-foreground focus:border-untele focus:outline-none transition-colors',
            submit:
              'bg-untele px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:opacity-90 transition-opacity',
            submitIcon: 'h-4 w-4',
            reset: 'hidden',
            resetIcon: 'hidden',
            loadingIndicator: 'hidden',
          }}
        />
      </div>
      <div className='mb-4 sm:hidden'>
        <button
          type='button'
          onClick={() => setFiltersOpen((v) => !v)}
          className='border border-border px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors hover:border-untele'
        >
          {filtersOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      <div className='flex flex-col gap-8 sm:flex-row sm:items-start'>
        <aside
          className={'w-full shrink-0 sm:block sm:w-52 ' + (filtersOpen ? 'block' : 'hidden')}
        >
          <div className='border border-border p-4'>
            <div className='mb-4 bg-untele px-2 py-1'>
              <p className='text-xs font-black uppercase tracking-widest text-white'>Filters</p>
            </div>
            <div className='space-y-6'>
              <RefinementSection attribute='categories' label='Category' />
              <RefinementSection attribute='tags' label='Tag' />
              <RefinementSection attribute='author' label='Author' />
            </div>
          </div>
        </aside>
        <main className='min-w-0 flex-1'>
          <NoResults />
          <div className='divide-y divide-border'>
            <Hits<ArticleHitFields>
              hitComponent={ArticleHitCard}
              classNames={{ root: '', list: 'space-y-0', item: '' }}
            />
          </div>
          <div className='mt-8 flex justify-center'>
            <Pagination
              classNames={{
                root: '',
                list: 'flex items-center gap-1',
                item: '',
                link: 'border border-border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-untele hover:text-white hover:border-untele',
                selectedItem: '[&>a]:bg-untele [&>a]:text-white [&>a]:border-untele',
                disabledItem: 'opacity-30 pointer-events-none',
              }}
            />
          </div>
        </main>
      </div>
    </InstantSearch>
  );
}
