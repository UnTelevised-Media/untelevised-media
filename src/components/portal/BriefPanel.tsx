'use client';
// src/components/portal/BriefPanel.tsx
// Renders the latest AI-generated news brief on the portal dashboard.
// Authors can claim, pass, 2nd-thought, mark-in-progress, open pitch.
// Editors can assign to specific authors.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ExternalLink, ChevronDown, ChevronUp, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import {
  claimStory,
  unclaimStory,
  passOnStory,
  unpassStory,
  markStoryInProgress,
  assignStory,
  fetchBriefById,
} from '@/lib/portal/brief-actions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BriefStory {
  _key: string;
  headline?: string;
  angle?: string;
  beat?: string;
  urgency?: 'breaking' | 'high' | 'medium' | 'low';
  sourceSuggestions?: string;
  links?: Array<{ _key: string; label?: string; url?: string }>;
  status?: 'unclaimed' | 'claimed' | 'in_progress' | 'published' | 'passed';
  claimedBy?: { _id: string; name: string; slug?: string };
  claimedAt?: string;
  linkedArticle?: { _id: string; title: string; slug?: string };
}

export interface BriefStoryPass {
  _key: string;
  storyKey: string;
  authorId: string;
  passedAt: string;
}

export interface PortalAuthor {
  _id: string;
  name: string;
}

export interface Brief {
  _id: string;
  title?: string;
  publishedAt?: string;
  period?: 'morning' | 'afternoon' | 'evening' | 'night';
  summary?: string;
  storyPasses?: BriefStoryPass[];
  stories?: BriefStory[];
}

export interface BriefSummary {
  _id: string;
  title?: string;
  publishedAt?: string;
  period?: string;
}

interface Props {
  brief: Brief;
  briefList?: BriefSummary[];
  currentSanityAuthorId?: string;
  /** storyKey → pitchId for the current user's claimed pitches in this brief */
  myPitchMap?: Record<string, string>;
  authors?: PortalAuthor[];
  isEditorPlus?: boolean;
}

// ---------------------------------------------------------------------------
// Lookup tables
// ---------------------------------------------------------------------------

const PERIOD_META: Record<string, { icon: string; label: string; color: string }> = {
  morning: {
    icon: '🌅',
    label: 'Morning Brief',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  },
  afternoon: {
    icon: '☀️',
    label: 'Afternoon Brief',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  evening: {
    icon: '🌆',
    label: 'Evening Brief',
    color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  },
  night: {
    icon: '🌙',
    label: 'Night Brief',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  },
};

const URGENCY_META: Record<string, { label: string; color: string }> = {
  breaking: { label: 'Breaking', color: 'bg-red-600 text-white' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  low: { label: 'Low', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  unclaimed: { label: 'Unclaimed', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  claimed: { label: 'Claimed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  published: { label: 'Published', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  passed: { label: 'Passed', color: 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600' },
};

// ---------------------------------------------------------------------------
// Story card
// ---------------------------------------------------------------------------

function StoryCard({
  story,
  briefId,
  currentSanityAuthorId,
  myPitchId,
  isPassed,
  isEditorPlus,
  authors,
  onPass,
  onUnpass,
}: {
  story: BriefStory;
  briefId: string;
  currentSanityAuthorId?: string;
  myPitchId?: string;
  isPassed: boolean;
  isEditorPlus: boolean;
  authors: PortalAuthor[];
  onPass?: (storyKey: string) => void;
  onUnpass?: (storyKey: string) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showSources, setShowSources] = useState(false);
  const [assignTargetId, setAssignTargetId] = useState('');

  const status = story.status ?? 'unclaimed';
  const isMyStory = !!currentSanityAuthorId && story.claimedBy?._id === currentSanityAuthorId;
  const isPublished = status === 'published';
  const urgency = story.urgency ?? 'medium';
  const urgencyMeta = URGENCY_META[urgency] ?? URGENCY_META.medium;
  const statusMeta = STATUS_META[status] ?? STATUS_META.unclaimed;

  function act(action: () => Promise<{ success: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        router.refresh();
      } else {
        toast.error((result as { success: false; error: string }).error);
      }
    });
  }

  function handlePass() {
    onPass?.(story._key); // optimistic — move card immediately
    startTransition(async () => {
      const result = await passOnStory(briefId, story._key);
      if (result.success) {
        router.refresh();
      } else {
        onUnpass?.(story._key); // revert on failure
        toast.error((result as { success: false; error: string }).error);
      }
    });
  }

  function handleUnpass() {
    onUnpass?.(story._key); // optimistic — restore card immediately
    startTransition(async () => {
      const result = await unpassStory(briefId, story._key);
      if (result.success) {
        router.refresh();
      } else {
        onPass?.(story._key); // revert on failure
        toast.error((result as { success: false; error: string }).error);
      }
    });
  }

  return (
    <div
      className={`border bg-white p-4 transition-all dark:bg-slate-900 ${
        isPassed ? 'opacity-40' : ''
      } ${
        urgency === 'breaking'
          ? 'border-red-400 dark:border-red-700'
          : isMyStory && !isPassed
            ? 'border-blue-300 dark:border-blue-700'
            : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      {/* Badges row */}
      <div className='mb-2 flex flex-wrap items-center gap-1.5'>
        <span className={`px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${urgencyMeta.color}`}>
          {urgencyMeta.label}
        </span>
        {story.beat && (
          <span className='bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
            {story.beat}
          </span>
        )}
        <span className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusMeta.color}`}>
          {statusMeta.label}
        </span>
      </div>

      {/* Headline */}
      <h3
        className={`mb-1.5 text-sm font-black leading-snug ${
          isPassed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'
        }`}
      >
        {story.headline ?? 'Untitled pitch'}
      </h3>

      {/* Angle — hidden when passed */}
      {story.angle && !isPassed && (
        <p className='mb-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
          {story.angle}
        </p>
      )}

      {/* Claimed by */}
      {story.claimedBy && status !== 'unclaimed' && (
        <p className='mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500'>
          {isMyStory ? 'Claimed by you' : `Claimed by ${story.claimedBy.name}`}
          {story.claimedAt && (
            <span className='ml-1 font-normal normal-case tracking-normal'>
              · {new Date(story.claimedAt).toLocaleDateString()}
            </span>
          )}
        </p>
      )}

      {/* Linked article */}
      {story.linkedArticle && (
        <Link
          href={`/portal/articles/${story.linkedArticle._id}/edit`}
          className='mb-2 flex items-center gap-1 text-[10px] font-bold text-untele hover:underline'
        >
          <ExternalLink className='h-3 w-3' /> {story.linkedArticle.title}
        </Link>
      )}

      {/* Sources toggle — hidden when passed */}
      {story.sourceSuggestions && !isPassed && (
        <div className='mb-2'>
          <button
            onClick={() => setShowSources((v) => !v)}
            className='flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-untele'
          >
            {showSources ? <ChevronUp className='h-3 w-3' /> : <ChevronDown className='h-3 w-3' />}
            Suggested Sources
          </button>
          {showSources && (
            <p className='mt-1 whitespace-pre-wrap text-[11px] leading-relaxed text-slate-600 dark:text-slate-400'>
              {story.sourceSuggestions}
            </p>
          )}
        </div>
      )}

      {/* Reference links — hidden when passed */}
      {story.links && story.links.length > 0 && !isPassed && (
        <div className='mb-3 flex flex-wrap gap-2'>
          {story.links.map((link) =>
            link.url ? (
              <a
                key={link._key}
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1 text-[11px] text-untele hover:underline'
              >
                <ExternalLink className='h-3 w-3' />
                {link.label || 'Source'}
              </a>
            ) : null
          )}
        </div>
      )}

      {/* Actions */}
      {!isPublished && (
        <div className='mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800'>
          {/* PASSED: 2nd Thought */}
          {isPassed && (
            <button
              disabled={isPending}
              onClick={handleUnpass}
              className='border border-slate-300 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-untele hover:text-untele disabled:opacity-50 dark:border-slate-700'
            >
              {isPending ? 'Restoring…' : '2nd Thought'}
            </button>
          )}

          {/* UNCLAIMED: Claim + Pass + Assign */}
          {!isPassed && status === 'unclaimed' && (
            <>
              <button
                disabled={isPending}
                onClick={() => act(() => claimStory(briefId, story._key))}
                className='bg-untele px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
              >
                {isPending ? 'Claiming…' : 'Claim Story'}
              </button>
              <button
                disabled={isPending}
                onClick={handlePass}
                className='border border-slate-300 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-slate-500 disabled:opacity-50 dark:border-slate-700'
              >
                Pass
              </button>
              {isEditorPlus && authors.length > 0 && (
                <div className='flex gap-1'>
                  <select
                    value={assignTargetId}
                    onChange={(e) => setAssignTargetId(e.target.value)}
                    className='border border-slate-300 bg-white px-2 py-1 text-[10px] text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  >
                    <option value=''>Assign to…</option>
                    {authors.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  {assignTargetId && (
                    <button
                      disabled={isPending}
                      onClick={() => act(() => assignStory(briefId, story._key, assignTargetId))}
                      className='bg-slate-700 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50 dark:bg-slate-600'
                    >
                      {isPending ? '…' : 'Assign'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* MY STORY (claimed / in_progress): rich action card */}
          {!isPassed && isMyStory && (status === 'claimed' || status === 'in_progress') && (
            <>
              {myPitchId && (
                <Link
                  href={`/portal/pitch/${myPitchId}`}
                  className='border border-slate-300 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:border-untele hover:text-untele dark:border-slate-600 dark:text-slate-400'
                >
                  Open Pitch
                </Link>
              )}
              <Link
                href={myPitchId ? `/portal/articles/new?pitchId=${myPitchId}` : '/portal/articles/new'}
                className='bg-untele px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90'
              >
                Start Article
              </Link>
              {status === 'claimed' && (
                <button
                  disabled={isPending}
                  onClick={() => act(() => markStoryInProgress(briefId, story._key))}
                  className='bg-purple-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
                >
                  Mark In Progress
                </button>
              )}
              <button
                disabled={isPending}
                onClick={() => act(() => unclaimStory(briefId, story._key))}
                className='border border-slate-300 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:border-untele hover:text-untele disabled:opacity-50 dark:border-slate-600 dark:text-slate-400'
              >
                Release
              </button>
            </>
          )}

          {/* CLAIMED BY OTHERS: editor can release to reassign */}
          {!isPassed && !isMyStory && (status === 'claimed' || status === 'in_progress') && isEditorPlus && (
            <button
              disabled={isPending}
              onClick={() => act(() => unclaimStory(briefId, story._key))}
              className='border border-slate-300 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-untele hover:text-untele disabled:opacity-50 dark:border-slate-700'
            >
              {isPending ? 'Releasing…' : 'Release / Reassign'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function BriefPanel({
  brief,
  briefList = [],
  currentSanityAuthorId,
  myPitchMap: initialPitchMap = {},
  authors = [],
  isEditorPlus = false,
}: Props) {
  const [showHidden, setShowHidden] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedBrief, setLoadedBrief] = useState<Brief>(brief);
  const [loadedPitchMap, setLoadedPitchMap] = useState<Record<string, string>>(initialPitchMap);
  const [isNavigating, setIsNavigating] = useState(false);

  async function navigateTo(index: number) {
    const target = briefList[index];
    if (!target) return;
    setIsNavigating(true);
    try {
      const result = await fetchBriefById(target._id);
      if (result.brief) {
        setLoadedBrief(result.brief as Brief);
        setLoadedPitchMap(result.myPitchMap);
        setCurrentIndex(index);
        setShowHidden(false);
      }
    } finally {
      setIsNavigating(false);
    }
  }

  function handleOptimisticPass(storyKey: string) {
    if (!currentSanityAuthorId) return;
    setLoadedBrief((prev) => ({
      ...prev,
      storyPasses: [
        ...(prev.storyPasses ?? []),
        { _key: `opt_${storyKey}_${Date.now()}`, authorId: currentSanityAuthorId, storyKey, passedAt: new Date().toISOString() },
      ],
    }));
  }

  function handleOptimisticUnpass(storyKey: string) {
    setLoadedBrief((prev) => ({
      ...prev,
      storyPasses: (prev.storyPasses ?? []).filter(
        (p) => !(p.storyKey === storyKey && p.authorId === currentSanityAuthorId),
      ),
    }));
  }

  const activeBrief = loadedBrief;
  const periodMeta = PERIOD_META[activeBrief.period ?? ''] ?? {
    icon: '📰',
    label: 'Brief',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };

  const stories = activeBrief.stories ?? [];

  // Compute which story keys this author has passed on
  const myPassedKeys = new Set(
    (activeBrief.storyPasses ?? [])
      .filter((p) => p.authorId === currentSanityAuthorId)
      .map((p) => p.storyKey),
  );

  // Order: breaking unclaimed → unclaimed → claimed/in_progress → published
  // Passed stories go to their own hidden section.
  const STATUS_ORDER: Record<string, number> = { unclaimed: 0, claimed: 1, in_progress: 1, published: 2 };
  const URGENCY_ORDER: Record<string, number> = { breaking: 0, high: 1, medium: 2, low: 3 };

  const visibleStories = stories
    .filter((s) => !myPassedKeys.has(s._key))
    .sort((a, b) => {
      const statusDiff =
        (STATUS_ORDER[a.status ?? 'unclaimed'] ?? 0) -
        (STATUS_ORDER[b.status ?? 'unclaimed'] ?? 0);
      if (statusDiff !== 0) return statusDiff;
      // Within the same status bucket, breaking stories come first
      return (URGENCY_ORDER[a.urgency ?? 'medium'] ?? 2) - (URGENCY_ORDER[b.urgency ?? 'medium'] ?? 2);
    });
  const hiddenStories = stories.filter((s) => myPassedKeys.has(s._key));

  const totalCount = stories.length;
  const unclaimedCount = visibleStories.filter(
    (s) => (s.status ?? 'unclaimed') === 'unclaimed',
  ).length;
  const passedCount = myPassedKeys.size;

  const canGoPrev = currentIndex < briefList.length - 1; // older
  const canGoNext = currentIndex > 0;                     // newer

  return (
    <div className={`border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${isNavigating ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Brief header */}
      <div className='flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700'>
        <div className='min-w-0 flex-1'>
          <div className='mb-1 flex flex-wrap items-center gap-2'>
            <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${periodMeta.color}`}>
              {periodMeta.icon} {periodMeta.label}
            </span>
            {activeBrief.publishedAt && (
              <span className='text-[10px] text-slate-400'>
                {new Date(activeBrief.publishedAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
          <h2 className='text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white'>
            {activeBrief.title}
          </h2>
        </div>

        {/* Right side: stats + nav */}
        <div className='flex items-center gap-4'>
          <div className='flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500'>
            <span>{totalCount} pitches</span>
            {unclaimedCount > 0 && (
              <span className='text-untele'>{unclaimedCount} unclaimed</span>
            )}
            {passedCount > 0 && (
              <span>{passedCount} passed (mine)</span>
            )}
          </div>

          {/* Brief navigation arrows */}
          {briefList.length > 1 && (
            <div className='flex items-center gap-1'>
              <button
                disabled={!canGoPrev || isNavigating}
                onClick={() => navigateTo(currentIndex + 1)}
                title='Older brief'
                className='flex h-6 w-6 items-center justify-center border border-slate-300 text-slate-500 hover:border-untele hover:text-untele disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-600'
              >
                <ChevronLeft className='h-3.5 w-3.5' />
              </button>
              <span className='min-w-[3rem] text-center text-[10px] font-bold text-slate-400'>
                {currentIndex + 1} / {briefList.length}
              </span>
              <button
                disabled={!canGoNext || isNavigating}
                onClick={() => navigateTo(currentIndex - 1)}
                title='Newer brief'
                className='flex h-6 w-6 items-center justify-center border border-slate-300 text-slate-500 hover:border-untele hover:text-untele disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-600'
              >
                <ChevronRight className='h-3.5 w-3.5' />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {activeBrief.summary && (
        <div className='border-b border-slate-100 px-4 py-3 dark:border-slate-800'>
          <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
            {activeBrief.summary}
          </p>
        </div>
      )}

      {/* Stories */}
      {stories.length === 0 ? (
        <div className='px-4 py-8 text-center'>
          <p className='text-xs font-bold uppercase tracking-widest text-slate-400'>
            No pitches in this brief
          </p>
        </div>
      ) : (
        <div className='p-4'>
          {/* Visible stories */}
          {visibleStories.length === 0 && hiddenStories.length === 0 ? null : (
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {visibleStories.map((story) => (
                <StoryCard
                  key={story._key}
                  story={story}
                  briefId={activeBrief._id}
                  currentSanityAuthorId={currentSanityAuthorId}
                  myPitchId={loadedPitchMap[story._key]}
                  isPassed={false}
                  isEditorPlus={isEditorPlus}
                  authors={authors}
                  onPass={handleOptimisticPass}
                  onUnpass={handleOptimisticUnpass}
                />
              ))}
            </div>
          )}

          {/* Hidden stories (passed by this user) */}
          {hiddenStories.length > 0 && (
            <div className='mt-4'>
              <button
                onClick={() => setShowHidden((v) => !v)}
                className='mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              >
                <EyeOff className='h-3 w-3' />
                {showHidden
                  ? `Hide ${hiddenStories.length} passed`
                  : `Show ${hiddenStories.length} hidden`}
              </button>
              {showHidden && (
                <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                  {hiddenStories.map((story) => (
                    <StoryCard
                      key={story._key}
                      story={story}
                      briefId={activeBrief._id}
                      currentSanityAuthorId={currentSanityAuthorId}
                      myPitchId={loadedPitchMap[story._key]}
                      isPassed={true}
                      isEditorPlus={isEditorPlus}
                      authors={authors}
                      onPass={handleOptimisticPass}
                      onUnpass={handleOptimisticUnpass}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
