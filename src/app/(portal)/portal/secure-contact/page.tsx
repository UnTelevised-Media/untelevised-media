// src/app/(portal)/portal/secure-contact/page.tsx
// Secure contact submissions — editor+ only.
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { portalFetch } from '@/lib/portal/live';
import { queryPortalSecureContacts } from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import { SecureContactTable, type SecureContact } from '@/components/portal/SecureContactTable';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Secure Contact — Author Portal',
  robots: { index: false, follow: false },
};

export default async function SecureContactPage() {
  const { role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');
  if (!isEditorPlus) redirect('/portal/articles');

  const contacts = (await portalFetch<SecureContact[]>(queryPortalSecureContacts)) ?? [];

  const newCount = contacts.filter((c) => (c.status ?? 'new') === 'new').length;

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        <div className='mb-8'>
          <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
            Secure Contact
          </h1>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            {contacts.length} total &nbsp;·&nbsp; {newCount} new
          </p>
        </div>
        <SecureContactTable contacts={contacts} />
      </main>
    </div>
  );
}
