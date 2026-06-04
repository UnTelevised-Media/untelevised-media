'use client';
// src/components/portal/ClaimedPitchesPanel.tsx
// Client component — claimed pitches grid with Mine / All / Others filter pills.
// Editors see all pitches + the filter toggle. Authors see only their own (no toggle).

import { useState, useMemo } from 'react';
import { ClaimedPitchCard, type ClaimedPitchSummary } from './ClaimedPitchCard';

type AuthorFilter = 'all' | 'mine' | 'others';

interface Props {
  pitches: ClaimedPitchSummary[];
  currentSanityAuthorId?: string;
  isEditorPlus: boolean;
}

export function ClaimedPitchesPanel({ pitches, currentSanityAuthorId, isEditorPlus }: Props) {
  const [authorFilter, setAuthorFilter] = useState<AuthorFilter>('all');

  const URGENCY_ORDER: Record<string, number> = { breaking: 0, high: 1, medium: 2, low: 3 };
  const STATUS_ORDER: Record<string, number> = { in_progress: 0, claimed: 1, published: 2 };

  const filtered = useMemo(() => {
    const base =
      !isEditorPlus || authorFilter === 'all'
        ? pitches
        : authorFilter === 'mine'
          ? pitches.filter((p) => p.author?._id === currentSanityAuthorId)
          : pitches.filter((p) => p.author?._id !== currentSanityAuthorId);

    return [...base].sort((a, b) => {
      const statusDiff =
        (STATUS_ORDER[a.status ?? 'claimed'] ?? 1) - (STATUS_ORDER[b.status ?? 'claimed'] ?? 1);
      if (statusDiff !== 0) return statusDiff;
      return (
        (URGENCY_ORDER[a.urgency ?? 'medium'] ?? 2) - (URGENCY_ORDER[b.urgency ?? 'medium'] ?? 2)
      );
    });
  }, [pitches, isEditorPlus, authorFilter, currentSanityAuthorId]);

  if (pitches.length === 0) return null;

  return (
    <div>
      {/* Filter pills — editor only */}
      {isEditorPlus && (
        <div className='mb-3 flex items-center gap-2'>
          <div className='flex items-center gap-1 rounded border border-slate-200 p-0.5 dark:border-slate-700'>
            {(['all', 'mine', 'others'] as AuthorFilter[]).map((key) => (
              <button
                key={key}
                type='button'
                onClick={() => setAuthorFilter(key)}
                className={[
                  'px-3 py-1 text-xs font-semibold transition-colors',
                  authorFilter === key
                    ? 'bg-untele text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
                ].join(' ')}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <span className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>
            {filtered.length} {filtered.length === 1 ? 'pitch' : 'pitches'}
          </span>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className='py-4 text-xs font-bold uppercase tracking-widest text-slate-400'>
          No pitches in this view.
        </p>
      ) : (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filtered.map((pitch) => (
            <ClaimedPitchCard key={pitch._id} pitch={pitch} showAuthor={isEditorPlus} />
          ))}
        </div>
      )}
    </div>
  );
}
