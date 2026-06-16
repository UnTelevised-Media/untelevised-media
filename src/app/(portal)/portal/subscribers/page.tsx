// src/app/(portal)/portal/subscribers/page.tsx
// All subscriber lists — editor+ only.
// Sections: UnTelevised Newsletter · Hurriya Publications Bookstore

import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { portalFetch } from '@/lib/portal/live';
import {
  queryPortalNewsletterSubscribers,
  queryPortalBookstoreSubscribers,
} from '@/lib/portal/queries';
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

  const [newsSubscribers, bookstoreSubscribers] = await Promise.all([
    portalFetch<Subscriber[]>(queryPortalNewsletterSubscribers).then((r) => r ?? []),
    portalFetch<Subscriber[]>(queryPortalBookstoreSubscribers).then((r) => r ?? []),
  ]);

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        <div className='mb-10'>
          <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
            Subscribers
          </h1>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            {newsSubscribers.length + bookstoreSubscribers.length} total across both lists
          </p>
        </div>

        {/* UnTelevised Newsletter */}
        <section className='mb-12'>
          <div className='mb-4 border-l-4 border-untele pl-4'>
            <h2 className='text-xs font-black uppercase tracking-widest text-untele'>
              UnTelevised Newsletter
            </h2>
            <p className='mt-0.5 text-sm text-slate-500 dark:text-slate-400'>
              {newsSubscribers.length} subscriber{newsSubscribers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <SubscribersList subscribers={newsSubscribers} />
        </section>

        {/* Hurriya Publications Bookstore */}
        <section>
          <div className='mb-4 border-l-4 border-[#009736] pl-4'>
            <p className='text-[10px] font-black uppercase tracking-widest text-[#009736]'>
              Hurriya Publications
            </p>
            <h2 className='text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
              Bookstore Newsletter
            </h2>
            <p className='mt-0.5 text-sm text-slate-500 dark:text-slate-400'>
              {bookstoreSubscribers.length} subscriber
              {bookstoreSubscribers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <SubscribersList subscribers={bookstoreSubscribers} />
        </section>
      </main>
    </div>
  );
}
