'use server';
// src/lib/portal/book-actions.ts
// Server actions for author book management.

import { requireAuthor } from '@/lib/auth/roles';
import { writeClient } from '@/lib/sanity/lib/write-client';
import { getShopServiceClient } from '@/lib/bookstore/supabase';
import { getSanityAuthorIdForCurrentUser } from './author-actions';
import sanityClient from '@/lib/sanity/lib/client';
import type { SanityBookGenre } from '@/lib/bookstore/types';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function makeKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatLabel(fileName: string, mimeType: string): string {
  const ext = fileName.split('.').pop()?.toUpperCase() ?? '';
  if (mimeType === 'application/pdf' || ext === 'PDF') return 'PDF';
  if (ext === 'EPUB') return 'EPUB';
  if (ext === 'MOBI' || ext === 'AZW3') return 'MOBI';
  if (ext === 'ZIP') return 'ZIP';
  return ext || 'Unknown';
}

function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------

export interface CreateBookInput {
  title: string;
  description?: string;
  isbn?: string;
  pages?: number;
  language?: string;
  publishedAt?: string;
  status: 'draft' | 'published';
  fictionType?: 'fiction' | 'non-fiction';
  genreIds?: string[];
  formats: Array<{
    formatType: 'physical' | 'digital' | 'bundle';
    price: number;
    compareAtPrice?: number;
  }>;
}

export interface FormatKeyEntry {
  key: string;
  formatType: 'physical' | 'digital' | 'bundle';
}

export async function createBook(
  input: CreateBookInput
): Promise<{ id: string; slug: string; formatKeys: FormatKeyEntry[] }> {
  const { id: clerkUserId } = await requireAuthor();

  if (!input.title?.trim()) throw new Error('Title is required.');

  const slug = slugify(input.title);
  if (!slug) throw new Error('Could not generate a valid slug from the title.');

  const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);

  const descriptionBlocks = input.description?.trim()
    ? input.description
        .trim()
        .split(/\n\n+/)
        .map((para) => para.trim())
        .filter(Boolean)
        .map((para) => ({
          _type: 'block',
          _key: makeKey(),
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: makeKey(), text: para, marks: [] }],
        }))
    : undefined;

  // Pre-generate keys so we can return them for digital asset uploads
  const formatEntries = input.formats.map((f) => ({
    key: makeKey(),
    data: f,
  }));

  const doc = await writeClient.create({
    _type: 'book',
    title: input.title.trim(),
    slug: { _type: 'slug', current: slug },
    status: input.status,
    language: input.language?.trim() || 'en',
    ...(sanityAuthorId ? { author: { _type: 'reference', _ref: sanityAuthorId } } : {}),
    ...(input.isbn?.trim() ? { isbn: input.isbn.trim() } : {}),
    ...(input.pages != null ? { pages: input.pages } : {}),
    ...(input.publishedAt ? { publishedAt: input.publishedAt } : {}),
    ...(descriptionBlocks ? { description: descriptionBlocks } : {}),
    ...(input.fictionType ? { fictionType: input.fictionType } : {}),
    ...(input.genreIds?.length
      ? { genre: input.genreIds.map((id) => ({ _type: 'reference', _ref: id, _key: makeKey() })) }
      : {}),
    formats: formatEntries.map(({ key, data: f }) => ({
      _type: 'bookFormat',
      _key: key,
      formatType: f.formatType,
      price: f.price,
      ...(f.compareAtPrice != null ? { compareAtPrice: f.compareAtPrice } : {}),
    })),
  });

  return {
    id: doc._id,
    slug,
    formatKeys: formatEntries.map(({ key, data }) => ({
      key,
      formatType: data.formatType,
    })),
  };
}

// ---------------------------------------------------------------------------
// Upload a book cover to the public book-covers bucket.
// ---------------------------------------------------------------------------

export async function uploadBookCover(formData: FormData): Promise<string> {
  console.log('[uploadBookCover] called');
  await requireAuthor();
  console.log('[uploadBookCover] auth ok');

  if (!process.env.SUPABASE_SHOP_URL) throw new Error('Supabase not configured');

  const bookId = formData.get('bookId') as string;
  const file = formData.get('file') as File | null;
  console.log(
    '[uploadBookCover] bookId:',
    bookId,
    'file:',
    file?.name,
    'size:',
    file?.size,
    'type:',
    file?.type
  );
  if (!bookId || !file) throw new Error('Missing bookId or file');

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const storagePath = `${bookId}/cover.${ext}`;
  console.log('[uploadBookCover] uploading to path:', storagePath);
  const supabase = getShopServiceClient();

  const bytes = await file.arrayBuffer();
  console.log('[uploadBookCover] bytes read, byteLength:', bytes.byteLength);

  const { error } = await supabase.storage
    .from('book-covers')
    .upload(storagePath, Buffer.from(bytes), { contentType: file.type, upsert: true });

  if (error) {
    console.error('[uploadBookCover] upload error:', error);
    throw new Error(`Cover upload failed: ${error.message}`);
  }

  console.log('[uploadBookCover] upload ok');
  const { data: urlData } = supabase.storage.from('book-covers').getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;

  await writeClient.patch(bookId).set({ coverImageUrl: publicUrl }).commit();
  console.log('[uploadBookCover] sanity patched, url:', publicUrl);

  return publicUrl;
}

// ---------------------------------------------------------------------------
// Upload a digital asset (PDF/EPUB/MOBI) to the private digital-books bucket
// and write the storage path + metadata back into the Sanity format item.
// ---------------------------------------------------------------------------

export async function uploadDigitalAsset(formData: FormData): Promise<string> {
  console.log('[uploadDigitalAsset] called');
  await requireAuthor();
  console.log('[uploadDigitalAsset] auth ok');

  if (!process.env.SUPABASE_SHOP_URL) throw new Error('Supabase not configured');

  const bookId = formData.get('bookId') as string;
  const formatKey = formData.get('formatKey') as string;
  const file = formData.get('file') as File | null;
  console.log(
    '[uploadDigitalAsset] bookId:',
    bookId,
    'formatKey:',
    formatKey,
    'file:',
    file?.name,
    'size:',
    file?.size
  );
  if (!bookId || !formatKey || !file) throw new Error('Missing bookId, formatKey, or file');

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const storagePath = `books/${bookId}/${formatKey}/asset.${ext}`;
  console.log('[uploadDigitalAsset] uploading to path:', storagePath);
  const supabase = getShopServiceClient();

  const bytes = await file.arrayBuffer();
  console.log('[uploadDigitalAsset] bytes read, byteLength:', bytes.byteLength);

  const { error } = await supabase.storage
    .from('digital-books')
    .upload(storagePath, Buffer.from(bytes), { contentType: file.type, upsert: true });

  if (error) {
    console.error('[uploadDigitalAsset] upload error:', error);
    throw new Error(`Digital asset upload failed: ${error.message}`);
  }

  console.log('[uploadDigitalAsset] upload ok');
  await writeClient
    .patch(bookId)
    .set({
      [`formats[_key=="${formatKey}"].digitalAsset.supabaseStoragePath`]: storagePath,
      [`formats[_key=="${formatKey}"].digitalAsset.fileFormat`]: formatLabel(file.name, file.type),
      [`formats[_key=="${formatKey}"].digitalAsset.fileSize`]: humanFileSize(file.size),
    })
    .commit();
  console.log('[uploadDigitalAsset] sanity patched');

  return storagePath;
}

// ---------------------------------------------------------------------------
// Update an existing book document in Sanity.
// ---------------------------------------------------------------------------

export interface UpdateBookInput {
  title?: string;
  description?: string;
  isbn?: string;
  pages?: number | null;
  language?: string;
  publishedAt?: string;
  status?: 'draft' | 'published' | 'out-of-stock' | 'discontinued';
  fictionType?: 'fiction' | 'non-fiction' | null;
  genreIds?: string[];
  formatPrices?: Array<{
    key: string;
    price: number;
    compareAtPrice?: number | null;
  }>;
}

export async function updateBook(bookId: string, input: UpdateBookInput): Promise<void> {
  await requireAuthor();

  const patch: Record<string, unknown> = {};
  const unset: string[] = [];

  if (input.title?.trim()) patch.title = input.title.trim();
  if (input.status) patch.status = input.status;
  if (input.language?.trim()) patch.language = input.language.trim();

  if (input.isbn?.trim()) patch.isbn = input.isbn.trim();
  else if (input.isbn !== undefined) unset.push('isbn');

  if (input.pages != null) patch.pages = input.pages;
  else if (input.pages === null) unset.push('pages');

  if (input.publishedAt) patch.publishedAt = input.publishedAt;
  else if (input.publishedAt !== undefined) unset.push('publishedAt');

  if (input.description !== undefined) {
    if (input.description.trim()) {
      patch.description = input.description
        .trim()
        .split(/\n\n+/)
        .map((para) => para.trim())
        .filter(Boolean)
        .map((para) => ({
          _type: 'block',
          _key: makeKey(),
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: makeKey(), text: para, marks: [] }],
        }));
    } else {
      unset.push('description');
    }
  }

  if (input.fictionType !== undefined) {
    if (input.fictionType) patch.fictionType = input.fictionType;
    else unset.push('fictionType');
  }

  if (input.genreIds !== undefined) {
    if (input.genreIds.length > 0) {
      patch.genre = input.genreIds.map((id) => ({ _type: 'reference', _ref: id }));
    } else {
      unset.push('genre');
    }
  }

  if (input.formatPrices?.length) {
    for (const { key, price, compareAtPrice } of input.formatPrices) {
      patch[`formats[_key=="${key}"].price`] = price;
      if (compareAtPrice != null) {
        patch[`formats[_key=="${key}"].compareAtPrice`] = compareAtPrice;
      } else {
        unset.push(`formats[_key=="${key}"].compareAtPrice`);
      }
    }
  }

  let p = writeClient.patch(bookId);
  if (Object.keys(patch).length > 0) p = p.set(patch);
  if (unset.length > 0) p = p.unset(unset);
  await p.commit();
}

// ---------------------------------------------------------------------------
// Fetch all book genres for selection in the UI.
// ---------------------------------------------------------------------------

export async function fetchBookGenres(): Promise<SanityBookGenre[]> {
  await requireAuthor();
  const genres = await sanityClient.fetch<SanityBookGenre[]>(
    `*[_type == "bookGenre"] | order(title asc) { _id, title, slug }`
  );
  return genres ?? [];
}

// ---------------------------------------------------------------------------
// Create a new genre document in Sanity.
// ---------------------------------------------------------------------------

export async function createBookGenre(title: string, slug: string): Promise<SanityBookGenre> {
  await requireAuthor();

  if (!title.trim()) throw new Error('Genre title is required.');
  if (!slug.trim()) throw new Error('Genre slug is required.');

  const doc = await writeClient.create({
    _type: 'bookGenre',
    title: title.trim(),
    slug: { _type: 'slug', current: slug.trim() },
  });

  return { _id: doc._id, title: doc.title as string, slug: doc.slug as { current: string } };
}
