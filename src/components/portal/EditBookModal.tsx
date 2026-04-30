'use client';
// src/components/portal/EditBookModal.tsx
// In-portal book editor. Slide-over form pre-populated from existing book data.

import { useState, useEffect, useRef, useTransition } from 'react';
import { X, Pencil, Plus, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  updateBook,
  uploadBookCover,
  uploadDigitalAsset,
  fetchBookGenres,
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

// ---------------------------------------------------------------------------

interface EditFormat {
  key: string;
  formatType: 'physical' | 'digital' | 'bundle';
  price: string;
  compareAtPrice: string;
  existingAssetPath?: string;
}

interface Props {
  book: SanityBook;
}

export default function EditBookModal({ book }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // File input refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const digitalInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fiction / Non-Fiction
  const [fictionType, setFictionType] = useState<'fiction' | 'non-fiction' | undefined>(undefined);

  // Genre dropdown
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const genreDropdownRef = useRef<HTMLDivElement>(null);

  // Cover state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

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

  // Genre state
  const [localGenres, setLocalGenres] = useState<SanityBookGenre[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [genresLoading, setGenresLoading] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Populate form + load genres when modal opens
  useEffect(() => {
    if (!open) return;

    setTitle(book.title);
    setDescription(blocksToText(book.description));
    setStatus(book.status);
    setIsbn(book.isbn ?? '');
    setPages(book.pages != null ? String(book.pages) : '');
    setLanguage(book.language ?? 'en');
    setPublishedAt(book.publishedAt ?? '');
    setEditFormats(
      (book.formats ?? []).map((f) => ({
        key: f._key,
        formatType: f.formatType,
        price: String(f.price ?? ''),
        compareAtPrice: f.compareAtPrice != null ? String(f.compareAtPrice) : '',
        existingAssetPath: f.digitalAsset?.supabaseStoragePath,
      })),
    );
    setDigitalFiles((book.formats ?? []).map(() => null));
    setSelectedGenreIds((book.genre ?? []).map((g) => g._id));
    setCoverFile(null);
    setCoverPreview(null);
    setError('');
    setSaved(false);

    setFictionType(book.fictionType ?? undefined);
    setGenreDropdownOpen(false);

    setGenresLoading(true);
    fetchBookGenres()
      .then(setLocalGenres)
      .finally(() => setGenresLoading(false));
  }, [open, book]);

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

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    console.log('[EditBookModal] cover file selected:', file?.name, file?.size);
    if (!file) return;
    setCoverFile(file);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(URL.createObjectURL(file));
    e.target.value = '';
  }

  function updateFormat(i: number, patch: Partial<EditFormat>) {
    setEditFormats((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Title is required.'); return; }

    const formatPrices = editFormats
      .map((f) => ({
        key: f.key,
        price: parseFloat(f.price),
        compareAtPrice: f.compareAtPrice ? parseFloat(f.compareAtPrice) : null,
      }))
      .filter((f) => !isNaN(f.price));

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
        });

        if (coverFile) {
          const fd = new FormData();
          fd.append('bookId', book._id);
          fd.append('file', coverFile);
          await uploadBookCover(fd);
        }

        for (let i = 0; i < editFormats.length; i++) {
          const fmt = editFormats[i];
          if (fmt.formatType !== 'digital' && fmt.formatType !== 'bundle') continue;
          const file = digitalFiles[i];
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
                <div className='mb-0.5 bg-untele px-2 py-0.5 inline-block'>
                  <span className='text-[10px] font-black uppercase tracking-widest text-white'>Edit Book</span>
                </div>
                <p className='text-xs text-slate-400 truncate max-w-[280px]'>{book.title}</p>
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

                  {/* Cover */}
                  <div>
                    <label className={`mb-2 block ${labelCls}`}>Cover Photo</label>
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
                          className='border border-dashed border-slate-300 px-4 py-3 text-center hover:border-untele dark:border-slate-600'
                        >
                          <span className='text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-untele'>
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
                      <label className={labelCls}>Genres</label>
                      <a
                        href='/portal/books'
                        className='flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-untele'
                        title='Add genres via Add Book modal'
                      >
                        <Plus className='h-3 w-3' />
                        New Genre in Add Book
                      </a>
                    </div>
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
                                No genres — add via the Add Book widget.
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
                  <div>
                    <label className={`mb-2 block ${labelCls}`}>Status</label>
                    <div className='flex flex-wrap gap-4'>
                      {(['draft', 'published', 'out-of-stock', 'discontinued'] as const).map((s) => (
                        <label key={s} className='flex cursor-pointer items-center gap-2'>
                          <input type='radio' name='edit-status' value={s} checked={status === s} onChange={() => setStatus(s)} className='accent-untele' />
                          <span className='text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300'>{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Formats — edit prices only, type is locked */}
                  {editFormats.length > 0 && (
                    <div>
                      <label className={`mb-2 block ${labelCls}`}>Format Prices</label>
                      <div className='space-y-3'>
                        {editFormats.map((fmt, i) => (
                          <div key={fmt.key} className='border border-slate-200 p-3 dark:border-slate-700'>
                            <p className='mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400'>
                              {fmt.formatType === 'physical' && 'Physical Book'}
                              {fmt.formatType === 'digital' && 'Digital Edition'}
                              {fmt.formatType === 'bundle' && 'Physical + Digital Bundle'}
                            </p>
                            <div className='grid grid-cols-2 gap-2'>
                              <div>
                                <label className={`mb-1 block ${labelCls}`}>Price (USD)</label>
                                <input
                                  type='number'
                                  step='0.01'
                                  min='0'
                                  value={fmt.price}
                                  onChange={(e) => updateFormat(i, { price: e.target.value })}
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
                                  placeholder='—'
                                  className={inputCls}
                                />
                              </div>
                            </div>

                            {/* Digital file replacement */}
                            {(fmt.formatType === 'digital' || fmt.formatType === 'bundle') && (
                              <div className='mt-3 border-t border-slate-100 pt-3 dark:border-slate-700'>
                                <label className={`mb-1.5 block ${labelCls}`}>Digital File</label>
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
                                    onClick={() => digitalInputRefs.current[i]?.click()}
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
                      <p className='mt-2 text-[10px] text-slate-400'>
                        To add or remove formats, use Studio.
                      </p>
                    </div>
                  )}

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

                  {error && (
                    <p className='border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400'>
                      {error}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className='flex shrink-0 items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700'>
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
