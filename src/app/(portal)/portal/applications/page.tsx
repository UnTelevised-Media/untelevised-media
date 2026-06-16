// src/app/(portal)/portal/applications/page.tsx
// Job applications inbox — editor+ only.
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { portalFetch } from '@/lib/portal/live';
import { queryPortalJobApplications } from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import { ApplicationsTable, type JobApplication } from '@/components/admin/ApplicationsTable';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Applications — Author Portal',
  robots: { index: false, follow: false },
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  hold: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
};
const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  review: 'Under Review',
  interview: 'Interview',
  accepted: 'Accepted',
  declined: 'Declined',
  hold: 'On Hold',
};
const EXP_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  some: '1–2 yrs',
  experienced: '3–5 yrs',
  expert: '5+ yrs',
};
const AVAIL_LABELS: Record<string, string> = {
  'part-time': 'Part-time',
  'full-time': 'Full-time',
  freelance: 'Freelance',
  volunteer: 'Volunteer',
  flexible: 'Flexible',
};

export default async function ApplicationsPage() {
  const { role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');
  if (!isEditorPlus) redirect('/portal/articles');

  const applications = (await portalFetch<JobApplication[]>(queryPortalJobApplications)) ?? [];

  const counts = applications.reduce(
    (acc: Record<string, number>, app) => {
      const s = app.applicationStatus ?? 'new';
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
              Job Applications
            </h1>
            <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
              {applications.length} total
            </p>
          </div>
        </div>

        {/* Status summary */}
        <div className='mb-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6'>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div
              key={key}
              className='border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900'
            >
              <p className='mb-1 text-2xl font-black text-slate-900 dark:text-white'>
                {counts[key] ?? 0}
              </p>
              <p className='text-xs font-bold uppercase tracking-widest text-slate-500'>{label}</p>
            </div>
          ))}
        </div>

        {applications.length === 0 ? (
          <div className='border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900'>
            <p className='text-lg font-black uppercase tracking-widest text-slate-400'>
              No Applications Yet
            </p>
          </div>
        ) : (
          <ApplicationsTable
            applications={applications}
            statusColors={STATUS_COLORS}
            statusLabels={STATUS_LABELS}
            expLabels={EXP_LABELS}
            availLabels={AVAIL_LABELS}
          />
        )}
      </main>
    </div>
  );
}
