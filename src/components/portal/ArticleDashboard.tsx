// src/components/portal/ArticleDashboard.tsx
// Client component — article list with tabs, search, sort, view toggle, and editorial actions.
'use client';

import { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import {
  deleteArticle,
  requestArticleDeletion,
  approveArticleDeletion,
  denyArticleDeletion,
  retractArticle,
} from '@/lib/portal/article-actions';
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
  mainImage?: { asset?: { url?: string }; alt?: string };
  deletionRequest?: {
    reason: string;
    requestedAt: string;
    requestedByName: string;
    originalPublishedAt?: string;
  };
  correctionType?: string;
  reviewedById?: string;
}

type SortKey = 'updatedAt' | 'createdAt' | 'title';
type ViewMode = 'table' | 'card';
type TabKey = 'drafts' | 'review' | 'published';
type AuthorFilter = 'all' | 'mine' | 'others' | 'reviewed';

interface Props {
  articles: PortalArticle[];
  isEditorPlus: boolean;
  currentSanityAuthorId?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// In previewDrafts perspective, unpublished docs always have a "drafts." prefix
// regardless of what the status field says (e.g. unpublishing retains status:'published').
function isPublished(a: PortalArticle) {
  return !a._id.startsWith('drafts.');
}

function isInReview(a: PortalArticle) {
  return !isPublished(a) && (a.needsReview || !!a.deletionRequest);
}

function isDraft(a: PortalArticle) {
  return !isPublished(a) && !a.needsReview && !a.deletionRequest;
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ article }: { article: PortalArticle }) {
  if (article.deletionRequest) {
    return (
      <Badge className='bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'>
        Removal Requested
      </Badge>
    );
  }
  if (article.correctionType === 'retraction') {
    return (
      <Badge className='bg-red-900/20 text-red-700 dark:bg-red-900/40 dark:text-red-300'>
        Retracted
      </Badge>
    );
  }
  if (isPublished(article)) {
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
  const [activeTab, setActiveTab] = useState<TabKey>('drafts');
  const [sortBy, setSortBy] = useState<SortKey>('updatedAt');
  const [authorFilter, setAuthorFilter] = useState<AuthorFilter>('all');

  // Editor hard-delete / approve deletion
  const [deleteTarget, setDeleteTarget] = useState<PortalArticle | null>(null);

  // Author removal request
  const [removalTarget, setRemovalTarget] = useState<PortalArticle | null>(null);
  const [removalReason, setRemovalReason] = useState('');

  // Editor retraction
  const [retractionTarget, setRetractionTarget] = useState<PortalArticle | null>(null);
  const [retractionData, setRetractionData] = useState({
    issuedAt: new Date().toISOString().slice(0, 16),
    summary: '',
    detail: '',
  });

  // ---------------------------------------------------------------------------
  // Author-scoped base list (editors only)
  // ---------------------------------------------------------------------------
  const authorScoped = useMemo(() => {
    if (!isEditorPlus || authorFilter === 'all') return articles;
    if (authorFilter === 'mine') return articles.filter((a) => a.authorId === currentSanityAuthorId);
    if (authorFilter === 'reviewed') return articles.filter((a) => a.reviewedById === currentSanityAuthorId);
    return articles.filter((a) => a.authorId !== currentSanityAuthorId);
  }, [articles, isEditorPlus, authorFilter, currentSanityAuthorId]);

  // ---------------------------------------------------------------------------
  // Tab counts (based on author-scoped list)
  // ---------------------------------------------------------------------------
  const tabCounts = useMemo(
    () => ({
      drafts: authorScoped.filter(isDraft).length,
      review: authorScoped.filter(isInReview).length,
      published: authorScoped.filter(isPublished).length,
    }),
    [authorScoped],
  );

  // ---------------------------------------------------------------------------
  // Filtered + sorted list
  // ---------------------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = authorScoped.filter(
      activeTab === 'drafts' ? isDraft : activeTab === 'review' ? isInReview : isPublished,
    );

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.tags?.some((t) => t.toLowerCase().includes(q)) ||
          a.categories?.some((c) => c.title?.toLowerCase().includes(q)),
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'title') return (a.title ?? '').localeCompare(b.title ?? '');
      if (sortBy === 'createdAt') return b._createdAt.localeCompare(a._createdAt);
      return b._updatedAt.localeCompare(a._updatedAt);
    });
  }, [authorScoped, activeTab, search, sortBy]);

  // ---------------------------------------------------------------------------
  // Action handlers
  // ---------------------------------------------------------------------------

  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget._id;
    const approvingRequest = !!deleteTarget.deletionRequest;
    setDeleteTarget(null);
    startTransition(async () => {
      const result = approvingRequest
        ? await approveArticleDeletion(id)
        : await deleteArticle(id);
      if (result.success) {
        toast.success(approvingRequest ? 'Removal approved — article deleted.' : 'Article deleted.');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function confirmRemovalRequest() {
    if (!removalTarget || removalReason.trim().length < 10) return;
    const id = removalTarget._id;
    const reason = removalReason.trim();
    setRemovalTarget(null);
    setRemovalReason('');
    startTransition(async () => {
      const result = await requestArticleDeletion(id, reason);
      if (result.success) {
        toast.success('Removal request submitted. An editor will review it.');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDenyDeletion(article: PortalArticle) {
    startTransition(async () => {
      const result = await denyArticleDeletion(article._id);
      if (result.success) {
        toast.success('Removal request denied — article restored.');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function confirmRetraction() {
    if (!retractionTarget || !retractionData.issuedAt || !retractionData.detail.trim()) return;
    const id = retractionTarget._id;
    const data = { ...retractionData };
    setRetractionTarget(null);
    setRetractionData({ issuedAt: new Date().toISOString().slice(0, 16), summary: '', detail: '' });
    startTransition(async () => {
      const result = await retractArticle(id, data);
      if (result.success) {
        toast.success('Retraction notice issued.');
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
        <p className='mb-2 text-lg font-bold text-slate-700 dark:text-slate-300'>No articles yet</p>
        <p className='mb-6 text-sm text-slate-500'>Ready to write your first story?</p>
        <Link
          href='/portal/articles/new'
          className='bg-untele px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:opacity-90'
        >
          Write your first article
        </Link>
      </div>
    );
  }

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'drafts', label: 'Drafts' },
    { key: 'review', label: 'In Review' },
    { key: 'published', label: 'Published' },
  ];

  return (
    <div>
      {/* ── Warning: editor has no linked author profile ─────────────────── */}
      {isEditorPlus && (authorFilter === 'mine' || authorFilter === 'reviewed') && !currentSanityAuthorId && (
        <div className='mb-4 border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-700/50 dark:bg-yellow-900/20 dark:text-yellow-300'>
          <strong>Author profile not linked.</strong> Your Clerk account isn&apos;t connected to a
          Sanity author document, so this filter can&apos;t resolve your identity. Ask an admin to
          link your account via the Author management panel.
        </div>
      )}

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className='mb-6 flex border-b border-slate-200 dark:border-slate-800'>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type='button'
            onClick={() => setActiveTab(tab.key)}
            className={[
              'flex items-center gap-1.5 border-b-2 px-5 py-2.5 text-sm font-semibold -mb-px transition-colors',
              activeTab === tab.key
                ? 'border-untele text-untele'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
            ].join(' ')}
          >
            {tab.label}
            <span
              className={[
                'rounded-full px-1.5 py-0.5 text-xs font-bold',
                activeTab === tab.key
                  ? 'bg-untele/10 text-untele'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
              ].join(' ')}
            >
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center'>
        <Input
          placeholder='Search by title, tag, or category…'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='sm:max-w-xs'
          aria-label='Search articles'
        />

        {isEditorPlus && (
          <div className='flex items-center gap-1 rounded border border-slate-200 p-0.5 dark:border-slate-700'>
            {(
            [
              { key: 'all', label: 'All' },
              { key: 'mine', label: 'Mine' },
              { key: 'reviewed', label: 'Reviewed' },
              { key: 'others', label: 'Others' },
            ] as { key: AuthorFilter; label: string }[]
          ).map(({ key, label }) => (
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
                {label}
              </button>
            ))}
          </div>
        )}

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
          No articles{search ? ' matching your search' : ''} in this tab.
        </p>
      )}

      {/* ── Table view ───────────────────────────────────────────────────── */}
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
                  onDelete={() => setDeleteTarget(article)}
                  onRequestRemoval={() => setRemovalTarget(article)}
                  onApproveRemoval={() => setDeleteTarget(article)}
                  onDenyRemoval={() => handleDenyDeletion(article)}
                  onRetract={() => setRetractionTarget(article)}
                  isPending={isPending}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Card view ────────────────────────────────────────────────────── */}
      {view === 'card' && filtered.length > 0 && (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {filtered.map((article) => (
            <ArticleCard
              key={article._id}
              article={article}
              isEditorPlus={isEditorPlus}
              currentSanityAuthorId={currentSanityAuthorId}
              onDelete={() => setDeleteTarget(article)}
              onRequestRemoval={() => setRemovalTarget(article)}
              onApproveRemoval={() => setDeleteTarget(article)}
              onDenyRemoval={() => handleDenyDeletion(article)}
              onRetract={() => setRetractionTarget(article)}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      {/* ── Delete / approve-removal confirmation ────────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteTarget?.deletionRequest ? 'Approve removal request?' : 'Delete article?'}
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                {deleteTarget?.deletionRequest ? (
                  <>
                    <p>
                      <strong>{deleteTarget.deletionRequest.requestedByName}</strong> requested
                      removal of this article.
                    </p>
                    <blockquote className='mt-2 border-l-2 border-orange-400 pl-3 text-sm italic text-slate-600 dark:text-slate-400'>
                      &ldquo;{deleteTarget.deletionRequest.reason}&rdquo;
                    </blockquote>
                    <p className='mt-3 text-sm font-semibold text-red-600'>
                      This will permanently delete the article and cannot be undone.
                    </p>
                    <p className='mt-1 text-sm text-slate-500'>
                      Consider using <strong>Retract</strong> instead if the article should remain
                      visible with a notice.
                    </p>
                  </>
                ) : (
                  <p>
                    &ldquo;{deleteTarget?.title}&rdquo; will be permanently deleted. This cannot be
                    undone.
                  </p>
                )}
              </div>
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
              {isPending ? 'Deleting…' : 'Delete permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Author removal request modal ─────────────────────────────────── */}
      <Dialog
        open={!!removalTarget}
        onOpenChange={(o) => {
          if (!o) {
            setRemovalTarget(null);
            setRemovalReason('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request article removal</DialogTitle>
            <DialogDescription>
              This article will be unpublished and an editor will review your request. You must
              provide a reason. If retraction is appropriate, your editor will handle that process.
            </DialogDescription>
          </DialogHeader>
          <div className='py-2'>
            <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>
              Reason <span className='text-untele'>*</span>
            </Label>
            <Textarea
              placeholder='Explain why this article should be removed…'
              value={removalReason}
              onChange={(e) => setRemovalReason(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className='mt-1 text-xs text-slate-400'>
              Minimum 10 characters ({removalReason.length}/1000)
            </p>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setRemovalTarget(null);
                setRemovalReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              className='bg-untele text-white hover:opacity-90'
              onClick={confirmRemovalRequest}
              disabled={isPending || removalReason.trim().length < 10}
            >
              {isPending ? 'Submitting…' : 'Submit removal request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Retraction modal (editor only) ───────────────────────────────── */}
      <Dialog
        open={!!retractionTarget}
        onOpenChange={(o) => {
          if (!o) {
            setRetractionTarget(null);
            setRetractionData({
              issuedAt: new Date().toISOString().slice(0, 16),
              summary: '',
              detail: '',
            });
          }
        }}
      >
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Issue retraction notice</DialogTitle>
            <DialogDescription>
              The article stays published but is prominently marked as retracted. This follows
              standard journalistic retraction practice.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div>
              <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>
                Date issued <span className='text-untele'>*</span>
              </Label>
              <Input
                type='datetime-local'
                value={retractionData.issuedAt}
                onChange={(e) =>
                  setRetractionData((d) => ({ ...d, issuedAt: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>
                One-line summary
                <span className='ml-1 font-normal normal-case text-slate-400'>
                  optional · max 120 chars
                </span>
              </Label>
              <Input
                value={retractionData.summary}
                onChange={(e) =>
                  setRetractionData((d) => ({ ...d, summary: e.target.value }))
                }
                maxLength={120}
                placeholder='e.g. "Retracted due to inaccurate sourcing"'
              />
            </div>
            <div>
              <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>
                Full retraction statement <span className='text-untele'>*</span>
              </Label>
              <Textarea
                rows={4}
                value={retractionData.detail}
                onChange={(e) =>
                  setRetractionData((d) => ({ ...d, detail: e.target.value }))
                }
                placeholder='Explain what was inaccurate or misleading and why the article is being retracted…'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setRetractionTarget(null);
                setRetractionData({
                  issuedAt: new Date().toISOString().slice(0, 16),
                  summary: '',
                  detail: '',
                });
              }}
            >
              Cancel
            </Button>
            <Button
              className='bg-untele text-white hover:opacity-90'
              onClick={confirmRetraction}
              disabled={isPending || !retractionData.issuedAt || !retractionData.detail.trim()}
            >
              {isPending ? 'Issuing…' : 'Issue retraction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared action handler props
// ---------------------------------------------------------------------------

interface ActionHandlers {
  onDelete: () => void;
  onRequestRemoval: () => void;
  onApproveRemoval: () => void;
  onDenyRemoval: () => void;
  onRetract: () => void;
  isPending: boolean;
}

// ---------------------------------------------------------------------------
// Table row
// ---------------------------------------------------------------------------

function ArticleTableRow({
  article,
  isEditorPlus,
  currentSanityAuthorId,
  ...handlers
}: { article: PortalArticle; isEditorPlus: boolean; currentSanityAuthorId?: string } & ActionHandlers) {
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
        {article.deletionRequest && (
          <span className='ml-2 text-xs text-orange-500'>removal requested</span>
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
          isEditorPlus={isEditorPlus}
          currentSanityAuthorId={currentSanityAuthorId}
          {...handlers}
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
  ...handlers
}: { article: PortalArticle; isEditorPlus: boolean; currentSanityAuthorId?: string } & ActionHandlers) {
  const imageUrl = article.mainImage?.asset?.url;

  return (
    <div className='flex flex-col border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'>
      {/* Thumbnail */}
      {imageUrl ? (
        <div className='relative h-32 w-full overflow-hidden bg-slate-100 dark:bg-slate-800'>
          <img
            src={`${imageUrl}?w=480&h=128&fit=crop&auto=format`}
            alt={article.mainImage?.alt ?? ''}
            className='h-full w-full object-cover'
          />
        </div>
      ) : (
        <div className='h-10 w-full bg-slate-100 dark:bg-slate-800' />
      )}

      <div className='flex flex-1 flex-col p-4'>
        <div className='mb-2 flex items-start justify-between gap-2'>
          <StatusBadge article={article} />
          <ArticleActions
            article={article}
            isEditorPlus={isEditorPlus}
            currentSanityAuthorId={currentSanityAuthorId}
            {...handlers}
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

        {article.deletionRequest && (
          <p className='mb-2 text-xs italic text-orange-600 dark:text-orange-400'>
            &ldquo;
            {article.deletionRequest.reason.length > 90
              ? article.deletionRequest.reason.slice(0, 90) + '…'
              : article.deletionRequest.reason}
            &rdquo;
          </p>
        )}

        <p className='mt-auto pt-2 text-xs text-slate-400'>
          Updated {new Date(article._updatedAt).toLocaleDateString()}
        </p>

        {article.categories && article.categories.length > 0 && (
          <div className='mt-2 flex flex-wrap gap-1'>
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Action menu
// ---------------------------------------------------------------------------

function ArticleActions({
  article,
  isEditorPlus,
  currentSanityAuthorId,
  onDelete,
  onRequestRemoval,
  onApproveRemoval,
  onDenyRemoval,
  onRetract,
  isPending,
}: { article: PortalArticle; isEditorPlus: boolean; currentSanityAuthorId?: string } & ActionHandlers) {
  const isOwn = article.authorId === currentSanityAuthorId;
  const canRequestRemoval = !isEditorPlus && isOwn && !article.deletionRequest;

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
          <a href={`/articles/${article.slug?.current}`} target='_blank' rel='noopener noreferrer'>
            Preview ↗
          </a>
        </DropdownMenuItem>

        {/* Author: request removal */}
        {canRequestRemoval && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-orange-600 focus:text-orange-600'
              onClick={onRequestRemoval}
            >
              Request removal
            </DropdownMenuItem>
          </>
        )}

        {/* Editor actions */}
        {isEditorPlus && (
          <>
            <DropdownMenuSeparator />
            {article.deletionRequest ? (
              <>
                <DropdownMenuItem
                  className='font-medium text-green-700 focus:text-green-700'
                  onClick={onApproveRemoval}
                >
                  Approve removal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDenyRemoval}>Deny removal</DropdownMenuItem>
              </>
            ) : (
              <>
                {isPublished(article) && article.correctionType !== 'retraction' && (
                  <DropdownMenuItem onClick={onRetract}>Retract article</DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className='text-red-600 focus:text-red-600'
                  onClick={onDelete}
                >
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
