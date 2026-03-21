'use client';

import { useState } from 'react';

import { liteClient as algoliasearch } from 'algoliasearch/lite';
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

// ── Algolia search client (lite = read-only, safe for client bundle) ──────────
const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!,
);

// ── Types ─────────────────────────────────────────────────────────────────────
interface ArticleHitData {
  objectID: string;
  title: string;
  description: string;
  author: string;
  categories: string[];
  publishedAt: number;
  imageUrl: string;
}

// ── Hit card component ────────────────────────────────────────────────────────
function ArticleHit({ hit }: { hit: ArticleHitData }) {
  const date =
    hit.publishedAt
      ? new Date(hit.publishedAt * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null;

  return (
    <article className="border border-border hover:border-untele flex gap-4 p-4 transition-colors duration-200">
      {hit.imageUrl && (
        <a
          href={`/articles/${hit.objectID}`}
          className="hidden shrink-0 sm:block"
          aria-hidden="true"
          tabIndex={-1}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hit.imageUrl}
            alt=""
            className="h-20 w-28 object-cover"
            loading="lazy"
          />
        </a>
      )}
      <div className="min-w-0 flex-1">
        <a href={`/articles/${hit.objectID}`} className="group block">
          <h3 className="group-hover:text-untele text-sm font-bold leading-snug tracking-wide transition-colors duration-150 sm:text-base">
            <Highlight attribute="title" hit={hit} classNames={{ highlighted: 'bg-untele/20 text-untele' }} />
          </h3>
        </a>

        {hit.description && (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
            <Highlight
              attribute="description"
              hit={hit}
              classNames={{ highlighted: 'bg-untele/20 text-untele' }}
            />
          </p>
        )}

        <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-widest">
          {hit.author && <span>{hit.author}</span>}
          {hit.categories?.[0] && (
            <span className="text-untele font-bold">{hit.categories[0]}</span>
          )}
          {date && <span>{date}</span>}
        </div>
      </div>
    </article>
  );
}

// ── No Results component ──────────────────────────────────────────────────────
function NoResults() {
  const { indexUiState } = useInstantSearch();
  if (!indexUiState.query) return null;

  return (
    <div className="border border-border px-6 py-12 text-center">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        No results for{' '}
        <span className="text-foreground font-bold">&ldquo;{indexUiState.query}&rdquo;</span>
      </p>
    </div>
  );
}

// ── Refinement label ──────────────────────────────────────────────────────────
function RefinementSection({ attribute, label }: { attribute: string; label: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase tracking-widest">{label}</p>
      <RefinementList
        attribute={attribute}
        classNames={{
          root: 'text-xs',
          list: 'space-y-1',
          item: 'flex items-center gap-2 cursor-pointer group',
          selectedItem: 'font-bold',
          checkbox:
            'accent-untele h-3 w-3 cursor-pointer rounded-none border border-border',
          label: 'cursor-pointer group-hover:text-untele transition-colors tracking-wide uppercase',
          count:
            'ml-auto text-[10px] text-muted-foreground',
        }}
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <InstantSearch searchClient={searchClient} indexName="untele_articles" future={{ preserveSharedStateOnUnmount: true }}>
      {/* Header bar */}
      <div className="bg-untele mb-6 flex items-center gap-3 px-4 py-3">
        <Search className="h-4 w-4 text-white" aria-hidden="true" />
        <h1 className="text-xs font-black uppercase tracking-widest text-white">Search</h1>
      </div>

      {/* Search input */}
      <div className="mb-6 px-4 sm:px-0">
        <SearchBox
          placeholder="Search articles, topics, investigations…"
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

      {/* Mobile filter toggle */}
      <div className="mb-4 px-4 sm:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="border border-border px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors hover:border-untele"
        >
          {filtersOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Body: sidebar + results */}
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
        {/* Sidebar / filters */}
        <aside
          className={`w-full shrink-0 sm:block sm:w-52 ${filtersOpen ? 'block' : 'hidden'}`}
        >
          <div className="border border-border p-4">
            <div className="bg-untele mb-4 px-2 py-1">
              <p className="text-xs font-black uppercase tracking-widest text-white">Filters</p>
            </div>
            <div className="space-y-6">
              <RefinementSection attribute="categories" label="Category" />
              <RefinementSection attribute="author" label="Author" />
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="min-w-0 flex-1">
          <NoResults />
          <div className="space-y-0 divide-y divide-border">
            <Hits
              hitComponent={ArticleHit as React.ComponentType<{ hit: object }>}
              classNames={{ root: '', list: 'space-y-0', item: '' }}
            />
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
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
