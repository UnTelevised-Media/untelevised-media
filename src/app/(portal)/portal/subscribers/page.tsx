// src/app/(portal)/portal/subscribers/page.tsx
// Newsletter subscriber list — editor+ only.
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { portalFetch } from '@/lib/portal/live';
import { queryPortalNewsletterSubscribers } from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import { SubscribersList, type Subscriber } from '@/components/portal/SubscribersList';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Subscribers — Author Portal',
  robots: { index: false, follow: false },
};

export default async function SubscribersPage() {
  const { role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');
  if (!isEditorPlus) redirect('/portal/articles');

  const subscribers = await portalFetch<Subscriber[]>(queryPortalNewsletterSubscribers) ?? [];

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        <div className='mb-8'>
          <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
            Newsletter Subscribers
          </h1>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>{subscribers.length} subscribers</p>
        </div>
        <SubscribersList subscribers={subscribers} />
      </main>
    </div>
  );
}
