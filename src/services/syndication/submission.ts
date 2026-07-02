import { client } from '@/lib/sanity/lib/client';

export async function submitMedia(data: Record<string, unknown>) {
  return client.create({
    _type: 'mediaSubmission',
    ...data,
    submittedAt: new Date().toISOString(),
  });
}

export async function submitMediaSolicitation(data: Record<string, unknown>) {
  return client.create({
    _type: 'mediaListing',
    ...data,
    submittedAt: new Date().toISOString(),
  });
}
