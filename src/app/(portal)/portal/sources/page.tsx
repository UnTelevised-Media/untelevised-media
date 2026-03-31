// src/app/(portal)/portal/sources/page.tsx
// Source document library — lists all sources the current user has created
// (editors/admins see all sources).
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { portalClient } from '@/lib/portal/fetch';
import { queryPortalAllSources } from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import SourceLibrary from '@/components/portal/SourceLibrary';

export const metadata = {
  title: 'Source Library — Author Portal',
  robots: { index: false, follow: false },
};

interface PortalSource {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  label: string;
  type?: string;
  url?: string;
  description?: string;
  isAnonymous?: boolean;
  linkedArticles?: Array<{ _id: string; title: string; slug?: { current: string } }>;
}

export default async function SourcesPage() {
  const { role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');

  const sources = await portalClient.fetch<PortalSource[]>(queryPortalAllSources);

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav />
      <main className='mx-auto max-w-5xl px-4 py-8 sm:px-6'>
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
            Source Library
          </h1>
          <a
            href='/portal/sources/new'
            className='inline-flex items-center justify-center bg-untele px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-opacity hover:opacity-90'
          >
            + New Source
          </a>
        </div>
        <SourceLibrary sources={sources} isEditorPlus={isEditorPlus} />
      </main>
    </div>
  );
}
