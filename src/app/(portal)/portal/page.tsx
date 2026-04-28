import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getRoleFromMeta } from '@/lib/auth/roles-utils';

export default async function PortalIndexPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const role = getRoleFromMeta((user.publicMetadata ?? {}) as Record<string, unknown>);
  if (role === 'sales') redirect('/portal/orders');
  redirect('/portal/books');
}
