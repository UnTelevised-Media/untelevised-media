'use client';
// src/components/portal/AddBookModal.tsx
// In-portal book creation widget. Renders a trigger button + slide-over form.
// Submits via server action → creates Sanity book document.

import { useState, useEffect, useRef, useTransition } from 'react';
import { X, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  createBook,
  uploadBookCover,
  uploadDigitalAsset,
  fetchBookGenres,
  createBookGenre,
} from '@/lib/portal/book-actions';
import type { SanityBookGenre } from '@/lib/bookstore/types';

interface Format {
  formatType: 'physical' | 'digital' | 'bundle';
  price: string;
  compareAtPrice: string;
}

const blankFormat = (): Format => ({ formatType: 'physical', price: '', compareAtPrice: '' });

interface Props {
  label?: string;
  variant?: 'primary' | 'outline';
}

export default function AddBookModal({ label = '+ Add Book', variant = 'primary' }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Cover image state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isbn, setIsbn] = useState('');
  const [pages, setPages] = useState('');
  const [language, setLanguage] = useState('en');
  const [publishedAt, setPublishedAt] = useState('');
  const [formats, setFormats] = useState<Format[]>([blankFormat()]);
  // Parallel array — one slot per format, null if no file selected
  const [digitalFiles, setDigitalFiles] = useState<(File | null)[]>([null]);

  // File input refs — programmatic click is more reliable than label-wrapping inside overflow-hidden
  const coverInputRef = useRef<HTMLInputElement>(null);
  // One ref per format slot (max 3); position:fixed escapes all parent overflow clipping
  const digitalInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fiction / Non-Fiction
  const [fictionType, setFictionType] = useState<'fiction' | 'non-fiction' | undefined>(undefined);

  // Genre state
  const [localGenres, setLocalGenres] = useState<SanityBookGenre[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const genreDropdownRef = useRef<HTMLDivElement>(null);
  const [genresLoading, setGenresLoading] = useState(false);
  const [showGenreForm, setShowGenreForm] = useState(false);
  const [genreTitle, setGenreTitle] = useState('');
  const [genreSlug, setGenreSlug] = useState('');
  const [genreError, setGenreError] = useState('');
  const [genreCreating, setGenreCreating] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [createdSlug, setCreatedSlug] = useState('');
  const [createdId, setCreatedId] = useState('');

  // Load genres when modal opens
  useEffect(() => {
    if (!open) return;
    setGenresLoading(true);
    fetchBookGenres()
      .then(setLocalGenres)
      .finally(() => setGenresLoading(false));
  }, [open]);

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

  function reset() {
    setCoverFile(null);
    setCoverPreview(null);
    setTitle('');
    setDescription('');
    setStatus('draft');
    setIsbn('');
    setPages('');
    setLanguage('en');
    setPublishedAt('');
    setFormats([blankFormat()]);
    setDigitalFiles([null]);
    setFictionType(undefined);
    setSelectedGenreIds([]);
    setGenreDropdownOpen(false);
    setShowGenreForm(false);
    setGenreTitle('');
    setGenreSlug('');
    setGenreError('');
    setError('');
    setCreatedSlug('');
    setCreatedId('');
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    console.log('[AddBookModal] cover file selected:', file?.name, file?.size);
    if (!file) return;
    setCoverFile(file);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(URL.createObjectURL(file));
    e.target.value = '';
  }

  function close() {
    setOpen(false);
    reset();
  }

  function updateFormat(i: number, patch: Partial<Format>) {
    setFormats((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    const parsedFormats = formats
      .filter((f) => f.price !== '')
      .map((f) => ({
        formatType: f.formatType,
        price: parseFloat(f.price),
        ...(f.compareAtPrice ? { compareAtPrice: parseFloat(f.compareAtPrice) } : {}),
      }));

    if (parsedFormats.some((f) => isNaN(f.price) || f.price < 0)) {
      setError('Format prices must be valid positive numbers.');
      return;
    }

    startTransition(async () => {
      try {
        console.log('[AddBookModal] submitting, coverFile:', coverFile?.name ?? 'none', 'digitalFiles:', digitalFiles.map(f => f?.name ?? 'none'));
        const result = await createBook({
          title: title.trim(),
          description: description.trim() || undefined,
          isbn: isbn.trim() || undefined,
          pages: pages ? parseInt(pages, 10) : undefined,
          language: language.trim() || 'en',
          publishedAt: publishedAt || undefined,
          status,
          fictionType,
          formats: parsedFormats,
          genreIds: selectedGenreIds.length ? selectedGenreIds : undefined,
        });
        console.log('[AddBookModal] createBook ok, id:', result.id, 'formatKeys:', result.formatKeys);

        // Upload cover if one was selected
        if (coverFile) {
          console.log('[AddBookModal] uploading cover…');
          const fd = new FormData();
          fd.append('bookId', result.id);
          fd.append('file', coverFile);
          await uploadBookCover(fd);
          console.log('[AddBookModal] cover upload done');
        }

        // Upload digital assets — iterate formats, match to returned format keys
        let fmtKeyIdx = 0;
        for (let i = 0; i < formats.length; i++) {
          const fmt = formats[i];
          if (fmt.price === '') continue; // filtered out of parsedFormats
          const fmtKey = result.formatKeys[fmtKeyIdx++];
          if (!fmtKey) continue;
          if (fmt.formatType !== 'digital' && fmt.formatType !== 'bundle') continue;
          const file = digitalFiles[i];
          console.log(`[AddBookModal] format[${i}] type=${fmt.formatType} fmtKey=${fmtKey?.key} file=${file?.name ?? 'none'}`);
          if (!file) continue;
          const fd = new FormData();
          fd.append('bookId', result.id);
          fd.append('formatKey', fmtKey.key);
          fd.append('file', file);
          await uploadDigitalAsset(fd);
          console.log(`[AddBookModal] digital upload done for fmtKey=${fmtKey.key}`);
        }

        setCreatedSlug(result.slug);
        setCreatedId(result.id);
        router.refresh();
      } catch (err) {
        console.error('[AddBookModal] error:', err);
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  }

  const triggerCls =
    variant === 'primary'
      ? 'bg-untele px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
      : 'border border-slate-300 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-untele hover:text-untele dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300';

  return (
    <>
      <button type='button' onClick={() => setOpen(true)} className={triggerCls}>
        {label}
      </button>

      {open && (
        <div className='fixed inset-0 z-50 flex' role='dialog' aria-modal='true' aria-label='Add Book'>
          {/* Backdrop */}
          <div className='absolute inset-0 bg-black/50' onClick={close} aria-hidden='true' />

          {/* Slide-over panel */}
          <div className='relative ml-auto flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900'>
            {/* Header */}
            <div className='flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700'>
              <div className='bg-untele px-2 py-0.5'>
                <span className='text-[10px] font-black uppercase tracking-widest text-white'>
                  New Book
                </span>
              </div>
              <button
                type='button'
                onClick={close}
                className='text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Success state */}
            {createdSlug ? (
              <div className='flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center'>
                <div className='bg-untele px-3 py-1'>
                  <span className='text-xs font-black uppercase tracking-widest text-white'>
                    Book Created
                  </span>
                </div>
                <p className='text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white'>
                  {title}
                </p>
                <p className='text-xs text-slate-400'>
                  Status: <strong>{status}</strong>. Open Studio to add cover art, genres, and
                  Stripe pricing before publishing.
                </p>
                <div className='flex flex-wrap justify-center gap-3'>
                  <a
                    href={`/studio/intent/edit/id=${createdId}/type=book/`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='bg-untele px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:opacity-90'
                  >
                    Edit in Studio ↗
                  </a>
                  <a
                    href={`/bookstore/book/${createdSlug}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='border border-slate-300 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-untele hover:text-untele dark:border-slate-700 dark:text-slate-300'
                  >
                    View Page ↗
                  </a>
                </div>
                <div className='flex gap-3'>
                  <button
                    type='button'
                    onClick={reset}
                    className='text-xs font-bold uppercase tracking-widest text-untele hover:underline'
                  >
                    Add Another
                  </button>
                  <button
                    type='button'
                    onClick={close}
                    className='text-xs font-bold uppercase tracking-widest text-slate-400 hover:underline'
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className='flex flex-1 flex-col overflow-hidden'>
                <div className='flex-1 space-y-5 overflow-y-auto p-6'>
                  {/* Cover photo */}
                  <div>
                    <label className={`mb-2 block ${labelCls}`}>Cover Photo</label>
                    <div className='flex gap-4'>
                      {/* Preview */}
                      <div className='relative h-32 w-24 shrink-0 overflow-hidden border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'>
                        {coverPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={coverPreview}
                            alt='Cover preview'
                            className='h-full w-full object-cover'
                          />
                        ) : (
                          <div className='flex h-full items-center justify-center'>
                            <span className='text-center text-[9px] font-bold uppercase tracking-widest text-slate-300'>
                              No cover
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Upload control */}
                      <div className='flex flex-1 flex-col justify-center gap-2'>
                        <input
                          ref={coverInputRef}
                          type='file'
                          accept='image/jpeg,image/png,image/webp,image/avif'
                          className='hidden'
                          onChange={handleCoverChange}
                        />
                        <button
                          type='button'
                          onClick={() => coverInputRef.current?.click()}
                          className='border border-dashed border-slate-300 px-4 py-3 text-center hover:border-untele dark:border-slate-600 dark:hover:border-untele'
                        >
                          <span className='text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-untele'>
                            {coverFile ? 'Change Photo' : 'Choose Photo'}
                          </span>
                        </button>
                        {coverFile && (
                          <div className='flex items-center justify-between'>
                            <p className='truncate text-[10px] text-slate-400'>{coverFile.name}</p>
                            <button
                              type='button'
                              onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                              className='ml-2 shrink-0 text-[10px] font-bold text-slate-400 hover:text-untele'
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        <p className='text-[10px] text-slate-400'>
                          JPG, PNG, WebP — max 5 MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <FormField label='Title *'>
                    <input
                      type='text'
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder='e.g. Words from the Rubble'
                      required
                      className={inputCls}
                    />
                  </FormField>

                  {/* Description */}
                  <FormField label='Description'>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder='Brief synopsis...'
                      className={inputCls}
                    />
                  </FormField>

                  {/* Fiction / Non-Fiction */}
                  <div>
                    <label className={`mb-2 block ${labelCls}`}>Type</label>
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

                    {/* Inline genre creation sub-form */}
                    {showGenreForm && (
                      <div className='mb-3 border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800'>
                        <p className='mb-2 text-[10px] font-black uppercase tracking-widest text-untele'>
                          Create Genre
                        </p>
                        <div className='mb-2'>
                          <label className={`mb-1 block ${labelCls}`}>Title *</label>
                          <input
                            type='text'
                            value={genreTitle}
                            onChange={(e) => setGenreTitle(e.target.value)}
                            placeholder='e.g. Historical Fiction'
                            className={inputCls}
                          />
                        </div>
                        <div className='mb-3'>
                          <label className={`mb-1 block ${labelCls}`}>Slug *</label>
                          <div className='flex gap-2'>
                            <input
                              type='text'
                              value={genreSlug}
                              onChange={(e) => setGenreSlug(e.target.value)}
                              placeholder='historical-fiction'
                              className={`${inputCls} flex-1`}
                            />
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
                        {genreError && (
                          <p className='mb-2 text-[10px] font-bold text-red-500'>{genreError}</p>
                        )}
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

                    {/* Genre dropdown */}
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
                                  <span
                                    key={id}
                                    className='flex items-center gap-1 border border-untele/30 bg-untele/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-untele'
                                  >
                                    {g.title}
                                    <button
                                      type='button'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedGenreIds((prev) => prev.filter((gid) => gid !== id));
                                      }}
                                      className='leading-none text-untele/60 hover:text-untele'
                                    >
                                      ×
                                    </button>
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                          <ChevronDown
                            className={`ml-2 h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-150 ${genreDropdownOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {genreDropdownOpen && (
                          <div className='mt-px max-h-44 overflow-y-auto border border-t-0 border-slate-200 dark:border-slate-700'>
                            {localGenres.length === 0 ? (
                              <p className='px-3 py-2 text-[10px] text-slate-400'>
                                No genres yet — create one above.
                              </p>
                            ) : (
                              localGenres.map((g) => (
                                <label
                                  key={g._id}
                                  className='flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800'
                                >
                                  <input
                                    type='checkbox'
                                    checked={selectedGenreIds.includes(g._id)}
                                    onChange={(e) =>
                                      setSelectedGenreIds((prev) =>
                                        e.target.checked
                                          ? [...prev, g._id]
                                          : prev.filter((id) => id !== g._id),
                                      )
                                    }
                                    className='accent-untele'
                                  />
                                  <span className='text-xs text-slate-700 dark:text-slate-300'>
                                    {g.title}
                                  </span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <FormField label='Status'>
                    <div className='flex gap-4'>
                      {(['draft', 'published'] as const).map((s) => (
                        <label key={s} className='flex cursor-pointer items-center gap-2'>
                          <input
                            type='radio'
                            name='status'
                            value={s}
                            checked={status === s}
                            onChange={() => setStatus(s)}
                            className='accent-untele'
                          />
                          <span className='text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300'>
                            {s}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className='mt-1 text-[10px] text-slate-400'>
                      Draft books are hidden from the public store.
                    </p>
                  </FormField>

                  {/* Formats */}
                  <div>
                    <div className='mb-2 flex items-center justify-between'>
                      <span className={labelCls}>Formats</span>
                      {formats.length < 3 && (
                        <button
                          type='button'
                          onClick={() => {
                            setFormats((f) => [...f, blankFormat()]);
                            setDigitalFiles((f) => [...f, null]);
                          }}
                          className='flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-untele hover:underline'
                        >
                          <Plus className='h-3 w-3' /> Add Format
                        </button>
                      )}
                    </div>
                    <div className='space-y-3'>
                      {formats.map((fmt, i) => (
                        <div
                          key={i}
                          className='border border-slate-200 p-3 dark:border-slate-700'
                        >
                          <div className='mb-2 flex items-center justify-between'>
                            <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                              Format {i + 1}
                            </span>
                            {formats.length > 1 && (
                              <button
                                type='button'
                                onClick={() => {
                                  setFormats((f) => f.filter((_, idx) => idx !== i));
                                  setDigitalFiles((f) => f.filter((_, idx) => idx !== i));
                                }}
                                className='text-slate-300 hover:text-untele'
                              >
                                <Trash2 className='h-3.5 w-3.5' />
                              </button>
                            )}
                          </div>

                          {/* Format type radio */}
                          <div className='mb-2 flex gap-3'>
                            {(['physical', 'digital', 'bundle'] as const).map((ft) => (
                              <label key={ft} className='flex cursor-pointer items-center gap-1.5'>
                                <input
                                  type='radio'
                                  name={`fmt-${i}-type`}
                                  value={ft}
                                  checked={fmt.formatType === ft}
                                  onChange={() => updateFormat(i, { formatType: ft })}
                                  className='accent-untele'
                                />
                                <span className='text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400'>
                                  {ft}
                                </span>
                              </label>
                            ))}
                          </div>

                          {/* Price fields */}
                          <div className='grid grid-cols-2 gap-2'>
                            <div>
                              <label className={`mb-1 block ${labelCls}`}>Price (USD)</label>
                              <input
                                type='number'
                                step='0.01'
                                min='0'
                                value={fmt.price}
                                onChange={(e) => updateFormat(i, { price: e.target.value })}
                                placeholder='19.99'
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <label className={`mb-1 block ${labelCls}`}>Compare-at</label>
                              <input
                                type='number'
                                step='0.01'
                                min='0'
                                value={fmt.compareAtPrice}
                                onChange={(e) => updateFormat(i, { compareAtPrice: e.target.value })}
                                placeholder='24.99'
                                className={inputCls}
                              />
                            </div>
                          </div>

                          {/* Digital file upload — only for digital/bundle formats */}
                          {(fmt.formatType === 'digital' || fmt.formatType === 'bundle') && (
                            <div className='mt-3 border-t border-slate-100 pt-3 dark:border-slate-700'>
                              <p className={`mb-1.5 ${labelCls}`}>Digital File (PDF / EPUB / MOBI)</p>
                              <input
                                ref={(el) => { digitalInputRefs.current[i] = el; }}
                                type='file'
                                accept='.pdf,.epub,.mobi,.azw3,.zip,application/pdf,application/epub+zip'
                                className='fixed left-[-9999px] top-0 opacity-0'
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setDigitalFiles((prev) => prev.map((f, idx) => (idx === i ? file : f)));
                                  e.target.value = '';
                                }}
                              />
                              {digitalFiles[i] ? (
                                <div className='flex items-center justify-between gap-2 border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800'>
                                  <div className='min-w-0'>
                                    <p className='truncate text-[10px] font-bold text-slate-700 dark:text-slate-300'>
                                      {digitalFiles[i]!.name}
                                    </p>
                                    <p className='text-[10px] text-slate-400'>
                                      {(digitalFiles[i]!.size / (1024 * 1024)).toFixed(1)} MB
                                    </p>
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
                                  onClick={() => digitalInputRefs.current[i]?.click()}
                                  className='flex w-full items-center justify-center border border-dashed border-slate-300 px-4 py-2.5 hover:border-untele dark:border-slate-600'
                                >
                                  <span className='text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-untele'>
                                    Choose File
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
                      <input
                        type='text'
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        placeholder='978-...'
                        className={inputCls}
                      />
                    </FormField>
                    <FormField label='Pages'>
                      <input
                        type='number'
                        min='1'
                        value={pages}
                        onChange={(e) => setPages(e.target.value)}
                        placeholder='250'
                        className={inputCls}
                      />
                    </FormField>
                    <FormField label='Language'>
                      <input
                        type='text'
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        placeholder='en'
                        className={inputCls}
                      />
                    </FormField>
                    <FormField label='Publish Date'>
                      <input
                        type='date'
                        value={publishedAt}
                        onChange={(e) => setPublishedAt(e.target.value)}
                        className={inputCls}
                      />
                    </FormField>
                  </div>

                  <p className='text-[10px] text-slate-400'>
                    Stripe Price IDs can be added in Studio after creation.
                  </p>

                  {error && (
                    <p className='border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400'>
                      {error}
                    </p>
                  )}
                </div>

                {/* Footer actions */}
                <div className='flex shrink-0 items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700'>
                  <button
                    type='button'
                    onClick={close}
                    className='text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={isPending}
                    className='bg-untele px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
                  >
                    {isPending ? 'Creating…' : 'Create Book'}
                  </button>
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
