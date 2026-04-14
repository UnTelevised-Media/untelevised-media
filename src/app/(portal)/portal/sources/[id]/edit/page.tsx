// src/app/(portal)/portal/sources/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { portalClient } from '@/lib/portal/fetch';
import PortalNav from '@/components/portal/PortalNav';
import SourceForm from '@/components/portal/SourceForm';

export const metadata = {
  title: 'Edit Source — Author Portal',
  robots: { index: false, follow: false },
};

interface SourceDoc {
  _id: string;
  label: string;
  type?: string;
  url?: string;
  description?: string;
  isAnonymous?: boolean;
}

export default async function EditSourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');

  const source = await portalClient.fetch<SourceDoc | null>(
    `*[_type == "source" && _id == $id][0]{ _id, label, type, url, description, isAnonymous }`,
    { id },
  );

  if (!source) notFound();

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />
      <main className='mx-auto max-w-2xl px-4 py-8 sm:px-6'>
        <h1 className='mb-6 text-xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
          Edit Source
        </h1>
        <SourceForm sourceId={id} initialData={source as Parameters<typeof SourceForm>[0]['initialData']} />
      </main>
    </div>
  );
}
