// src/components/portal/ClaimedPitchCard.tsx
// Card for a claimed pitch in the dashboard — shows status, quick actions.
// Used in the Claimed Pitches section between Quick Links and the Brief panel.
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export interface ClaimedPitchSummary {
  _id: string;
  headline?: string;
  beat?: string;
  urgency?: 'breaking' | 'high' | 'medium' | 'low';
  status?: string;
  briefTitle?: string;
  claimedAt?: string;
  author?: { _id: string; name: string };
  linkedArticle?: { _id: string; title: string; slug?: string };
}

const URGENCY_COLORS: Record<string, string> = {
  breaking: 'bg-red-600 text-white',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const STATUS_COLORS: Record<string, string> = {
  claimed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  abandoned: 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600',
};

export function ClaimedPitchCard({
  pitch,
  showAuthor,
}: {
  pitch: ClaimedPitchSummary;
  showAuthor?: boolean;
}) {
  const urgency = pitch.urgency ?? 'medium';
  const status = pitch.status ?? 'claimed';

  return (
    <div
      className={`border bg-white p-4 dark:bg-slate-900 ${
        urgency === 'breaking'
          ? 'border-red-300 dark:border-red-800'
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      {/* Badges */}
      <div className='mb-2 flex flex-wrap items-center gap-1.5'>
        <span
          className={`px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${URGENCY_COLORS[urgency]}`}
        >
          {urgency}
        </span>
        {pitch.beat && (
          <span className='bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
            {pitch.beat}
          </span>
        )}
        <span
          className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_COLORS[status] ?? ''}`}
        >
          {status.replace('_', ' ')}
        </span>
      </div>

      {/* Headline */}
      <h3 className='mb-1.5 text-sm font-black leading-snug text-slate-900 dark:text-white'>
        {pitch.headline ?? 'Untitled Pitch'}
      </h3>

      {/* Author (editor view) */}
      {showAuthor && pitch.author && (
        <p className='mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500'>
          {pitch.author.name}
          {pitch.claimedAt && (
            <span className='ml-1 font-normal normal-case tracking-normal text-slate-400'>
              · {new Date(pitch.claimedAt).toLocaleDateString()}
            </span>
          )}
        </p>
      )}

      {/* Brief */}
      {pitch.briefTitle && (
        <p className='mb-3 truncate text-[10px] text-slate-400'>{pitch.briefTitle}</p>
      )}

      {/* Actions */}
      <div className='flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800'>
        <Link
          href={`/portal/pitch/${pitch._id}`}
          className='bg-untele px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90'
        >
          Open Pitch
        </Link>
        {pitch.linkedArticle ? (
          <Link
            href={`/portal/articles/${pitch.linkedArticle._id}/edit`}
            className='flex items-center gap-1 border border-slate-300 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:border-untele hover:text-untele dark:border-slate-600 dark:text-slate-400'
          >
            <ExternalLink className='h-3 w-3' />
            Article
          </Link>
        ) : (
          <Link
            href={`/portal/articles/new?pitchId=${pitch._id}`}
            className='border border-slate-300 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:border-untele hover:text-untele dark:border-slate-600 dark:text-slate-400'
          >
            Start Article
          </Link>
        )}
      </div>
    </div>
  );
}
