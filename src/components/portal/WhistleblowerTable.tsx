'use client';
// src/components/portal/WhistleblowerTable.tsx
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface WhistleblowerSubmission {
  _id: string;
  submissionId?: string;
  title?: string;
  description?: string;
  organization?: string;
  location?: string;
  timeframe?: string;
  category?: string;
  severity?: string;
  evidence?: string;
  witnessInfo?: string;
  contactInfo?: string;
  isAnonymous?: boolean;
  protectionNeeded?: boolean;
  submittedAt?: string;
  status?: string;
  priority?: string;
  notes?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const PRIORITY_COLORS: Record<string, string> = {
  breaking: 'bg-red-600 text-white',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  review: 'Under Review',
  investigating: 'Investigating',
  verification: 'Verification',
  story_progress: 'Story in Progress',
  published: 'Published',
  closed: 'Closed',
  archived: 'Archived',
};

const CATEGORY_LABELS: Record<string, string> = {
  government: 'Government',
  corporate: 'Corporate',
  environmental: 'Environmental',
  human_rights: 'Human Rights',
  financial: 'Financial',
  healthcare: 'Healthcare',
  military: 'Military',
  law_enforcement: 'Law Enforcement',
  other: 'Other',
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function WhistleblowerTable({ submissions }: { submissions: WhistleblowerSubmission[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = statusFilter === 'all' ? submissions : submissions.filter((s) => (s.status ?? 'new') === statusFilter);

  if (submissions.length === 0) {
    return (
      <div className='border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-black'>
        <p className='text-sm font-bold uppercase tracking-widest text-slate-400'>No submissions yet</p>
      </div>
    );
  }

  return (
    <div>
      {/* Status filter */}
      <div className='mb-6 flex flex-wrap gap-2'>
        {['all', ...Object.keys(STATUS_LABELS)].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-colors ${statusFilter === s ? 'bg-untele text-white' : 'border border-slate-300 bg-white text-slate-600 hover:border-untele hover:text-untele dark:border-slate-700 dark:bg-black dark:text-slate-400'}`}
          >
            {s === 'all' ? `All (${submissions.length})` : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full border-collapse text-sm'>
          <thead>
            <tr className='border-b-2 border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900'>
              {['Title', 'Category', 'Severity', 'Priority', 'Status', 'Submitted', ''].map((h) => (
                <th key={h} className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub) => {
              const isExpanded = expandedId === sub._id;
              return (
                <>
                  <tr
                    key={sub._id}
                    className={`border-b border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 ${isExpanded ? 'bg-slate-50 dark:bg-slate-900' : 'bg-white dark:bg-black'}`}
                  >
                    <td className='px-4 py-4'>
                      <p className='font-bold text-slate-900 dark:text-white'>{sub.title ?? '—'}</p>
                      {sub.organization && <p className='text-xs text-slate-500'>{sub.organization}</p>}
                      {sub.protectionNeeded && (
                        <span className='mt-1 inline-block bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-900 dark:text-red-200'>
                          Protection Needed
                        </span>
                      )}
                    </td>
                    <td className='px-4 py-4 text-slate-600 dark:text-slate-400'>
                      {CATEGORY_LABELS[sub.category ?? ''] ?? sub.category ?? '—'}
                    </td>
                    <td className='px-4 py-4'>
                      <span className={`inline-block px-2 py-0.5 text-xs font-black uppercase tracking-widest ${SEVERITY_COLORS[sub.severity ?? 'medium'] ?? ''}`}>
                        {sub.severity ?? '—'}
                      </span>
                    </td>
                    <td className='px-4 py-4'>
                      <span className={`inline-block px-2 py-0.5 text-xs font-black uppercase tracking-widest ${PRIORITY_COLORS[sub.priority ?? 'medium'] ?? ''}`}>
                        {sub.priority ?? '—'}
                      </span>
                    </td>
                    <td className='px-4 py-4 text-slate-600 dark:text-slate-400'>
                      {STATUS_LABELS[sub.status ?? 'new'] ?? sub.status ?? 'New'}
                    </td>
                    <td className='px-4 py-4 text-slate-600 dark:text-slate-400'>{formatDate(sub.submittedAt)}</td>
                    <td className='px-4 py-4'>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : sub._id)}
                        className='flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-untele'
                      >
                        {isExpanded ? <><ChevronUp className='h-4 w-4' /> Hide</> : <><ChevronDown className='h-4 w-4' /> View</>}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${sub._id}-exp`} className='border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'>
                      <td colSpan={7} className='px-6 py-6'>
                        <div className='grid gap-6 md:grid-cols-2'>
                          {sub.description && (
                            <div className='md:col-span-2'>
                              <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>Description</h4>
                              <p className='whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300'>{sub.description}</p>
                            </div>
                          )}
                          {sub.evidence && (
                            <div className='md:col-span-2'>
                              <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>Evidence</h4>
                              <p className='whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300'>{sub.evidence}</p>
                            </div>
                          )}
                          {sub.location && (
                            <div>
                              <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>Location</h4>
                              <p className='text-sm text-slate-700 dark:text-slate-300'>{sub.location}</p>
                            </div>
                          )}
                          {sub.timeframe && (
                            <div>
                              <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>Timeframe</h4>
                              <p className='text-sm text-slate-700 dark:text-slate-300'>{sub.timeframe}</p>
                            </div>
                          )}
                          {sub.witnessInfo && (
                            <div className='md:col-span-2'>
                              <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>Witness Information</h4>
                              <p className='whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300'>{sub.witnessInfo}</p>
                            </div>
                          )}
                          {!sub.isAnonymous && sub.contactInfo && (
                            <div className='md:col-span-2'>
                              <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>Contact Information</h4>
                              <p className='whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300'>{sub.contactInfo}</p>
                            </div>
                          )}
                          {sub.notes && (
                            <div className='md:col-span-2'>
                              <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>Editorial Notes</h4>
                              <p className='whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300'>{sub.notes}</p>
                            </div>
                          )}
                          {sub.submissionId && (
                            <div>
                              <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>Submission ID</h4>
                              <p className='font-mono text-xs text-slate-500'>{sub.submissionId}</p>
                            </div>
                          )}
                          <div className='md:col-span-2'>
                            <a
                              href={`/studio/structure/whistleblower;${sub._id}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='inline-flex items-center gap-2 bg-untele px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-red-700'
                            >
                              Manage in Studio ↗
                            </a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
