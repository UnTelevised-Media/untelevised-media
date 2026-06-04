'use client';
// src/components/portal/SubscribersList.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export interface Subscriber {
  _id: string;
  email?: string;
  firstName?: string;
  status?: 'pending' | 'active' | 'unsubscribed';
  source?: string;
  submittedAt?: string;
  confirmedAt?: string;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className='text-slate-400'>—</span>;
  const map: Record<string, { emoji: string; label: string; className: string }> = {
    active: { emoji: '✅', label: 'Active', className: 'text-green-700 dark:text-green-400' },
    pending: { emoji: '⏳', label: 'Pending', className: 'text-amber-600 dark:text-amber-400' },
    unsubscribed: { emoji: '🚫', label: 'Unsubscribed', className: 'text-slate-500' },
  };
  const s = map[status] ?? { emoji: '?', label: status, className: 'text-slate-400' };
  return (
    <span className={`text-xs font-bold ${s.className}`}>
      {s.emoji} {s.label}
    </span>
  );
}

export function SubscribersList({ subscribers }: { subscribers: Subscriber[] }) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? subscribers.filter(
        (s) =>
          s.email?.toLowerCase().includes(search.toLowerCase()) ||
          s.firstName?.toLowerCase().includes(search.toLowerCase())
      )
    : subscribers;

  const activeCnt = subscribers.filter((s) => s.status === 'active').length;

  return (
    <div>
      <div className='mb-4 flex items-center gap-3'>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search by email or name…'
          className='max-w-xs'
        />
        {subscribers.length > 0 && (
          <span className='text-xs text-slate-500'>
            {filtered.length} of {subscribers.length} &mdash; {activeCnt} active
          </span>
        )}
      </div>

      {subscribers.length === 0 ? (
        <div className='border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-black'>
          <p className='text-sm font-bold uppercase tracking-widest text-slate-400'>
            No subscribers yet
          </p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-sm'>
            <thead>
              <tr className='border-b-2 border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900'>
                <th className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'>
                  Email
                </th>
                <th className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'>
                  Name
                </th>
                <th className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'>
                  Status
                </th>
                <th className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'>
                  Source
                </th>
                <th className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'>
                  Signed Up
                </th>
                <th className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'>
                  Confirmed
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr
                  key={sub._id}
                  className='border-b border-slate-200 bg-white transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-black dark:hover:bg-slate-900'
                >
                  <td className='px-4 py-3'>
                    <a href={`mailto:${sub.email}`} className='text-untele hover:underline'>
                      {sub.email ?? '—'}
                    </a>
                  </td>
                  <td className='px-4 py-3 text-slate-600 dark:text-slate-400'>
                    {sub.firstName ?? '—'}
                  </td>
                  <td className='px-4 py-3'>
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className='px-4 py-3 text-xs text-slate-500'>{sub.source ?? '—'}</td>
                  <td className='px-4 py-3 text-slate-600 dark:text-slate-400'>
                    {formatDate(sub.submittedAt)}
                  </td>
                  <td className='px-4 py-3 text-slate-600 dark:text-slate-400'>
                    {formatDate(sub.confirmedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
