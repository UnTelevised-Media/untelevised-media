'use client';
// src/components/portal/ContactTable.tsx
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface ContactSubmission {
  _id: string;
  name?: string;
  email?: string;
  message?: string;
  submittedAt?: string;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ContactTable({ submissions }: { submissions: ContactSubmission[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (submissions.length === 0) {
    return (
      <div className='border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-black'>
        <p className='text-sm font-bold uppercase tracking-widest text-slate-400'>No submissions yet</p>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full border-collapse text-sm'>
        <thead>
          <tr className='border-b-2 border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900'>
            {['Name', 'Email', 'Submitted', ''].map((h) => (
              <th key={h} className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => {
            const isExpanded = expandedId === sub._id;
            return (
              <>
                <tr
                  key={sub._id}
                  className={`border-b border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 ${isExpanded ? 'bg-slate-50 dark:bg-slate-900' : 'bg-white dark:bg-black'}`}
                >
                  <td className='px-4 py-4 font-bold text-slate-900 dark:text-white'>{sub.name ?? '—'}</td>
                  <td className='px-4 py-4'>
                    {sub.email ? (
                      <a href={`mailto:${sub.email}`} className='text-untele hover:underline'>{sub.email}</a>
                    ) : '—'}
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
                    <td colSpan={4} className='px-6 py-6'>
                      <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>Message</h4>
                      <p className='whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300'>{sub.message ?? '—'}</p>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
