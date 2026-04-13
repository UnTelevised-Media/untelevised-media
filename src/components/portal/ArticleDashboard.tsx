// src/components/portal/ArticleDashboard.tsx
// Client component — handles article list UI: search, filter, sort, view toggle, actions.
'use client';

import { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteArticle } from '@/lib/portal/article-actions';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PortalArticle {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: { current: string };
  status?: string | null;
  featured: boolean;
  breakingNews: boolean;
  needsReview: boolean;
  publishedAt?: string;
  description?: string;
  authorId: string;
  author?: { _id: string; name: string; slug?: { current: string } };
  categories?: Array<{ _id: string; title: string }>;
  tags?: string[];
}

type SortKey = 'updatedAt' | 'createdAt' | 'title';
type ViewMode = 'table' | 'card';

interface Props {
  articles: PortalArticle[];
  isEditorPlus: boolean;
  currentSanityAuthorId?: string;
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ article }: { article: PortalArticle }) {
  const isPublished = !!article.publishedAt || article.status === 'published';
  if (isPublished) {
    return (
      <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
        Published
      </Badge>
    );
  }
  if (article.needsReview) {
    return (
      <Badge className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'>
        In Review
      </Badge>
    );
  }
  return (
    <Badge className='bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
      Draft
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ArticleDashboard({ articles, isEditorPlus, currentSanityAuthorId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // UI state
  const [view, setView] = useState<ViewMode>('table');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('updatedAt');
  const [deleteTarget, setDeleteTarget] = useState<PortalArticle | null>(null);

  // ---------------------------------------------------------------------------
  // Filtered + sorted articles
  // ---------------------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = [...articles];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.tags?.some((t) => t.toLowerCase().includes(q)) ||
          a.categories?.some((c) => c.title?.toLowerCase().includes(q)),
      );
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'needsReview') {
        list = list.filter((a) => a.needsReview);
      } else if (filterStatus === 'published') {
        list = list.filter((a) => !!a.publishedAt || a.status === 'published');
      } else if (filterStatus === 'draft') {
        list = list.filter((a) => !a.publishedAt && a.status !== 'published');
      }
    }

    list.sort((a, b) => {
      if (sortBy === 'title') return (a.title ?? '').localeCompare(b.title ?? '');
      if (sortBy === 'createdAt') return b._createdAt.localeCompare(a._createdAt);
      // default: updatedAt
      return b._updatedAt.localeCompare(a._updatedAt);
    });

    return list;
  }, [articles, search, filterStatus, sortBy]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  function handleDelete(article: PortalArticle) {
    setDeleteTarget(article);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget._id;
    setDeleteTarget(null);
    startTransition(async () => {
      const result = await deleteArticle(id);
      if (result.success) {
        toast.success('Article deleted.');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------
  if (articles.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-24 text-center'>
        <p className='mb-2 text-lg font-bold text-slate-700 dark:text-slate-300'>
          No articles yet
        </p>
        <p className='mb-6 text-sm text-slate-500'>
          Ready to write your first story?
        </p>
        <Link
          href='/portal/articles/new'
          className='bg-untele px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:opacity-90'
        >
          Write your first article
        </Link>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Toolbar
  // ---------------------------------------------------------------------------
  return (
    <div>
      {/* Toolbar */}
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center'>
        <Input
          placeholder='Search by title, tag, or category…'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='sm:max-w-xs'
          aria-label='Search articles'
        />

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className='sm:w-40' aria-label='Filter by status'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All statuses</SelectItem>
            <SelectItem value='published'>Published</SelectItem>
            <SelectItem value='draft'>Draft</SelectItem>
            <SelectItem value='needsReview'>In Review</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
          <SelectTrigger className='sm:w-44' aria-label='Sort articles'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='updatedAt'>Last modified</SelectItem>
            <SelectItem value='createdAt'>Date created</SelectItem>
            <SelectItem value='title'>Title A–Z</SelectItem>
          </SelectContent>
        </Select>

        <div className='ml-auto flex gap-1'>
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setView('table')}
            aria-label='Table view'
            className={view === 'table' ? 'bg-untele text-white' : ''}
          >
            ☰ Table
          </Button>
          <Button
            variant={view === 'card' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setView('card')}
            aria-label='Card view'
            className={view === 'card' ? 'bg-untele text-white' : ''}
          >
            ⊞ Cards
          </Button>
        </div>
      </div>

      {filtered.length === 0 && (
        <p className='py-10 text-center text-sm text-slate-500'>
          No articles match your filters.
        </p>
      )}

      {/* TABLE VIEW */}
      {view === 'table' && filtered.length > 0 && (
        <div className='overflow-auto rounded border border-slate-200 dark:border-slate-800'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                {isEditorPlus && <TableHead>Author</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Last updated</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((article) => (
                <ArticleTableRow
                  key={article._id}
                  article={article}
                  isEditorPlus={isEditorPlus}
                  currentSanityAuthorId={currentSanityAuthorId}
                  onDelete={() => handleDelete(article)}
                  isPending={isPending}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CARD VIEW */}
      {view === 'card' && filtered.length > 0 && (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {filtered.map((article) => (
            <ArticleCard
              key={article._id}
              article={article}
              isEditorPlus={isEditorPlus}
              currentSanityAuthorId={currentSanityAuthorId}
              onDelete={() => handleDelete(article)}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete article?</DialogTitle>
            <DialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be permanently deleted. This cannot be undone.
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

// ---------------------------------------------------------------------------
// Table row
// ---------------------------------------------------------------------------

function ArticleTableRow({
  article,
  isEditorPlus,
  currentSanityAuthorId,
  onDelete,
  isPending,
}: {
  article: PortalArticle;
  isEditorPlus: boolean;
  currentSanityAuthorId?: string;
  onDelete: () => void;
  isPending: boolean;
}) {
  const canDelete =
    isEditorPlus ||
    (article.authorId === currentSanityAuthorId && !article.publishedAt);

  return (
    <TableRow>
      <TableCell className='max-w-xs'>
        <Link
          href={`/portal/articles/${article._id}/edit`}
          className='font-medium hover:text-untele hover:underline'
        >
          {article.title || 'Untitled'}
        </Link>
        {article.breakingNews && (
          <span className='ml-2 text-xs font-bold uppercase text-untele'>Breaking</span>
        )}
      </TableCell>
      {isEditorPlus && (
        <TableCell className='text-sm text-slate-500'>{article.author?.name ?? '—'}</TableCell>
      )}
      <TableCell>
        <StatusBadge article={article} />
      </TableCell>
      <TableCell className='text-sm text-slate-500'>
        {article.categories?.map((c) => c.title).join(', ') || '—'}
      </TableCell>
      <TableCell className='whitespace-nowrap text-sm text-slate-500'>
        {new Date(article._updatedAt).toLocaleDateString()}
      </TableCell>
      <TableCell className='text-right'>
        <ArticleActions
          article={article}
          canDelete={canDelete}
          onDelete={onDelete}
          isPending={isPending}
        />
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

function ArticleCard({
  article,
  isEditorPlus,
  currentSanityAuthorId,
  onDelete,
  isPending,
}: {
  article: PortalArticle;
  isEditorPlus: boolean;
  currentSanityAuthorId?: string;
  onDelete: () => void;
  isPending: boolean;
}) {
  const canDelete =
    isEditorPlus ||
    (article.authorId === currentSanityAuthorId && !article.publishedAt);

  return (
    <div className='border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
      <div className='mb-2 flex items-start justify-between gap-2'>
        <StatusBadge article={article} />
        <ArticleActions
          article={article}
          canDelete={canDelete}
          onDelete={onDelete}
          isPending={isPending}
        />
      </div>
      <Link
        href={`/portal/articles/${article._id}/edit`}
        className='mb-1 block text-sm font-bold leading-snug hover:text-untele hover:underline'
      >
        {article.title || 'Untitled'}
      </Link>
      {isEditorPlus && article.author?.name && (
        <p className='mb-1 text-xs text-slate-500'>by {article.author.name}</p>
      )}
      <p className='mb-3 text-xs text-slate-400'>
        Updated {new Date(article._updatedAt).toLocaleDateString()}
      </p>
      {article.categories && article.categories.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {article.categories.map((c) => (
            <span
              key={c._id}
              className='bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            >
              {c.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Action menu
// ---------------------------------------------------------------------------

function ArticleActions({
  article,
  canDelete,
  onDelete,
  isPending,
}: {
  article: PortalArticle;
  canDelete: boolean;
  onDelete: () => void;
  isPending: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' disabled={isPending} aria-label='Article actions'>
          ···
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem asChild>
          <Link href={`/portal/articles/${article._id}/edit`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`/articles/${article.slug?.current}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            Preview ↗
          </a>
        </DropdownMenuItem>
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-red-600 focus:text-red-600'
              onClick={onDelete}
            >
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
