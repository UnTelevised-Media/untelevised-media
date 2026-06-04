'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { List, LayoutGrid } from 'lucide-react';
import { VerdictBadge } from './VerdictBadge';
import { VERDICT_CONFIG, type FactCheckRating } from '@/lib/factCheck/verdictConfig';
import formatDate from '@/util/formatDate';
import urlForImage from '@/util/urlForImage';
import { InFeedAd, AD_CONFIG } from '@/components/ads';

export interface FactCheckSummary {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  claim: string;
  claimSource?: string;
  rating: FactCheckRating;
  ratingExplanation: string;
  mainImage?: { asset: { _ref: string }; alt?: string };
  author?: { name: string; slug: { current: string } };
}

interface Props {
  factChecks: FactCheckSummary[];
}

type View = 'list' | 'cards';

export default function FactCheckList({ factChecks }: Props) {
  const [view, setView] = useState<View>('list');

  if (!factChecks || factChecks.length === 0) {
    return <p className='text-sm text-neutral-500'>No fact-checks published yet.</p>;
  }

  return (
    <div>
      {/* View toggle */}
      <div className='mb-6 flex justify-end gap-1'>
        <button
          onClick={() => setView('list')}
          aria-label='List view'
          aria-pressed={view === 'list'}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-colors ${
            view === 'list'
              ? 'bg-[#D70606] text-white'
              : 'border border-neutral-300 text-neutral-500 hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white'
          }`}
        >
          <List className='h-3.5 w-3.5' />
          List
        </button>
        <button
          onClick={() => setView('cards')}
          aria-label='Cards view'
          aria-pressed={view === 'cards'}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-colors ${
            view === 'cards'
              ? 'bg-[#D70606] text-white'
              : 'border border-neutral-300 text-neutral-500 hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white'
          }`}
        >
          <LayoutGrid className='h-3.5 w-3.5' />
          Cards
        </button>
      </div>

      {view === 'list' ? (
        /* ── LIST VIEW ── */
        <div className='space-y-px'>
          {factChecks.map((fc, index) => (
            <Fragment key={fc._id}>
              <Link
                href={`/fact-check/${fc.slug.current}`}
                className='group flex items-start gap-4 border border-neutral-200 p-4 transition-colors hover:border-[#D70606] dark:border-neutral-700'
              >
                {/* Verdict badge — fixed width column */}
                <div className='mt-0.5 w-28 shrink-0'>
                  <VerdictBadge rating={fc.rating} />
                </div>

                {/* Thumbnail — shown in list view if image exists */}
                {fc.mainImage && (
                  <div className='relative hidden h-16 w-24 shrink-0 overflow-hidden sm:block'>
                    <Image
                      src={urlForImage(fc.mainImage)?.width(192).height(128).url() ?? ''}
                      alt={fc.mainImage.alt ?? fc.title}
                      fill
                      sizes='96px'
                      className='object-cover'
                    />
                  </div>
                )}

                {/* Content */}
                <div className='min-w-0 flex-1'>
                  <h2 className='font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#D70606] dark:text-neutral-100'>
                    {fc.title}
                  </h2>
                  <p className='mt-1 line-clamp-2 text-sm italic text-neutral-500 dark:text-neutral-400'>
                    "{fc.claim}"
                  </p>
                  {fc.claimSource && (
                    <p className='mt-0.5 text-xs text-neutral-400'>— {fc.claimSource}</p>
                  )}
                  <div className='mt-2 flex items-center gap-3 text-xs uppercase tracking-widest text-neutral-400'>
                    {fc.author && <span>{fc.author.name}</span>}
                    {fc.author && fc.publishedAt && <span>·</span>}
                    {fc.publishedAt && <time>{formatDate(fc.publishedAt)}</time>}
                  </div>
                </div>
              </Link>
              {(index + 1) % 6 === 0 && index < factChecks.length - 1 && (
                <InFeedAd
                  slot={AD_CONFIG.AD_SLOTS.FACT_CHECKS_IN_FEED}
                  className='border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-900/50'
                />
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        /* ── CARDS VIEW ── */
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {factChecks.map((fc, index) => {
            const imageUrl = urlForImage(fc.mainImage)?.width(600).height(338).url();
            const verdictCfg = VERDICT_CONFIG[fc.rating];

            return (
              <Fragment key={fc._id}>
                <Link
                  href={`/fact-check/${fc.slug.current}`}
                  className='group flex flex-col border border-neutral-200 bg-white transition-all hover:border-[#D70606] dark:border-neutral-700 dark:bg-black'
                >
                  {/* Image or verdict-coloured placeholder */}
                  <div className='aspect-video overflow-hidden'>
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={fc.mainImage?.alt ?? fc.title}
                        width={600}
                        height={338}
                        sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                        className='h-full w-full object-cover transition-transform group-hover:scale-105'
                        placeholder='blur'
                        blurDataURL={urlForImage(fc.mainImage)!.width(20).blur(10).url()}
                      />
                    ) : (
                      <div
                        className={`flex h-full items-center justify-center ${verdictCfg?.bgClass ?? 'bg-neutral-200'}`}
                      >
                        <span
                          className={`text-lg font-black uppercase tracking-widest ${verdictCfg?.textClass ?? 'text-white'}`}
                        >
                          {verdictCfg?.label ?? fc.rating}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className='flex flex-1 flex-col p-4'>
                    {/* Verdict badge */}
                    <div className='mb-3'>
                      <VerdictBadge rating={fc.rating} />
                    </div>

                    <h3 className='mb-2 line-clamp-2 font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#D70606] dark:text-neutral-100'>
                      {fc.title}
                    </h3>

                    <p className='mb-3 line-clamp-2 flex-1 text-xs italic leading-relaxed text-neutral-500 dark:text-neutral-400'>
                      "{fc.claim}"
                    </p>

                    {fc.claimSource && (
                      <p className='mb-3 text-xs text-neutral-400'>— {fc.claimSource}</p>
                    )}

                    <div className='mt-auto flex items-center justify-between text-xs uppercase tracking-widest text-neutral-400'>
                      {fc.author?.name && <span>{fc.author.name}</span>}
                      {fc.publishedAt && (
                        <time className='font-mono'>{formatDate(fc.publishedAt)}</time>
                      )}
                    </div>
                  </div>
                </Link>
                {(index + 1) % 6 === 0 && index < factChecks.length - 1 && (
                  <div className='col-span-1 sm:col-span-2 lg:col-span-3'>
                    <InFeedAd
                      slot={AD_CONFIG.AD_SLOTS.FACT_CHECKS_IN_FEED}
                      className='border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-900/50'
                    />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
