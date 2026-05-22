// src/app/(portal)/portal/sources/new/page.tsx
// New source document page — full form (not just the inline modal version).
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import PortalNav from '@/components/portal/PortalNav';
import SourceForm from '@/components/portal/SourceForm';

export const metadata = {
  title: 'New Source — Author Portal',
  robots: { index: false, follow: false },
};

export default async function NewSourcePage() {
  const { role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');
  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />
      <main className='mx-auto max-w-2xl px-4 py-8 sm:px-6'>
        <h1 className='mb-6 text-xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
          New Source Document
        </h1>
        <SourceForm />
      </main>
    </div>
  );
}
