// src/app/api/admin/set-role/route.ts
// Admin-only API route to assign a portal role to a Clerk user.
// Role is written to publicMetadata.role — never writable from the client.
// Only accessible to users with admin role (verified server-side on every request).
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getRoleFromUser, hasRole } from '@/lib/auth/roles';
import { z } from 'zod';

const bodySchema = z.object({
  targetUserId: z.string().min(1),
  role: z.enum(['admin', 'editor', 'author']),
});

export async function POST(req: NextRequest) {
  // Verify the requester is an admin — use auth() directly to avoid catching
  // Next.js redirect exceptions that requireAdmin() would throw.
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasRole(getRoleFromUser(user), 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { targetUserId, role } = parsed.data;

  const client = await clerkClient();
  await client.users.updateUserMetadata(targetUserId, {
    publicMetadata: { role },
  });

  return NextResponse.json({ success: true, userId: targetUserId, role });
}
