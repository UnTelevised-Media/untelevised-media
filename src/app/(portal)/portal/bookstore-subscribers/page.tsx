// src/app/(portal)/portal/bookstore-subscribers/page.tsx
// Hurriya Publications newsletter subscriber list — editor+ only.

import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { portalFetch } from '@/lib/portal/live';
import { queryPortalBookstoreSubscribers } from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import { SubscribersList, type Subscriber } from '@/components/portal/SubscribersList';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Bookstore Subscribers — Author Portal',
  robots: { index: false, follow: false },
};

export default async function BookstoreSubscribersPage() {
  const { role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');
  if (!isEditorPlus) redirect('/portal/articles');

  const subscribers = (await portalFetch<Subscriber[]>(queryPortalBookstoreSubscribers)) ?? [];

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        <div className='mb-8'>
          <p className='mb-1 text-[10px] font-black uppercase tracking-widest text-[#009736]'>
            Hurriya Publications
          </p>
          <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
            Bookstore Subscribers
          </h1>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <SubscribersList subscribers={subscribers} />
      </main>
    </div>
  );
}
