// src/app/(portal)/layout.tsx
// Portal route group layout — Clerk auth gate + portal role check.
// All /portal/* routes are protected here AND in middleware.ts (defense in depth).
import { requireAuthor } from '@/lib/auth/roles';
import { Toaster } from '@/components/ui/sonner';
import { PortalSanityLive } from '@/lib/portal/live';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  // Double-check server-side — middleware already blocks unauthenticated/role-less users,
  // but we verify again here as a defense-in-depth measure.
  await requireAuthor();

  return (
    <div className='min-h-screen bg-white text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100'>
      {children}
      <Toaster />
      <PortalSanityLive />
    </div>
  );
}
