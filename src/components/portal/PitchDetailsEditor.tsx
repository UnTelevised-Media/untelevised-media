'use client';
// src/components/portal/PitchDetailsEditor.tsx
// Shows pitch details (angle, sources, links, linked article) in read-only mode.
// An Edit button reveals the editable form; Cancel/Save return to read-only.

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Plus, X, ExternalLink, Pencil } from 'lucide-react';
import { updatePitchDetails } from '@/lib/portal/pitch-actions';

interface LinkItem {
  _key: string;
  label?: string;
  url?: string;
}

export interface ArticleOption {
  _id: string;
  title: string;
}

interface Props {
  pitchId: string;
  initialHeadline?: string;
  initialAngle?: string;
  initialSourceSuggestions?: string;
  initialLinks?: LinkItem[];
  initialLinkedArticleId?: string;
  initialLinkedArticleTitle?: string;
  articles: ArticleOption[];
}

function makeKey() {
  return Math.random().toString(36).slice(2, 10);
}

export function PitchDetailsEditor({
  pitchId,
  initialHeadline = '',
  initialAngle = '',
  initialSourceSuggestions = '',
  initialLinks = [],
  initialLinkedArticleId = '',
  initialLinkedArticleTitle = '',
  articles,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Committed (saved) values — what the read view shows
  const [saved, setSaved] = useState({
    headline: initialHeadline,
    angle: initialAngle,
    sourceSuggestions: initialSourceSuggestions,
    links: initialLinks,
    linkedArticleId: initialLinkedArticleId,
    linkedArticleTitle: initialLinkedArticleTitle,
  });

  // Draft values — edited in the form, discarded on Cancel
  const [draft, setDraft] = useState({ ...saved });

  function openEdit() {
    setDraft({ ...saved });
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  function addLink() {
    setDraft((d) => ({ ...d, links: [...d.links, { _key: makeKey(), label: '', url: '' }] }));
  }

  function removeLink(key: string) {
    setDraft((d) => ({ ...d, links: d.links.filter((l) => l._key !== key) }));
  }

  function updateLink(key: string, field: 'label' | 'url', value: string) {
    setDraft((d) => ({
      ...d,
      links: d.links.map((l) => (l._key === key ? { ...l, [field]: value } : l)),
    }));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updatePitchDetails(pitchId, {
        headline: draft.headline,
        angle: draft.angle,
        sourceSuggestions: draft.sourceSuggestions,
        links: draft.links,
        linkedArticleId: draft.linkedArticleId || null,
      });
      if (result.success) {
        // Resolve title from articles list for the read view
        const linkedTitle =
          articles.find((a) => a._id === draft.linkedArticleId)?.title ??
          draft.linkedArticleTitle;
        setSaved({ ...draft, linkedArticleTitle: linkedTitle });
        setIsEditing(false);
        toast.success('Pitch updated.');
      } else {
        toast.error(result.error);
      }
    });
  }

  // ── Read-only view ─────────────────────────────────────────────────────────
  if (!isEditing) {
    return (
      <div>
        <div className='mb-4 flex items-center justify-between'>
          <p className='text-[10px] font-black uppercase tracking-widest text-slate-500'>
            Pitch Details
          </p>
          <button
            onClick={openEdit}
            className='flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-untele'
          >
            <Pencil className='h-3 w-3' /> Edit
          </button>
        </div>

        <div className='space-y-3'>
          {/* Headline — always shown */}
          <div>
            <p className='mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
              Title / Headline
            </p>
            {saved.headline ? (
              <p className='text-xs font-bold leading-snug text-slate-800 dark:text-slate-200'>
                {saved.headline}
              </p>
            ) : (
              <button onClick={openEdit} className='text-[11px] italic text-slate-400 hover:text-untele'>
                None — click Edit to add
              </button>
            )}
          </div>

          {/* Angle — always shown */}
          <div>
            <p className='mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
              Angle / Hook
            </p>
            {saved.angle ? (
              <p className='text-xs leading-relaxed text-slate-700 dark:text-slate-300'>
                {saved.angle}
              </p>
            ) : (
              <button onClick={openEdit} className='text-[11px] italic text-slate-400 hover:text-untele'>
                None — click Edit to add
              </button>
            )}
          </div>

          {/* Suggested Sources — always shown */}
          <div>
            <p className='mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
              Suggested Sources
            </p>
            {saved.sourceSuggestions ? (
              <p className='whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-300'>
                {saved.sourceSuggestions}
              </p>
            ) : (
              <button onClick={openEdit} className='text-[11px] italic text-slate-400 hover:text-untele'>
                None — click Edit to add
              </button>
            )}
          </div>

          {/* Reference Links — always shown */}
          <div>
            <div className='mb-1 flex items-center justify-between'>
              <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                Reference Links
              </p>
              <button
                onClick={openEdit}
                className='flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-untele'
              >
                <Plus className='h-3 w-3' /> Add
              </button>
            </div>
            {saved.links.length > 0 ? (
              <div className='flex flex-col gap-1'>
                {saved.links.map((link) =>
                  link.url ? (
                    <a
                      key={link._key}
                      href={link.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-1 text-xs text-untele hover:underline'
                    >
                      <ExternalLink className='h-3 w-3 shrink-0' />
                      {link.label || 'Source'}
                    </a>
                  ) : null
                )}
              </div>
            ) : (
              <p className='text-[11px] italic text-slate-400'>No links yet.</p>
            )}
          </div>

          {/* Linked Article */}
          {saved.linkedArticleId && saved.linkedArticleTitle && (
            <div>
              <p className='mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                Linked Article
              </p>
              <a
                href={`/portal/articles/${saved.linkedArticleId}/edit`}
                className='flex items-center gap-1 text-xs font-bold text-untele hover:underline'
              >
                <ExternalLink className='h-3 w-3 shrink-0' />
                {saved.linkedArticleTitle}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Edit form ──────────────────────────────────────────────────────────────
  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <p className='text-[10px] font-black uppercase tracking-widest text-slate-500'>
          Pitch Details
        </p>
        <button
          onClick={cancelEdit}
          disabled={isPending}
          className='text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 disabled:opacity-50'
        >
          Cancel
        </button>
      </div>

      <div className='space-y-4'>
        {/* Headline */}
        <div>
          <label className='mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400'>
            Title / Headline
          </label>
          <input
            type='text'
            value={draft.headline}
            onChange={(e) => setDraft((d) => ({ ...d, headline: e.target.value }))}
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
            value={draft.angle}
            onChange={(e) => setDraft((d) => ({ ...d, angle: e.target.value }))}
            rows={3}
            placeholder='The unique angle or editorial hook…'
            className='w-full border border-slate-300 bg-white p-2.5 text-xs leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500'
          />
        </div>

        {/* Suggested Sources */}
        <div>
          <label className='mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400'>
            Suggested Sources
          </label>
          <textarea
            value={draft.sourceSuggestions}
            onChange={(e) => setDraft((d) => ({ ...d, sourceSuggestions: e.target.value }))}
            rows={2}
            placeholder='People, agencies, or documents…'
            className='w-full border border-slate-300 bg-white p-2.5 text-xs leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500'
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
            {draft.links.map((link) => (
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
            {draft.links.length === 0 && (
              <p className='text-[11px] text-slate-400'>No links yet.</p>
            )}
          </div>
        </div>

        {/* Linked Article */}
        <div>
          <label className='mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400'>
            Linked Article
          </label>
          <select
            value={draft.linkedArticleId}
            onChange={(e) => setDraft((d) => ({ ...d, linkedArticleId: e.target.value }))}
            className='w-full border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white'
          >
            <option value=''>— None —</option>
            {articles.map((a) => (
              <option key={a._id} value={a._id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>

        <div className='flex justify-end gap-2 pt-1'>
          <button
            disabled={isPending}
            onClick={cancelEdit}
            className='border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 hover:border-slate-400 disabled:opacity-50 dark:border-slate-600 dark:text-slate-400'
          >
            Cancel
          </button>
          <button
            disabled={isPending}
            onClick={handleSave}
            className='bg-untele px-5 py-2 text-xs font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
