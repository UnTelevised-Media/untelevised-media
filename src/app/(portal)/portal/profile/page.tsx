// src/app/(portal)/portal/profile/page.tsx
// Author profile edit page — lets signed-in authors update their own Sanity author document.
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { getSanityAuthorIdForCurrentUser } from '@/lib/portal/author-actions';
import { portalFetch } from '@/lib/portal/live';
import { queryPortalMyProfile } from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import AuthorProfileForm from '@/components/portal/AuthorProfileForm';

export const metadata = {
  title: 'My Profile — Author Portal',
  robots: { index: false, follow: false },
};

export default async function PortalProfilePage() {
  const { id: clerkUserId, role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');
  const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />

      <main className='mx-auto max-w-3xl px-4 py-8 sm:px-6'>
        <div className='mb-8'>
          <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
            My Profile
          </h1>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            Update your public author profile shown alongside your articles.
          </p>
        </div>

        {!sanityAuthorId ? (
          <div className='rounded border border-amber-200 bg-amber-50 px-6 py-5 dark:border-amber-800 dark:bg-amber-950'>
            <p className='text-sm font-semibold text-amber-800 dark:text-amber-200'>
              No author profile linked to your account.
            </p>
            <p className='mt-1 text-xs text-amber-700 dark:text-amber-300'>
              Contact an administrator to link your Clerk account to a Sanity author document.
            </p>
          </div>
        ) : (
          <ProfileLoader sanityAuthorId={sanityAuthorId} />
        )}
      </main>
    </div>
  );
}

async function ProfileLoader({ sanityAuthorId }: { sanityAuthorId: string }) {
  const profile = await portalFetch<Parameters<typeof AuthorProfileForm>[0]['profile'] | null>(
    queryPortalMyProfile,
    { id: sanityAuthorId },
  );

  if (!profile) {
    return (
      <div className='rounded border border-red-200 bg-red-50 px-6 py-5 dark:border-red-800 dark:bg-red-950'>
        <p className='text-sm font-semibold text-red-800 dark:text-red-200'>
          Author document not found.
        </p>
        <p className='mt-1 text-xs text-red-700 dark:text-red-300'>
          The linked author document may have been deleted. Contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className='rounded border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
      <AuthorProfileForm profile={profile} />
    </div>
  );
}
