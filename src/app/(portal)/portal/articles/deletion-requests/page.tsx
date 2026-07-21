// src/app/(portal)/portal/articles/deletion-requests/page.tsx
// Editor/admin-only queue — every article with a pending author removal request.
import { redirect } from 'next/navigation';
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { portalFetch } from '@/services/portal/fetch';
import { queryPortalDeletionRequests } from '@/services/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import DeletionRequestsPanel from '@/components/portal/DeletionRequestsPanel';
import type { PortalArticle } from '@/components/portal/ArticleDashboard';

export const metadata = {
  title: 'Deletion Requests — Author Portal',
  robots: { index: false, follow: false },
};

export default async function DeletionRequestsPage() {
  const { role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');
  if (!isEditorPlus) {redirect('/portal/articles');}

  const requests = (await portalFetch<PortalArticle[]>(queryPortalDeletionRequests)) ?? [];

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        <div className='mb-8'>
          <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
            Deletion Requests
          </h1>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            {requests.length} pending removal request{requests.length === 1 ? '' : 's'}
          </p>
        </div>

        <DeletionRequestsPanel requests={requests} />
      </main>
    </div>
  );
}
