'use client';
// src/components/portal/EditBookModal.tsx
// In-portal book editor. Slide-over form pre-populated from existing book data.

import { useState, useEffect, useRef, useTransition } from 'react';
import { X, Pencil, Plus, ChevronDown, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  updateBook,
  uploadBookCover,
  uploadDigitalAsset,
  fetchBookGenres,
  createBookGenre,
} from '@/lib/portal/book-actions';
import type { SanityBook, SanityBookGenre } from '@/lib/bookstore/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function blocksToText(blocks: unknown): string {
  if (!Array.isArray(blocks)) return '';
  return (blocks as Array<{ children?: Array<{ text?: string }> }>)
    .map((b) => (b.children ?? []).map((c) => c.text ?? '').join(''))
    .join('\n\n');
}

function makeKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ---------------------------------------------------------------------------

interface EditFormat {
  key: string;
  isNew?: boolean; // true for formats added in this edit session
  formatType: 'physical' | 'digital' | 'bundle' | 'tip';
  price: string;
  compareAtPrice: string;
  existingAssetPath?: string;
  nameYourPrice: boolean;
  minimumPrice: string;
  suggestedPrice: string;
  stripePriceId: string;
  stripeProductId: string;
}

function blankNewFormat(): EditFormat {
  return {
    key: makeKey(),
    isNew: true,
    formatType: 'physical',
    price: '',
    compareAtPrice: '',
    nameYourPrice: false,
    minimumPrice: '',
    suggestedPrice: '',
    stripePriceId: '',
    stripeProductId: '',
  };
}

interface Props {
  book: SanityBook;
}

export default function EditBookModal({ book }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Keep a ref to the latest book value so the open-effect can read it without
  // having book in its dependency array — prevents a new book object reference
  // (e.g. from a router.refresh()) wiping an in-progress file selection.
  const bookRef = useRef(book);
  useEffect(() => { bookRef.current = book; });

  // Fiction / Non-Fiction
  const [fictionType, setFictionType] = useState<'fiction' | 'non-fiction' | undefined>(undefined);

  // Genre dropdown
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const genreDropdownRef = useRef<HTMLDivElement>(null);

  // Cover state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form state — initialised from book on open
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'out-of-stock' | 'discontinued'>('draft');
  const [isbn, setIsbn] = useState('');
  const [pages, setPages] = useState('');
  const [language, setLanguage] = useState('en');
  const [publishedAt, setPublishedAt] = useState('');
  const [editFormats, setEditFormats] = useState<EditFormat[]>([]);
  const [digitalFiles, setDigitalFiles] = useState<(File | null)[]>([]);

  // Three named refs — same pattern as coverInputRef, one per format slot (max 3).
  // Named refs are stable across renders unlike callback refs into an array.
  const digitalRef0 = useRef<HTMLInputElement>(null);
  const digitalRef1 = useRef<HTMLInputElement>(null);
  const digitalRef2 = useRef<HTMLInputElement>(null);
  const digitalInputRefs = [digitalRef0, digitalRef1, digitalRef2];

  // Genre state
  const [localGenres, setLocalGenres] = useState<SanityBookGenre[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [genresLoading, setGenresLoading] = useState(false);
  const [showGenreForm, setShowGenreForm] = useState(false);
  const [genreTitle, setGenreTitle] = useState('');
  const [genreSlug, setGenreSlug] = useState('');
  const [genreError, setGenreError] = useState('');
  const [genreCreating, setGenreCreating] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Populate form + load genres when modal opens.
  // Uses bookRef.current (not book) so a new book object reference from router.refresh()
  // does NOT re-fire this effect and wipe an in-progress file selection.
  useEffect(() => {
    if (!open) return;
    const b = bookRef.current;

    setTitle(b.title);
    setDescription(blocksToText(b.description));
    setStatus(b.status);
    setIsbn(b.isbn ?? '');
    setPages(b.pages != null ? String(b.pages) : '');
    setLanguage(b.language ?? 'en');
    setPublishedAt(b.publishedAt ?? '');
    setEditFormats(
      (b.formats ?? []).map((f) => ({
        key: f._key,
        isNew: false,
        formatType: f.formatType,
        price: String(f.price ?? ''),
        compareAtPrice: f.compareAtPrice != null ? String(f.compareAtPrice) : '',
        existingAssetPath: f.digitalAsset?.supabaseStoragePath,
        nameYourPrice: f.nameYourPrice ?? false,
        minimumPrice: f.minimumPrice != null ? String(f.minimumPrice) : '',
        suggestedPrice: f.suggestedPrice != null ? String(f.suggestedPrice) : '',
        stripePriceId: f.stripePriceId ?? '',
        stripeProductId: f.stripeProductId ?? '',
      })),
    );
    setDigitalFiles((b.formats ?? []).map(() => null));
    setSelectedGenreIds((b.genre ?? []).map((g) => g._id));
    setCoverFile(null);
    setCoverPreview(null);
    setError('');
    setSaved(false);

    setFictionType(b.fictionType ?? undefined);
    setGenreDropdownOpen(false);
    setShowGenreForm(false);
    setGenreTitle('');
    setGenreSlug('');
    setGenreError('');

    setGenresLoading(true);
    fetchBookGenres()
      .then(setLocalGenres)
      .finally(() => setGenresLoading(false));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close genre dropdown on outside click
  useEffect(() => {
    if (!genreDropdownOpen) return;
    function handler(e: MouseEvent) {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(e.target as Node)) {
        setGenreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [genreDropdownOpen]);

  function slugifyLocal(str: string) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function handleCreateGenre() {
    setGenreError('');
    if (!genreTitle.trim()) { setGenreError('Title is required.'); return; }
    if (!genreSlug.trim()) { setGenreError('Slug is required.'); return; }
    setGenreCreating(true);
    try {
      const created = await createBookGenre(genreTitle, genreSlug);
      setLocalGenres((prev) => [...prev, created].sort((a, b) => a.title.localeCompare(b.title)));
      setSelectedGenreIds((prev) => [...prev, created._id]);
      setGenreTitle('');
      setGenreSlug('');
      setShowGenreForm(false);
    } catch (err) {
      setGenreError(err instanceof Error ? err.message : 'Failed to create genre.');
    } finally {
      setGenreCreating(false);
    }
  }

  function updateFormat(i: number, patch: Partial<EditFormat>) {
    setEditFormats((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  function addFormat() {
    if (editFormats.length >= 3) return;
    setEditFormats((prev) => [...prev, blankNewFormat()]);
    setDigitalFiles((prev) => [...prev, null]);
  }

  function removeNewFormat(i: number) {
    setEditFormats((prev) => prev.filter((_, idx) => idx !== i));
    setDigitalFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Title is required.'); return; }

    // Capture file values synchronously before the async transition starts
    const pendingCoverFile = coverFile;
    const pendingDigitalFiles = [...digitalFiles];

    // Existing formats — update prices + Stripe IDs
    const formatPrices = editFormats
      .filter((f) => !f.isNew)
      .map((f) => ({
        key: f.key,
        price: f.nameYourPrice ? (parseFloat(f.suggestedPrice) || 0) : parseFloat(f.price),
        compareAtPrice: !f.nameYourPrice && f.compareAtPrice ? parseFloat(f.compareAtPrice) : null,
        nameYourPrice: f.nameYourPrice,
        minimumPrice: f.nameYourPrice && f.minimumPrice ? parseFloat(f.minimumPrice) : null,
        suggestedPrice: f.nameYourPrice && f.suggestedPrice ? parseFloat(f.suggestedPrice) : null,
        stripePriceId: f.stripePriceId,
        stripeProductId: f.stripeProductId,
      }))
      .filter((f) => !isNaN(f.price));

    // New formats to append
    const newFormats = editFormats
      .filter((f) => f.isNew && f.formatType !== 'tip')
      .map((f) => ({
        key: f.key,
        formatType: f.formatType as 'physical' | 'digital' | 'bundle',
        price: f.nameYourPrice ? (parseFloat(f.suggestedPrice) || 0) : (parseFloat(f.price) || 0),
        ...(f.compareAtPrice && !f.nameYourPrice ? { compareAtPrice: parseFloat(f.compareAtPrice) } : {}),
        ...(f.nameYourPrice ? { nameYourPrice: true } : {}),
        ...(f.nameYourPrice && f.minimumPrice ? { minimumPrice: parseFloat(f.minimumPrice) } : {}),
        ...(f.nameYourPrice && f.suggestedPrice ? { suggestedPrice: parseFloat(f.suggestedPrice) } : {}),
        ...(f.stripePriceId ? { stripePriceId: f.stripePriceId } : {}),
        ...(f.stripeProductId ? { stripeProductId: f.stripeProductId } : {}),
      }));

    if (formatPrices.some((f) => f.price < 0)) {
      setError('Format prices must be valid positive numbers.');
      return;
    }

    startTransition(async () => {
      try {
        await updateBook(book._id, {
          title: title.trim(),
          description,
          isbn: isbn.trim() || '',
          pages: pages ? parseInt(pages, 10) : null,
          language: language.trim() || 'en',
          publishedAt: publishedAt || undefined,
          status,
          fictionType: fictionType ?? null,
          genreIds: selectedGenreIds,
          formatPrices,
          newFormats: newFormats.length ? newFormats : undefined,
        });

        if (pendingCoverFile) {
          const fd = new FormData();
          fd.append('bookId', book._id);
          fd.append('file', pendingCoverFile);
          await uploadBookCover(fd);
        }

        for (let i = 0; i < editFormats.length; i++) {
          const fmt = editFormats[i];
          if (fmt.formatType !== 'digital' && fmt.formatType !== 'bundle') continue;
          const file = pendingDigitalFiles[i];
          if (!file) continue;
          const fd = new FormData();
          fd.append('bookId', book._id);
          fd.append('formatKey', fmt.key);
          fd.append('file', file);
          await uploadDigitalAsset(fd);
        }

        setSaved(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      }
    });
  }

  const currentCover = coverPreview ?? book.coverImageUrl ?? null;

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className='flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-untele'
      >
        <Pencil className='h-3 w-3' />
        Edit
      </button>

      {open && (
        <div className='fixed inset-0 z-50 flex' role='dialog' aria-modal='true' aria-label={`Edit ${book.title}`}>
          <div className='absolute inset-0 bg-black/50' onClick={() => setOpen(false)} aria-hidden='true' />

          <div className='relative ml-auto flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900'>
            {/* Header */}
            <div className='flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700'>
              <div>
                <div className='mb-0.5 inline-block bg-untele px-2 py-0.5'>
                  <span className='text-[10px] font-black uppercase tracking-widest text-white'>Edit Book</span>
                </div>
                <p className='max-w-[280px] truncate text-xs text-slate-400'>{book.title}</p>
              </div>
              <button type='button' onClick={() => setOpen(false)} className='text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'>
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Saved state */}
            {saved ? (
              <div className='flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center'>
                <div className='bg-untele px-3 py-1'>
                  <span className='text-xs font-black uppercase tracking-widest text-white'>Saved</span>
                </div>
                <p className='text-sm font-bold text-slate-700 dark:text-slate-300'>
                  Changes saved successfully.
                </p>
                <div className='flex gap-3'>
                  <a
                    href={`/bookstore/book/${book.slug.current}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='border border-slate-300 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-untele hover:text-untele dark:border-slate-700 dark:text-slate-300'
                  >
                    View Page ↗
                  </a>
                  <button
                    type='button'
                    onClick={() => setOpen(false)}
                    className='bg-untele px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:opacity-90'
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className='flex flex-1 flex-col overflow-hidden'>
                <div className='flex-1 space-y-5 overflow-y-auto p-6'>

                  {/* Cover photo */}
                  <div>
                    <span className={`mb-2 block ${labelCls}`}>Cover Photo</span>
                    <div className='flex gap-4'>
                      <div className='relative h-32 w-24 shrink-0 overflow-hidden border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'>
                        {currentCover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={currentCover} alt='Cover' className='h-full w-full object-cover' />
                        ) : (
                          <div className='flex h-full items-center justify-center'>
                            <span className='text-center text-[9px] font-bold uppercase tracking-widest text-slate-300'>No cover</span>
                          </div>
                        )}
                      </div>
                      <div className='flex flex-1 flex-col justify-center gap-2'>
                        {/* Cover input — fixed position escapes all overflow clipping */}
                        <input
                          ref={coverInputRef}
                          type='file'
                          accept='image/jpeg,image/png,image/webp,image/avif'
                          className='fixed left-[-9999px] top-0 opacity-0'
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            if (!file) return;
                            setCoverFile(file);
                            if (coverPreview) URL.revokeObjectURL(coverPreview);
                            setCoverPreview(URL.createObjectURL(file));
                            e.target.value = '';
                          }}
                        />
                        {/* Digital file inputs — always mounted, same pattern as cover. One per slot (max 3). */}
                        <input ref={digitalRef0} type='file' accept='.pdf,.epub,.mobi,.azw3,.zip,application/pdf,application/epub+zip' className='fixed left-[-9999px] top-0 opacity-0' onChange={(e) => { const f = e.target.files?.[0]; if (f) setDigitalFiles((p) => p.map((x, idx) => idx === 0 ? f : x)); e.target.value = ''; }} />
                        <input ref={digitalRef1} type='file' accept='.pdf,.epub,.mobi,.azw3,.zip,application/pdf,application/epub+zip' className='fixed left-[-9999px] top-0 opacity-0' onChange={(e) => { const f = e.target.files?.[0]; if (f) setDigitalFiles((p) => p.map((x, idx) => idx === 1 ? f : x)); e.target.value = ''; }} />
                        <input ref={digitalRef2} type='file' accept='.pdf,.epub,.mobi,.azw3,.zip,application/pdf,application/epub+zip' className='fixed left-[-9999px] top-0 opacity-0' onChange={(e) => { const f = e.target.files?.[0]; if (f) setDigitalFiles((p) => p.map((x, idx) => idx === 2 ? f : x)); e.target.value = ''; }} />
                        <button
                          type='button'
                          onClick={() => coverInputRef.current?.click()}
                          className='border border-dashed border-slate-300 px-4 py-3 text-center hover:border-untele dark:border-slate-600'
                        >
                          <span className='text-xs font-bold uppercase tracking-widest text-slate-500'>
                            {coverFile ? 'Change Photo' : currentCover ? 'Replace Photo' : 'Choose Photo'}
                          </span>
                        </button>
                        {coverFile && (
                          <div className='flex items-center justify-between'>
                            <p className='truncate text-[10px] text-slate-400'>{coverFile.name}</p>
                            <button type='button' onClick={() => { setCoverFile(null); setCoverPreview(null); }} className='ml-2 shrink-0 text-[10px] font-bold text-slate-400 hover:text-untele'>
                              Remove
                            </button>
                          </div>
                        )}
                        <p className='text-[10px] text-slate-400'>JPG, PNG, WebP — max 5 MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <FormField label='Title *'>
                    <input type='text' value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} />
                  </FormField>

                  {/* Description */}
                  <FormField label='Description'>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder='Brief synopsis...' className={inputCls} />
                  </FormField>

                  {/* Fiction / Non-Fiction */}
                  <div>
                    <span className={`mb-2 block ${labelCls}`}>Type</span>
                    <div className='flex gap-2'>
                      {(['fiction', 'non-fiction'] as const).map((t) => (
                        <button
                          key={t}
                          type='button'
                          onClick={() => setFictionType((prev) => (prev === t ? undefined : t))}
                          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                            fictionType === t
                              ? 'bg-untele text-white'
                              : 'border border-slate-300 text-slate-500 hover:border-untele hover:text-untele dark:border-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {t === 'fiction' ? 'Fiction' : 'Non-Fiction'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Genres */}
                  <div>
                    <div className='mb-2 flex items-center justify-between'>
                      <span className={labelCls}>Genres</span>
                      <button
                        type='button'
                        onClick={() => { setShowGenreForm((v) => !v); setGenreError(''); }}
                        className='flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-untele hover:underline'
                      >
                        <Plus className='h-3 w-3' />
                        {showGenreForm ? 'Cancel' : 'New Genre'}
                      </button>
                    </div>

                    {showGenreForm && (
                      <div className='mb-3 border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800'>
                        <p className='mb-2 text-[10px] font-black uppercase tracking-widest text-untele'>Create Genre</p>
                        <div className='mb-2'>
                          <label className={`mb-1 block ${labelCls}`}>Title *</label>
                          <input type='text' value={genreTitle} onChange={(e) => setGenreTitle(e.target.value)} placeholder='e.g. Historical Fiction' className={inputCls} />
                        </div>
                        <div className='mb-3'>
                          <label className={`mb-1 block ${labelCls}`}>Slug *</label>
                          <div className='flex gap-2'>
                            <input type='text' value={genreSlug} onChange={(e) => setGenreSlug(e.target.value)} placeholder='historical-fiction' className={`${inputCls} flex-1`} />
                            <button
                              type='button'
                              onClick={() => setGenreSlug(slugifyLocal(genreTitle))}
                              disabled={!genreTitle.trim()}
                              className='shrink-0 border border-slate-300 bg-white px-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-untele hover:text-untele disabled:opacity-40 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            >
                              Slugify
                            </button>
                          </div>
                        </div>
                        {genreError && <p className='mb-2 text-[10px] font-bold text-red-500'>{genreError}</p>}
                        <button
                          type='button'
                          onClick={handleCreateGenre}
                          disabled={genreCreating}
                          className='bg-untele px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
                        >
                          {genreCreating ? 'Creating…' : 'Create'}
                        </button>
                      </div>
                    )}
                    {genresLoading ? (
                      <p className='text-[10px] text-slate-400'>Loading genres…</p>
                    ) : (
                      <div ref={genreDropdownRef}>
                        <button
                          type='button'
                          onClick={() => setGenreDropdownOpen((v) => !v)}
                          className='flex min-h-[38px] w-full items-center justify-between border border-slate-200 bg-white px-3 py-2 text-left dark:border-slate-700 dark:bg-slate-800'
                        >
                          {selectedGenreIds.length === 0 ? (
                            <span className='text-xs text-slate-400'>Select genres…</span>
                          ) : (
                            <div className='flex flex-wrap gap-1 pr-1'>
                              {selectedGenreIds.map((id) => {
                                const g = localGenres.find((x) => x._id === id);
                                return g ? (
                                  <span key={id} className='flex items-center gap-1 border border-untele/30 bg-untele/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-untele'>
                                    {g.title}
                                    <button
                                      type='button'
                                      onClick={(e) => { e.stopPropagation(); setSelectedGenreIds((prev) => prev.filter((gid) => gid !== id)); }}
                                      className='leading-none text-untele/60 hover:text-untele'
                                    >
                                      ×
                                    </button>
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                          <ChevronDown className={`ml-2 h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-150 ${genreDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {genreDropdownOpen && (
                          <div className='mt-px max-h-44 overflow-y-auto border border-t-0 border-slate-200 dark:border-slate-700'>
                            {localGenres.length === 0 ? (
                              <p className='px-3 py-2 text-[10px] text-slate-400'>No genres — add via the Add Book widget.</p>
                            ) : (
                              localGenres.map((g) => (
                                <label key={g._id} className='flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800'>
                                  <input
                                    type='checkbox'
                                    checked={selectedGenreIds.includes(g._id)}
                                    onChange={(e) =>
                                      setSelectedGenreIds((prev) =>
                                        e.target.checked ? [...prev, g._id] : prev.filter((id) => id !== g._id),
                                      )
                                    }
                                    className='accent-untele'
                                  />
                                  <span className='text-xs text-slate-700 dark:text-slate-300'>{g.title}</span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`mb-2 block ${labelCls}`}>Status</span>
                    <div className='flex flex-wrap gap-4'>
                      {(['draft', 'published', 'out-of-stock', 'discontinued'] as const).map((s) => (
                        <label key={s} className='flex cursor-pointer items-center gap-2'>
                          <input type='radio' name='edit-status' value={s} checked={status === s} onChange={() => setStatus(s)} className='accent-untele' />
                          <span className='text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300'>{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Formats */}
                  <div>
                    <div className='mb-2 flex items-center justify-between'>
                      <span className={labelCls}>Formats</span>
                      {editFormats.length < 3 && (
                        <button
                          type='button'
                          onClick={addFormat}
                          className='flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-untele hover:underline'
                        >
                          <Plus className='h-3 w-3' /> Add Format
                        </button>
                      )}
                    </div>


                    <div className='space-y-3'>
                      {editFormats.map((fmt, i) => (
                        <div key={fmt.key} className='border border-slate-200 p-3 dark:border-slate-700'>
                          {/* Format header */}
                          <div className='mb-2 flex items-center justify-between'>
                            {fmt.isNew ? (
                              /* New format — type is selectable */
                              <div className='flex gap-3'>
                                {(['physical', 'digital', 'bundle'] as const).map((ft) => (
                                  <label key={ft} className='flex cursor-pointer items-center gap-1.5'>
                                    <input
                                      type='radio'
                                      name={`fmt-${fmt.key}-type`}
                                      value={ft}
                                      checked={fmt.formatType === ft}
                                      onChange={() => updateFormat(i, { formatType: ft })}
                                      className='accent-untele'
                                    />
                                    <span className='text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400'>{ft}</span>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                                {fmt.formatType === 'physical' && 'Physical Book'}
                                {fmt.formatType === 'digital' && 'Digital Edition'}
                                {fmt.formatType === 'bundle' && 'Physical + Digital Bundle'}
                                {fmt.formatType === 'tip' && 'Tip'}
                              </p>
                            )}
                            {fmt.isNew && (
                              <button
                                type='button'
                                onClick={() => removeNewFormat(i)}
                                className='text-slate-300 hover:text-untele'
                              >
                                <Trash2 className='h-3.5 w-3.5' />
                              </button>
                            )}
                          </div>

                          {/* Name Your Own Price toggle (not for tip) */}
                          {fmt.formatType !== 'tip' && (
                            <div className='mb-2 flex items-center gap-2'>
                              <button
                                type='button'
                                onClick={() => updateFormat(i, { nameYourPrice: !fmt.nameYourPrice })}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${fmt.nameYourPrice ? 'bg-untele' : 'bg-slate-200 dark:bg-slate-700'}`}
                              >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${fmt.nameYourPrice ? 'translate-x-4' : 'translate-x-1'}`} />
                              </button>
                              <span className='text-[10px] font-black uppercase tracking-widest text-slate-500'>Name Your Own Price</span>
                            </div>
                          )}

                          {/* Price fields */}
                          {fmt.nameYourPrice ? (
                            <div className='mb-2 grid grid-cols-2 gap-2'>
                              <div>
                                <label className={`mb-1 block ${labelCls}`}>Min Price (USD)</label>
                                <input
                                  type='number' step='0.01' min='0'
                                  value={fmt.minimumPrice}
                                  onChange={(e) => updateFormat(i, { minimumPrice: e.target.value })}
                                  placeholder='0.00' className={inputCls}
                                />
                                <p className='mt-0.5 text-[9px] text-slate-400'>0 = free / any amount</p>
                              </div>
                              <div>
                                <label className={`mb-1 block ${labelCls}`}>Suggested (USD)</label>
                                <input
                                  type='number' step='0.01' min='0'
                                  value={fmt.suggestedPrice}
                                  onChange={(e) => updateFormat(i, { suggestedPrice: e.target.value })}
                                  placeholder='9.99' className={inputCls}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className='mb-2 grid grid-cols-2 gap-2'>
                              <div>
                                <label className={`mb-1 block ${labelCls}`}>Price (USD)</label>
                                <input
                                  type='number' step='0.01' min='0'
                                  value={fmt.price}
                                  onChange={(e) => updateFormat(i, { price: e.target.value })}
                                  className={inputCls}
                                />
                              </div>
                              <div>
                                <label className={`mb-1 block ${labelCls}`}>Compare-at</label>
                                <input
                                  type='number' step='0.01' min='0'
                                  value={fmt.compareAtPrice}
                                  onChange={(e) => updateFormat(i, { compareAtPrice: e.target.value })}
                                  placeholder='—' className={inputCls}
                                />
                              </div>
                            </div>
                          )}

                          {/* Stripe IDs */}
                          <div className='mb-2 grid grid-cols-1 gap-2'>
                            <div>
                              <label className={`mb-1 block ${labelCls}`}>Stripe Price ID</label>
                              <input
                                type='text'
                                value={fmt.stripePriceId}
                                onChange={(e) => updateFormat(i, { stripePriceId: e.target.value.trim() })}
                                placeholder='price_1ABC...'
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <label className={`mb-1 block ${labelCls}`}>Stripe Product ID</label>
                              <input
                                type='text'
                                value={fmt.stripeProductId}
                                onChange={(e) => updateFormat(i, { stripeProductId: e.target.value.trim() })}
                                placeholder='prod_1ABC...'
                                className={inputCls}
                              />
                            </div>
                          </div>

                          {/* Digital file replacement */}
                          {(fmt.formatType === 'digital' || fmt.formatType === 'bundle') && (
                            <div className='mt-3 border-t border-slate-100 pt-3 dark:border-slate-700'>
                              <span className={`mb-1.5 block ${labelCls}`}>Digital File</span>
                              {fmt.existingAssetPath && !digitalFiles[i] && (
                                <p className='mb-1.5 truncate text-[10px] text-slate-400'>
                                  Current: {fmt.existingAssetPath.split('/').pop()}
                                </p>
                              )}
                              {digitalFiles[i] ? (
                                <div className='flex items-center justify-between gap-2 border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800'>
                                  <div className='min-w-0'>
                                    <p className='truncate text-[10px] font-bold text-slate-700 dark:text-slate-300'>{digitalFiles[i]!.name}</p>
                                    <p className='text-[10px] text-slate-400'>{(digitalFiles[i]!.size / (1024 * 1024)).toFixed(1)} MB</p>
                                  </div>
                                  <button
                                    type='button'
                                    onClick={() => setDigitalFiles((f) => f.map((file, idx) => (idx === i ? null : file)))}
                                    className='shrink-0 text-[10px] font-bold text-slate-400 hover:text-untele'
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type='button'
                                  onClick={() => digitalInputRefs[i]?.current?.click()}
                                  className='flex w-full items-center justify-center border border-dashed border-slate-300 px-4 py-2.5 hover:border-untele dark:border-slate-600'
                                >
                                  <span className='text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-untele'>
                                    {fmt.existingAssetPath ? 'Replace File' : 'Choose File'}
                                  </span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className='grid grid-cols-2 gap-3'>
                    <FormField label='ISBN'>
                      <input type='text' value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder='978-...' className={inputCls} />
                    </FormField>
                    <FormField label='Pages'>
                      <input type='number' min='1' value={pages} onChange={(e) => setPages(e.target.value)} placeholder='250' className={inputCls} />
                    </FormField>
                    <FormField label='Language'>
                      <input type='text' value={language} onChange={(e) => setLanguage(e.target.value)} placeholder='en' className={inputCls} />
                    </FormField>
                    <FormField label='Publish Date'>
                      <input type='date' value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={inputCls} />
                    </FormField>
                  </div>

                </div>

                {/* Footer */}
                <div className='shrink-0 border-t border-slate-200 dark:border-slate-700'>
                  {error && (
                    <p className='border-b border-red-200 bg-red-50 px-6 py-2 text-xs font-bold text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400'>
                      {error}
                    </p>
                  )}
                  <div className='flex items-center justify-between px-6 py-4'>
                    <button type='button' onClick={() => setOpen(false)} className='text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700'>
                      Cancel
                    </button>
                    <button
                      type='submit'
                      disabled={isPending}
                      className='bg-untele px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
                    >
                      {isPending ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const inputCls =
  'w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-300 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-600';

const labelCls = 'text-[10px] font-bold uppercase tracking-widest text-slate-500';

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={`mb-1 block ${labelCls}`}>{label}</label>
      {children}
    </div>
  );
}
