// src/components/portal/SourceLibrary.tsx
// Client component — searchable source document library with edit/delete actions.
'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteSource } from '@/lib/portal/source-actions';
import { toast } from 'sonner';

interface LinkedArticle {
  _id: string;
  title: string;
  slug?: { current: string };
}

interface PortalSource {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  label: string;
  type?: string;
  url?: string;
  description?: string;
  isAnonymous?: boolean;
  linkedArticles?: LinkedArticle[];
}

interface Props {
  sources: PortalSource[];
  isEditorPlus: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  document: 'Document',
  interview: 'Interview',
  statement: 'Statement',
  data: 'Data',
  media: 'Media',
  onscene: 'On-Scene',
  article: 'News Article',
  other: 'Other',
};

export default function SourceLibrary({ sources, isEditorPlus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PortalSource | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return sources;
    const q = search.toLowerCase();
    return sources.filter(
      (s) =>
        s.label?.toLowerCase().includes(q) ||
        s.url?.toLowerCase().includes(q) ||
        s.type?.toLowerCase().includes(q),
    );
  }, [sources, search]);

  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget._id;
    setDeleteTarget(null);
    startTransition(async () => {
      const result = await deleteSource(id);
      if (result.success) {
        toast.success('Source deleted.');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (sources.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-24 text-center'>
        <p className='mb-2 text-lg font-bold text-slate-700 dark:text-slate-300'>
          No sources yet
        </p>
        <p className='mb-6 text-sm text-slate-500'>
          Build your source library to keep your reporting organized and transparent.
        </p>
        <Link
          href='/portal/sources/new'
          className='bg-untele px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:opacity-90'
        >
          Add your first source
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      <div className='mb-6'>
        <Input
          placeholder='Search by title, URL, or type…'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='max-w-sm'
        />
      </div>

      {filtered.length === 0 && (
        <p className='py-10 text-center text-sm text-slate-500'>
          No sources match your search.
        </p>
      )}

      {/* Source cards */}
      <div className='space-y-3'>
        {filtered.map((source) => (
          <div
            key={source._id}
            className='border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0 flex-1'>
                <div className='mb-1 flex flex-wrap items-center gap-2'>
                  <span className='font-bold text-slate-900 dark:text-slate-100'>
                    {source.isAnonymous ? '🔒 Anonymous Source' : source.label}
                  </span>
                  {source.type && (
                    <Badge className='bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
                      {TYPE_LABELS[source.type] ?? source.type}
                    </Badge>
                  )}
                </div>

                {source.url && !source.isAnonymous && (
                  <a
                    href={source.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mb-1 block truncate text-xs text-slate-400 hover:text-untele'
                  >
                    {source.url}
                  </a>
                )}

                {source.description && (
                  <p className='mb-2 text-sm text-slate-500'>{source.description}</p>
                )}

                {/* Linked articles */}
                {source.linkedArticles && source.linkedArticles.length > 0 && (
                  <div className='flex flex-wrap gap-1'>
                    <span className='text-xs text-slate-400'>Used in:</span>
                    {source.linkedArticles.map((a) => (
                      <Link
                        key={a._id}
                        href={`/portal/articles/${a._id}/edit`}
                        className='text-xs text-untele hover:underline'
                      >
                        {a.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className='flex shrink-0 gap-2'>
                <Button variant='outline' size='sm' asChild>
                  <Link href={`/portal/sources/${source._id}/edit`}>Edit</Link>
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='text-red-600 hover:text-red-700'
                  disabled={isPending}
                  onClick={() => setDeleteTarget(source)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete source?</DialogTitle>
            <DialogDescription>
              &ldquo;{deleteTarget?.label}&rdquo; will be permanently deleted. Any articles
              referencing this source will lose the link.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className='bg-untele text-white hover:opacity-90'
              onClick={confirmDelete}
              disabled={isPending}
            >
              {isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
