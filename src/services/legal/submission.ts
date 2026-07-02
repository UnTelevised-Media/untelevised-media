import { client } from '@/lib/sanity/lib/client';

export async function submitAbuseReport(data: Record<string, unknown>) {
  return client.create({
    _type: 'abuseReport',
    ...data,
    submittedAt: new Date().toISOString(),
  });
}

export async function submitCopyrightClaim(data: Record<string, unknown>) {
  return client.create({
    _type: 'copyrightClaim',
    ...data,
    submittedAt: new Date().toISOString(),
  });
}

export async function submitDefamationClaim(data: Record<string, unknown>) {
  return client.create({
    _type: 'defamationClaim',
    ...data,
    submittedAt: new Date().toISOString(),
  });
}

export async function submitDMCATakedown(data: Record<string, unknown>) {
  return client.create({
    _type: 'dmcaTakedown',
    ...data,
    submittedAt: new Date().toISOString(),
  });
}
