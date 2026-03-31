// src/app/api/admin/set-role/route.ts
// Admin-only API route to assign a portal role to a Clerk user.
// Role is written to publicMetadata.role — never writable from the client.
// Only accessible to users with admin role (verified server-side on every request).
import { clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/roles';
import { z } from 'zod';

const bodySchema = z.object({
  targetUserId: z.string().min(1),
  role: z.enum(['admin', 'editor', 'author']),
});

export async function POST(req: NextRequest) {
  // Verify the requester is an admin — throws redirect if not (caught below)
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
