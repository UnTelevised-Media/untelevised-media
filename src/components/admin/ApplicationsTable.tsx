'use client';
// src/components/admin/ApplicationsTable.tsx

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export interface JobApplication {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  positionsOfInterest?: string[];
  otherPosition?: string;
  experienceLevel?: string;
  experienceDescription?: string;
  availability?: string;
  applicationStatus?: string;
  submittedAt?: string;
  notes?: string;
  portfolioWebsite?: string;
  youtubeChannel?: string;
  socialMediaPlatforms?: string[];
  socialMediaLinks?: Array<{ platform: string; url: string }>;
  workSamples?: Array<{ title: string; url: string }>;
  additionalInfo?: string;
}

interface Props {
  applications: JobApplication[];
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  expLabels: Record<string, string>;
  availLabels: Record<string, string>;
}

export function ApplicationsTable({
  applications,
  statusColors,
  statusLabels,
  expLabels,
  availLabels,
}: Props) {
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    filter === 'all'
      ? applications
      : applications.filter((a) => (a.applicationStatus ?? 'new') === filter);

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Status filter */}
      <div className='mb-6 flex flex-wrap gap-2'>
        {['all', ...Object.keys(statusLabels)].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            aria-current={filter === s ? 'true' : undefined}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
              filter === s
                ? 'bg-untele text-white'
                : 'border border-slate-300 bg-white text-slate-600 hover:border-untele hover:text-untele dark:border-slate-700 dark:bg-black dark:text-slate-400'
            }`}
          >
            {s === 'all' ? `All (${applications.length})` : statusLabels[s]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse text-sm'>
          <thead>
            <tr className='border-b-2 border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900'>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'
              >
                Applicant
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'
              >
                Position(s)
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'
              >
                Experience
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'
              >
                Availability
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'
              >
                Submitted
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500'
              >
                Status
              </th>
              <th scope='col' className='px-4 py-3' />
            </tr>
          </thead>
          <tbody>
            {filtered.map((app) => {
              const isExpanded = expandedId === app._id;
              const status = app.applicationStatus ?? 'new';
              const positions = app.positionsOfInterest ?? [];
              if (positions.includes('other') && app.otherPosition) {
                positions.push(app.otherPosition);
              }

              return (
                <React.Fragment key={app._id}>
                  <tr
                    className={`border-b border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 ${
                      isExpanded ? 'bg-slate-50 dark:bg-slate-900' : 'bg-white dark:bg-black'
                    }`}
                  >
                    <td className='px-4 py-4'>
                      <p className='font-bold text-slate-900 dark:text-white'>
                        {app.firstName} {app.lastName}
                      </p>
                      <a
                        href={`mailto:${app.email}`}
                        className='text-xs text-untele hover:underline'
                      >
                        {app.email}
                      </a>
                      {app.location && <p className='text-xs text-slate-400'>{app.location}</p>}
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex flex-wrap gap-1'>
                        {positions
                          .filter((p) => p !== 'other')
                          .slice(0, 3)
                          .map((p) => (
                            <span
                              key={p}
                              className='inline-block bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            >
                              {p.replace(/-/g, ' ')}
                            </span>
                          ))}
                        {positions.length > 3 && (
                          <span className='text-xs text-slate-400'>+{positions.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className='px-4 py-4 text-slate-600 dark:text-slate-400'>
                      {expLabels[app.experienceLevel ?? ''] ?? app.experienceLevel ?? '—'}
                    </td>
                    <td className='px-4 py-4 text-slate-600 dark:text-slate-400'>
                      {availLabels[app.availability ?? ''] ?? app.availability ?? '—'}
                    </td>
                    <td className='px-4 py-4 text-slate-600 dark:text-slate-400'>
                      {formatDate(app.submittedAt)}
                    </td>
                    <td className='px-4 py-4'>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-black uppercase tracking-widest ${statusColors[status] ?? ''}`}
                      >
                        {statusLabels[status] ?? status}
                      </span>
                    </td>
                    <td className='px-4 py-4'>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : app._id)}
                        className='flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-untele'
                        aria-expanded={isExpanded}
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
                    <tr className='border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'>
                      <td colSpan={7} className='px-6 py-6'>
                        <div className='grid gap-6 md:grid-cols-2'>
                          {/* Experience description */}
                          {app.experienceDescription && (
                            <div className='md:col-span-2'>
                              <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>
                                Experience Description
                              </h4>
                              <p className='whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300'>
                                {app.experienceDescription}
                              </p>
                            </div>
                          )}

                          {/* Portfolio & links */}
                          <div>
                            <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>
                              Links
                            </h4>
                            <div className='space-y-1'>
                              {app.portfolioWebsite && (
                                <a
                                  href={app.portfolioWebsite}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='flex items-center gap-1 text-sm text-untele hover:underline'
                                >
                                  Portfolio <ExternalLink className='h-3 w-3' />
                                </a>
                              )}
                              {app.youtubeChannel && (
                                <a
                                  href={app.youtubeChannel}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='flex items-center gap-1 text-sm text-untele hover:underline'
                                >
                                  YouTube <ExternalLink className='h-3 w-3' />
                                </a>
                              )}
                              {app.socialMediaLinks?.map((l, i) =>
                                l.url ? (
                                  <a
                                    key={i}
                                    href={l.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='flex items-center gap-1 text-sm text-untele hover:underline'
                                  >
                                    {l.platform || 'Social'} <ExternalLink className='h-3 w-3' />
                                  </a>
                                ) : null
                              )}
                              {!app.portfolioWebsite &&
                                !app.youtubeChannel &&
                                !app.socialMediaLinks?.some((l) => l.url) && (
                                  <p className='text-sm text-slate-400'>No links provided</p>
                                )}
                            </div>
                          </div>

                          {/* Work samples */}
                          <div>
                            <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>
                              Work Samples
                            </h4>
                            {app.workSamples && app.workSamples.length > 0 ? (
                              <ul className='space-y-1'>
                                {app.workSamples.map((s, i) => (
                                  <li key={i}>
                                    <a
                                      href={s.url}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='flex items-center gap-1 text-sm text-untele hover:underline'
                                    >
                                      {s.title || `Sample ${i + 1}`}{' '}
                                      <ExternalLink className='h-3 w-3' />
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className='text-sm text-slate-400'>None provided</p>
                            )}
                          </div>

                          {/* Social platforms */}
                          {app.socialMediaPlatforms && app.socialMediaPlatforms.length > 0 && (
                            <div>
                              <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>
                                Active Platforms
                              </h4>
                              <div className='flex flex-wrap gap-2'>
                                {app.socialMediaPlatforms.map((p) => (
                                  <span
                                    key={p}
                                    className='bg-slate-200 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                  >
                                    {p}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Contact */}
                          {app.phone && (
                            <div>
                              <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>
                                Phone
                              </h4>
                              <p className='text-sm text-slate-700 dark:text-slate-300'>
                                {app.phone}
                              </p>
                            </div>
                          )}

                          {/* Additional info */}
                          {app.additionalInfo && (
                            <div className='md:col-span-2'>
                              <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>
                                Additional Information
                              </h4>
                              <p className='whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300'>
                                {app.additionalInfo}
                              </p>
                            </div>
                          )}

                          {/* Notes */}
                          {app.notes && (
                            <div className='md:col-span-2'>
                              <h4 className='mb-2 text-xs font-black uppercase tracking-widest text-slate-500'>
                                Internal Notes
                              </h4>
                              <p className='whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300'>
                                {app.notes}
                              </p>
                            </div>
                          )}

                          {/* Studio link */}
                          <div className='md:col-span-2'>
                            <a
                              href={`/studio/structure/jobApplication;${app._id}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='inline-flex items-center gap-2 bg-untele px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-red-700'
                            >
                              Edit in Studio <ExternalLink className='h-3 w-3' />
                            </a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className='border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-black'>
          <p className='text-sm font-bold uppercase tracking-widest text-slate-400'>
            No applications with status &ldquo;{filter}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
