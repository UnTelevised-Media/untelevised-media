import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/components/global/Header';
import Footer from '@/components/global/Footer';
import { getRoleFromMeta } from '@/lib/auth/roles-utils';
import type { PortalRole } from '@/lib/auth/roles-utils';

export default async function PortalGroupLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const role = getRoleFromMeta((user.publicMetadata ?? {}) as Record<string, unknown>);
  if (!role) redirect('/');

  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      <Header />
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        <div className='mb-6'>
          <div className='mb-1 inline-block bg-untele px-3 py-1'>
            <span className='text-[10px] font-black uppercase tracking-widest text-white'>
              {roleLabel(role)}
            </span>
          </div>
          <h1 className='text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white'>
            Portal
          </h1>
        </div>
        {children}
      </main>
      <Footer />
    </div>
  );
}

function roleLabel(role: PortalRole): string {
  const labels: Record<PortalRole, string> = {
    admin: 'Admin',
    editor: 'Editor',
    author: 'Author',
    sales: 'Sales',
  };
  return labels[role];
}
