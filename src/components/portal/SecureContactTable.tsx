'use client';
// src/components/portal/SecureContactTable.tsx
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface SecureContact {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  urgency?: string;
  contactMethod?: string;
  isAnonymous?: boolean;
  submittedAt?: string;
  status?: string;
}

const URGENCY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  reviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  archived: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  reviewing: 'In Review',
  progress: 'In Progress',
  resolved: 'Resolved',
  archived: 'Archived',
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function SecureContactTable({ contacts }: { contacts: SecureContact[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered =
    statusFilter === 'all'
      ? contacts
      : contacts.filter((c) => (c.status ?? 'new') === statusFilter);

  if (contacts.length === 0) {
    return (
      <div className='border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-black'>
        <p className='text-sm font-bold uppercase tracking-widest text-slate-400'>
          No secure contacts yet
        </p>
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
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors ${statusFilter === s ? 'bg-untele text-white' : 'border border-slate-300 bg-white text-slate-600 hover:border-untele hover:text-untele dark:border-slate-700 dark:bg-black dark:text-slate-400'}`}
          >
            {s === 'all' ? `All (${contacts.length})` : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full border-collapse text-sm'>
          <thead>
            <tr className='border-b-2 border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900'>
              {['Subject', 'From', 'Urgency', 'Status', 'Submitted', ''].map((h) => (
                <th
                  key={h}
                  className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((contact) => {
              const isExpanded = expandedId === contact._id;
              const urgency = contact.urgency ?? 'medium';
              const status = contact.status ?? 'new';
              return (
                <>
                  <tr
                    key={contact._id}
                    className={`border-b border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 ${isExpanded ? 'bg-slate-50 dark:bg-slate-900' : 'bg-white dark:bg-black'}`}
                  >
                    <td className='px-4 py-4 font-bold text-slate-900 dark:text-white'>
                      {contact.subject ?? '—'}
                    </td>
                    <td className='px-4 py-4'>
                      <p className='text-slate-700 dark:text-slate-300'>
                        {contact.isAnonymous ? 'Anonymous' : (contact.name ?? '—')}
                      </p>
                      {contact.email && !contact.isAnonymous && (
                        <a
                          href={`mailto:${contact.email}`}
                          className='text-xs text-untele hover:underline'
                        >
                          {contact.email}
                        </a>
                      )}
                    </td>
                    <td className='px-4 py-4'>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-black uppercase tracking-widest ${URGENCY_COLORS[urgency] ?? ''}`}
                      >
                        {urgency}
                      </span>
                    </td>
                    <td className='px-4 py-4'>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-black uppercase tracking-widest ${STATUS_COLORS[status] ?? ''}`}
                      >
                        {STATUS_LABELS[status] ?? status}
                      </span>
                    </td>
                    <td className='px-4 py-4 text-slate-600 dark:text-slate-400'>
                      {formatDate(contact.submittedAt)}
                    </td>
                    <td className='px-4 py-4'>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : contact._id)}
                        className='flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-untele'
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className='h-4 w-4' /> Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown className='h-4 w-4' /> View
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr
                      key={`${contact._id}-exp`}
                      className='border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                    >
                      <td colSpan={6} className='px-6 py-6'>
                        <div className='grid gap-6 md:grid-cols-2'>
                          <div className='md:col-span-2'>
                            <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>
                              Message
                            </h4>
                            <p className='whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300'>
                              {contact.message ?? '—'}
                            </p>
                          </div>
                          <div>
                            <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>
                              Preferred Contact Method
                            </h4>
                            <p className='text-sm text-slate-700 dark:text-slate-300'>
                              {contact.contactMethod ?? '—'}
                            </p>
                          </div>
                          {contact.phone && (
                            <div>
                              <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>
                                Phone
                              </h4>
                              <p className='text-sm text-slate-700 dark:text-slate-300'>
                                {contact.phone}
                              </p>
                            </div>
                          )}
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
