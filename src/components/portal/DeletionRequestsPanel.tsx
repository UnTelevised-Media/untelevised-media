// src/components/portal/DeletionRequestsPanel.tsx
// Editor/admin monitoring panel — approve or deny pending author removal requests.
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { approveArticleDeletion, denyArticleDeletion } from '@/server/actions/portal/article';
import { toast } from 'sonner';
import type { PortalArticle } from './ArticleDashboard';

function originalId(a: PortalArticle): string {
  return a._originalId ?? a._id;
}

interface Props {
  requests: PortalArticle[];
}

export default function DeletionRequestsPanel({ requests }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [approveTarget, setApproveTarget] = useState<PortalArticle | null>(null);

  function confirmApprove() {
    if (!approveTarget) {return;}
    const id = originalId(approveTarget);
    setApproveTarget(null);
    startTransition(async () => {
      const result = await approveArticleDeletion(id);
      if (result.success) {
        toast.success('Removal approved — article deleted.');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDeny(article: PortalArticle) {
    startTransition(async () => {
      const result = await denyArticleDeletion(originalId(article));
      if (result.success) {
        toast.success('Removal request denied — article restored.');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (requests.length === 0) {
    return (
      <div className='border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900'>
        <p className='text-lg font-black uppercase tracking-widest text-slate-400'>
          No Pending Requests
        </p>
        <p className='mt-1 text-sm text-slate-500'>
          Removal requests submitted by authors will show up here for review.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className='space-y-4'>
        {requests.map((article) => (
          <div
            key={article._id}
            className='border border-orange-300 bg-orange-50 p-4 dark:border-orange-700/50 dark:bg-orange-900/20'
          >
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <div className='min-w-0'>
                <Link
                  href={`/portal/articles/${article._id}/edit`}
                  className='font-bold hover:text-untele hover:underline'
                >
                  {article.title || 'Untitled'}
                </Link>
                {article.author?.name && (
                  <p className='mt-0.5 text-xs text-slate-500'>by {article.author.name}</p>
                )}
              </div>
              <div className='flex shrink-0 gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={isPending}
                  onClick={() => handleDeny(article)}
                >
                  Deny
                </Button>
                <Button
                  size='sm'
                  className='bg-red-600 text-white hover:bg-red-700'
                  disabled={isPending}
                  onClick={() => setApproveTarget(article)}
                >
                  Approve &amp; Delete
                </Button>
              </div>
            </div>

            <div className='mt-3 grid gap-3 sm:grid-cols-3'>
              <div>
                <p className='text-xs font-bold uppercase tracking-widest text-slate-500'>
                  Requested at
                </p>
                <p className='text-sm'>
                  {article.deletionRequest?.requestedAt
                    ? new Date(article.deletionRequest.requestedAt).toLocaleString()
                    : '—'}
                </p>
              </div>
              <div>
                <p className='text-xs font-bold uppercase tracking-widest text-slate-500'>
                  Requested by
                </p>
                <p className='text-sm'>{article.deletionRequest?.requestedByName ?? '—'}</p>
              </div>
              <div>
                <p className='text-xs font-bold uppercase tracking-widest text-slate-500'>
                  Original published date
                </p>
                <p className='text-sm'>
                  {article.deletionRequest?.originalPublishedAt
                    ? new Date(article.deletionRequest.originalPublishedAt).toLocaleString()
                    : '—'}
                </p>
              </div>
            </div>

            <div className='mt-3'>
              <p className='text-xs font-bold uppercase tracking-widest text-slate-500'>
                Reason for removal
              </p>
              <blockquote className='mt-1 border-l-2 border-orange-400 pl-3 text-sm italic text-slate-700 dark:text-slate-300'>
                &ldquo;{article.deletionRequest?.reason}&rdquo;
              </blockquote>
            </div>
          </div>
        ))}
      </div>

      {/* ── Approve confirmation ──────────────────────────────────────────── */}
      <Dialog open={!!approveTarget} onOpenChange={(o) => !o && setApproveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve removal request?</DialogTitle>
            <DialogDescription asChild>
              <div>
                <p>
                  <strong>{approveTarget?.deletionRequest?.requestedByName}</strong> requested
                  removal of &ldquo;{approveTarget?.title}&rdquo;.
                </p>
                <p className='mt-3 text-sm font-semibold text-red-600'>
                  This will permanently delete the article and cannot be undone.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
            <Button
              className='bg-red-600 text-white hover:bg-red-700'
              onClick={confirmApprove}
              disabled={isPending}
            >
              {isPending ? 'Deleting…' : 'Delete permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
