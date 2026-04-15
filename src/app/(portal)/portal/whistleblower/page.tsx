// src/app/(portal)/portal/whistleblower/page.tsx
// Whistleblower submissions — editor+ only.
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { portalFetch } from '@/lib/portal/live';
import { queryPortalWhistleblowers } from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import { WhistleblowerTable, type WhistleblowerSubmission } from '@/components/portal/WhistleblowerTable';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Whistleblower — Author Portal',
  robots: { index: false, follow: false },
};

export default async function WhistleblowerPage() {
  const { role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');
  if (!isEditorPlus) redirect('/portal/articles');

  const submissions = await portalFetch<WhistleblowerSubmission[]>(queryPortalWhistleblowers) ?? [];

  const newCount = submissions.filter((s) => (s.status ?? 'new') === 'new').length;
  const criticalCount = submissions.filter((s) => s.severity === 'critical').length;

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        <div className='mb-8'>
          <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
            Whistleblower Submissions
          </h1>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            {submissions.length} total &nbsp;·&nbsp; {newCount} new
            {criticalCount > 0 && <span className='ml-2 font-bold text-red-500'>{criticalCount} critical</span>}
          </p>
        </div>
        <WhistleblowerTable submissions={submissions} />
      </main>
    </div>
  );
}
