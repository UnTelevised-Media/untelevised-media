// src/lib/portal/image-actions.ts
// Server action for uploading images to Sanity's asset pipeline.
// Returns the Sanity asset reference for use in article mainImage or body images.
'use server';

import { requireAuthor } from '@/lib/auth/roles';
import { writeClient } from '@/lib/sanity/lib/write-client';

export async function uploadImageToSanity(
  formData: FormData
): Promise<{ success: true; assetId: string; url: string } | { success: false; error: string }> {
  await requireAuthor();

  const file = formData.get('file') as File | null;
  if (!file) return { success: false, error: 'No file provided' };

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, AVIF.' };
  }

  const maxSizeMB = 10;
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { success: false, error: `File too large. Maximum size is ${maxSizeMB}MB.` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const asset = await writeClient.assets.upload('image', buffer, {
    filename: file.name,
    contentType: file.type,
  });

  return { success: true, assetId: asset._id, url: asset.url };
}
