// src/app/api/portal/upload-image/route.ts
// POST — upload an image to Sanity's asset pipeline.
// Uses a route handler instead of a server action to avoid Next.js CSRF
// failures that occur with multipart/form-data server actions when
// trailingSlash: true is set in next.config.ts.
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { fileTypeFromBuffer } from 'file-type';
import { getRoleFromUser } from '@/lib/auth/roles';
import { writeClient } from '@/lib/sanity/lib/write-client';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = getRoleFromUser(user);
  if (!role) return NextResponse.json({ error: 'Forbidden: no portal role' }, { status: 403 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, AVIF.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate actual file content via magic bytes — Content-Type header is
    // attacker-controlled and cannot be trusted on its own.
    const detected = await fileTypeFromBuffer(buffer);
    if (!detected || !ALLOWED_TYPES.includes(detected.mime)) {
      return NextResponse.json(
        { error: 'Invalid file content. Allowed: JPEG, PNG, WebP, GIF, AVIF.' },
        { status: 400 }
      );
    }

    const asset = await writeClient.assets.upload('image', buffer, {
      filename: file.name,
      contentType: detected.mime,
    });
    return NextResponse.json({ assetId: asset._id, url: asset.url });
  } catch (err) {
    console.error('[portal/upload-image]', err);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
