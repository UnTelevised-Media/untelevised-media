// src/app/(portal)/portal/contact/page.tsx
// Contact form submissions inbox — editor+ only.
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { portalClient } from '@/lib/portal/fetch';
import { queryPortalContactSubmissions } from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import { ContactTable, type ContactSubmission } from '@/components/portal/ContactTable';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Contact — Author Portal',
  robots: { index: false, follow: false },
};

export default async function ContactPage() {
  const { role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');
  if (!isEditorPlus) redirect('/portal/articles');

  const submissions = await portalClient.fetch<ContactSubmission[]>(queryPortalContactSubmissions) ?? [];

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        <div className='mb-8'>
          <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
            Contact Submissions
          </h1>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>{submissions.length} submissions</p>
        </div>
        <ContactTable submissions={submissions} />
      </main>
    </div>
  );
}
