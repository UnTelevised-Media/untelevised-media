'use client';
// src/components/portal/SubscribersList.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export interface Subscriber {
  _id: string;
  email?: string;
  submittedAt?: string;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function SubscribersList({ subscribers }: { subscribers: Subscriber[] }) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? subscribers.filter((s) => s.email?.toLowerCase().includes(search.toLowerCase()))
    : subscribers;

  return (
    <div>
      <div className='mb-4 flex items-center gap-3'>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search by email…'
          className='max-w-xs'
        />
        {subscribers.length > 0 && (
          <span className='text-xs text-slate-500'>{filtered.length} of {subscribers.length}</span>
        )}
      </div>

      {subscribers.length === 0 ? (
        <div className='border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-black'>
          <p className='text-sm font-bold uppercase tracking-widest text-slate-400'>No subscribers yet</p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-sm'>
            <thead>
              <tr className='border-b-2 border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900'>
                <th className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'>Email</th>
                <th className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'>Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr
                  key={sub._id}
                  className='border-b border-slate-200 bg-white transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-black dark:hover:bg-slate-900'
                >
                  <td className='px-4 py-3'>
                    <a href={`mailto:${sub.email}`} className='text-untele hover:underline'>{sub.email ?? '—'}</a>
                  </td>
                  <td className='px-4 py-3 text-slate-600 dark:text-slate-400'>{formatDate(sub.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
