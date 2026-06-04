// src/app/(portal)/portal/pitch/[id]/page.tsx
// Claimed pitch detail page — notes editor + editable pitch details.
import { notFound } from 'next/navigation';
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { getSanityAuthorIdForCurrentUser } from '@/lib/portal/author-actions';
import { portalFetch } from '@/lib/portal/live';
import { queryPortalClaimedPitchById, queryPortalArticlesTitles } from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import { PitchNotesEditor } from '@/components/portal/PitchNotesEditor';
import { PitchDetailsEditor } from '@/components/portal/PitchDetailsEditor';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Pitch Notes — Author Portal',
  robots: { index: false, follow: false },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClaimedPitch {
  _id: string;
  headline?: string;
  angle?: string;
  beat?: string;
  urgency?: 'breaking' | 'high' | 'medium' | 'low';
  sourceSuggestions?: string;
  links?: Array<{ _key: string; label?: string; url?: string }>;
  briefId?: string;
  briefTitle?: string;
  storyKey?: string;
  claimedAt?: string;
  status?: string;
  notes?: Array<{ children?: Array<{ text?: string }> }>;
  author?: { _id: string; name: string };
  assignedBy?: { _id: string; name: string };
  linkedArticle?: { _id: string; title: string; slug?: string };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

const STATUS_COLORS: Record<string, string> = {
  claimed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  abandoned: 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PitchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { id: clerkUserId, role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');
  const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);

  const [pitch, allArticles] = await Promise.all([
    portalFetch<ClaimedPitch | null>(queryPortalClaimedPitchById, { id }),
    portalFetch<Array<{ _id: string; title: string; authorId: string }>>(
      queryPortalArticlesTitles
    ),
  ]);

  if (!pitch) notFound();

  const isOwner = pitch.author?._id === sanityAuthorId;
  if (!isEditorPlus && !isOwner) notFound();

  // Editors see all articles; authors see only their own
  const articleOptions = isEditorPlus
    ? allArticles
    : allArticles.filter((a) => a.authorId === sanityAuthorId);

  const notesText = blocksToText(pitch.notes);
  const statusColor = STATUS_COLORS[pitch.status ?? ''] ?? '';

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />

      <main className='mx-auto max-w-5xl px-4 py-5 sm:px-6'>
        {/* Breadcrumb */}
        <nav className='mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
          <Link href='/portal' className='hover:text-untele'>
            Dashboard
          </Link>
          <span className='mx-1.5'>›</span>
          <span className='text-slate-600 dark:text-slate-300'>Pitch</span>
        </nav>

        <div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
          {/* ── Left: notes editor ───────────────────────────────── */}
          <div>
            {/* Headline + badges */}
            <div className='mb-5 border-b border-slate-200 pb-5 dark:border-slate-700'>
              <h1 className='mb-2 text-lg font-black leading-snug text-slate-900 dark:text-white'>
                {pitch.headline ?? 'Untitled Pitch'}
              </h1>
              <div className='flex flex-wrap items-center gap-2'>
                {pitch.urgency && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${URGENCY_COLORS[pitch.urgency]}`}
                  >
                    {pitch.urgency}
                  </span>
                )}
                {pitch.beat && (
                  <span className='bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
                    {pitch.beat}
                  </span>
                )}
                {pitch.status && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusColor}`}
                  >
                    {pitch.status.replace('_', ' ')}
                  </span>
                )}
                {pitch.claimedAt && (
                  <span className='ml-auto text-[10px] text-slate-400'>
                    Claimed {new Date(pitch.claimedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Working Notes */}
            <div>
              <div className='mb-3 flex items-center gap-3'>
                <div className='bg-untele px-2 py-0.5'>
                  <span className='text-[10px] font-black uppercase tracking-widest text-white'>
                    Working Notes
                  </span>
                </div>
                <div className='h-px flex-1 bg-slate-200 dark:bg-slate-800' />
              </div>
              <PitchNotesEditor pitchId={pitch._id} initialText={notesText} />
            </div>
          </div>

          {/* ── Right: sidebar ────────────────────────────────────── */}
          <aside className='space-y-4'>
            {/* Quick actions */}
            <div className='border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900'>
              <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500'>
                Quick Actions
              </p>
              <div className='flex flex-col gap-2'>
                <Link
                  href={`/portal/articles/new?pitchId=${pitch._id}`}
                  className='bg-untele px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90'
                >
                  Start Article
                </Link>
                {pitch.linkedArticle && (
                  <Link
                    href={`/portal/articles/${pitch.linkedArticle._id}/edit`}
                    className='flex items-center justify-center gap-1 border border-slate-300 px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:border-untele hover:text-untele dark:border-slate-600 dark:text-slate-400'
                  >
                    <ExternalLink className='h-3 w-3' /> Edit Article
                  </Link>
                )}
                <Link
                  href='/portal'
                  className='border border-slate-300 px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:border-untele hover:text-untele dark:border-slate-600 dark:text-slate-400'
                >
                  ← Dashboard
                </Link>
              </div>
            </div>

            {/* Editable pitch details */}
            <div className='border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900'>
              <PitchDetailsEditor
                pitchId={pitch._id}
                initialHeadline={pitch.headline ?? ''}
                initialAngle={pitch.angle ?? ''}
                initialSourceSuggestions={pitch.sourceSuggestions ?? ''}
                initialLinks={pitch.links ?? []}
                initialLinkedArticleId={pitch.linkedArticle?._id ?? ''}
                initialLinkedArticleTitle={pitch.linkedArticle?.title ?? ''}
                articles={articleOptions}
              />
            </div>

            {/* Provenance — read-only */}
            <div className='border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900'>
              <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500'>
                Provenance
              </p>
              {pitch.briefTitle && (
                <div className='mb-2'>
                  <p className='mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                    Brief
                  </p>
                  <p className='text-xs text-slate-700 dark:text-slate-300'>{pitch.briefTitle}</p>
                </div>
              )}
              {pitch.author && (
                <div className='mb-2'>
                  <p className='mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                    Author
                  </p>
                  <p className='text-xs text-slate-700 dark:text-slate-300'>{pitch.author.name}</p>
                </div>
              )}
              {pitch.assignedBy && (
                <div>
                  <p className='mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                    Assigned By
                  </p>
                  <p className='text-xs text-slate-700 dark:text-slate-300'>
                    {pitch.assignedBy.name}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
