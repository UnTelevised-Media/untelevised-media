// src/app/(admin)/admin/page.tsx
// Protected by middleware — requires Clerk publicMetadata.admin === 'true'
import type { Metadata } from 'next';
import { sanityFetch } from '@/lib/sanity/lib/live';
import { queryJobApplications } from '@/lib/sanity/lib/queries';
import { ApplicationsTable } from '@/components/admin/ApplicationsTable';

export const metadata: Metadata = {
  title: 'Admin Dashboard | UnTelevised Media',
  robots: { index: false, follow: false },
};

interface JobApplication {
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

export default async function AdminDashboard() {
  let applications: JobApplication[] = [];

  try {
    const { data } = await sanityFetch({
      query: queryJobApplications,
      tags: ['jobApplication'],
    });
    applications = data ?? [];
  } catch {
    // fallback to empty list
  }

  const counts = applications.reduce(
    (acc, app) => {
      const s = app.applicationStatus ?? 'new';
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100'>
      {/* Top bar */}
      <header className='border-b border-slate-300 bg-white dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'>
          <div className='flex items-center gap-4'>
            <div className='bg-untele px-3 py-1'>
              <span className='text-xs font-black uppercase tracking-widest text-white'>
                ADMIN
              </span>
            </div>
            <span className='text-sm font-bold uppercase tracking-widest text-slate-500'>
              UnTelevised Media
            </span>
          </div>
          <a
            href='/studio'
            className='text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-untele'
          >
            Open Studio →
          </a>
        </div>
      </header>

      <div className='mx-auto max-w-7xl px-6 py-10'>
        {/* Page heading */}
        <div className='mb-10 flex items-center space-x-4'>
          <div className='bg-untele px-4 py-2'>
            <h1 className='text-xl font-black uppercase tracking-widest text-white'>
              JOB APPLICATIONS
            </h1>
          </div>
          <div className='h-px flex-1 bg-slate-300 dark:bg-slate-700' />
          <span className='text-sm font-bold uppercase tracking-widest text-slate-500'>
            {applications.length} TOTAL
          </span>
        </div>

        {/* Status summary */}
        <div className='mb-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6'>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} className='border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-black'>
              <p className='mb-1 text-2xl font-black text-slate-900 dark:text-white'>
                {counts[key] ?? 0}
              </p>
              <p className='text-xs font-bold uppercase tracking-widest text-slate-500'>{label}</p>
            </div>
          ))}
        </div>

        {/* Applications table — client component for expand/filter */}
        {applications.length === 0 ? (
          <div className='border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-black'>
            <p className='text-lg font-black uppercase tracking-widest text-slate-400'>
              No Applications Yet
            </p>
            <p className='mt-2 text-sm text-slate-500'>
              Submitted applications will appear here.
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
      </div>
    </div>
  );
}
