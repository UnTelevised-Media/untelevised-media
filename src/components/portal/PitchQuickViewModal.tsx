'use client';
// src/components/portal/PitchQuickViewModal.tsx
// Floating modal showing pitch details from within the article editor.
// Headline, angle, sources, links, and notes are editable. Urgency and beat are read-only.

import { useState, useTransition, useEffect } from 'react';
import { toast } from 'sonner';
import { X, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { updatePitchDetails } from '@/lib/portal/pitch-actions';
import { savePitchNotes } from '@/lib/portal/pitch-actions';

interface LinkItem {
  _key: string;
  label?: string;
  url?: string;
}

export interface PitchForModal {
  _id: string;
  headline?: string;
  urgency?: string;
  beat?: string;
  angle?: string;
  sourceSuggestions?: string;
  links?: LinkItem[];
  notes?: Array<{ children?: Array<{ text?: string }> }>;
}

interface Props {
  pitch: PitchForModal;
  onClose: () => void;
}

function makeKey() {
  return Math.random().toString(36).slice(2, 10);
}

function blocksToText(blocks?: Array<{ children?: Array<{ text?: string }> }>): string {
  if (!blocks || blocks.length === 0) return '';
  return blocks.map((b) => b.children?.map((c) => c.text ?? '').join('') ?? '').join('\n');
}

const URGENCY_COLORS: Record<string, string> = {
  breaking: 'bg-red-600 text-white',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export function PitchQuickViewModal({ pitch, onClose }: Props) {
  const [isPending, startTransition] = useTransition();

  // Editable fields
  const [headline, setHeadline] = useState(pitch.headline ?? '');
  const [angle, setAngle] = useState(pitch.angle ?? '');
  const [sourceSuggestions, setSourceSuggestions] = useState(pitch.sourceSuggestions ?? '');
  const [links, setLinks] = useState<LinkItem[]>(pitch.links ?? []);
  const [notesText, setNotesText] = useState(() => blocksToText(pitch.notes));

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function addLink() {
    setLinks((prev) => [...prev, { _key: makeKey(), label: '', url: '' }]);
  }

  function removeLink(key: string) {
    setLinks((prev) => prev.filter((l) => l._key !== key));
  }

  function updateLink(key: string, field: 'label' | 'url', value: string) {
    setLinks((prev) => prev.map((l) => (l._key === key ? { ...l, [field]: value } : l)));
  }

  function handleSave() {
    startTransition(async () => {
      const [detailsResult, notesResult] = await Promise.all([
        updatePitchDetails(pitch._id, {
          headline,
          angle,
          sourceSuggestions,
          links,
          linkedArticleId: null, // don't touch linkedArticle from this modal
        }),
        savePitchNotes(pitch._id, notesText),
      ]);

      if (detailsResult.success && notesResult.success) {
        toast.success('Pitch saved.');
      } else {
        toast.error(
          (!detailsResult.success ? detailsResult.error : null) ??
          (!notesResult.success ? notesResult.error : null) ??
          'Save failed.',
        );
      }
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 z-50 bg-black/50'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Panel */}
      <div className='fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white'>
              Pitch Notes
            </span>
            {pitch.urgency && (
              <span
                className={`px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${URGENCY_COLORS[pitch.urgency] ?? ''}`}
              >
                {pitch.urgency}
              </span>
            )}
            {pitch.beat && (
              <span className='bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
                {pitch.beat}
              </span>
            )}
          </div>
          <div className='flex items-center gap-3'>
            <Link
              href={`/portal/pitch/${pitch._id}`}
              target='_blank'
              className='flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-untele'
            >
              <ExternalLink className='h-3 w-3' /> Full Page
            </Link>
            <button onClick={onClose} className='text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'>
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className='flex-1 overflow-y-auto px-5 py-4'>
          <div className='space-y-4'>
            {/* Headline */}
            <div>
              <label className='mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                Headline
              </label>
              <input
                type='text'
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder='Story headline…'
                className='w-full border border-slate-300 bg-white px-2.5 py-2 text-sm font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white'
              />
            </div>

            {/* Angle */}
            <div>
              <label className='mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                Angle / Hook
              </label>
              <textarea
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                rows={3}
                placeholder='The unique angle or editorial hook…'
                className='w-full border border-slate-300 bg-white p-2.5 text-xs leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white'
              />
            </div>

            {/* Suggested Sources */}
            <div>
              <label className='mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                Suggested Sources
              </label>
              <textarea
                value={sourceSuggestions}
                onChange={(e) => setSourceSuggestions(e.target.value)}
                rows={2}
                placeholder='People, agencies, or documents…'
                className='w-full border border-slate-300 bg-white p-2.5 text-xs leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white'
              />
            </div>

            {/* Reference Links */}
            <div>
              <div className='mb-1.5 flex items-center justify-between'>
                <label className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                  Reference Links
                </label>
                <button
                  type='button'
                  onClick={addLink}
                  className='flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-untele hover:opacity-80'
                >
                  <Plus className='h-3 w-3' /> Add
                </button>
              </div>
              <div className='space-y-1.5'>
                {links.map((link) => (
                  <div key={link._key} className='flex gap-1.5'>
                    <input
                      type='text'
                      value={link.label ?? ''}
                      onChange={(e) => updateLink(link._key, 'label', e.target.value)}
                      placeholder='Label'
                      className='w-1/3 border border-slate-300 bg-white px-2 py-1.5 text-xs focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white'
                    />
                    <input
                      type='url'
                      value={link.url ?? ''}
                      onChange={(e) => updateLink(link._key, 'url', e.target.value)}
                      placeholder='https://…'
                      className='min-w-0 flex-1 border border-slate-300 bg-white px-2 py-1.5 text-xs focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white'
                    />
                    <button
                      type='button'
                      onClick={() => removeLink(link._key)}
                      className='shrink-0 border border-slate-300 px-2 text-slate-400 hover:border-red-400 hover:text-red-500 dark:border-slate-600'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </div>
                ))}
                {links.length === 0 && (
                  <p className='text-[11px] italic text-slate-400'>No links yet.</p>
                )}
              </div>
            </div>

            {/* Working Notes */}
            <div>
              <label className='mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                Working Notes
              </label>
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                rows={8}
                placeholder='Notes, interview questions, source contacts…'
                className='w-full resize-y border border-slate-300 bg-white p-2.5 font-mono text-xs leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white'
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-700'>
          <button
            onClick={onClose}
            disabled={isPending}
            className='border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 hover:border-slate-400 disabled:opacity-50 dark:border-slate-600 dark:text-slate-400'
          >
            Close
          </button>
          <button
            disabled={isPending}
            onClick={handleSave}
            className='bg-untele px-6 py-2 text-xs font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
          >
            {isPending ? 'Saving…' : 'Save Pitch'}
          </button>
        </div>
      </div>
    </>
  );
}
