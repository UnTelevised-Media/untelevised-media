// src/app/api/whistleblower/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import sanityClient from '@/lib/sanity/lib/client';
import { checkWhistleblowerRate } from '@/lib/bookstore/ratelimit';

const VALID_CATEGORIES = [
  'corruption',
  'fraud',
  'safety',
  'discrimination',
  'environmental',
  'financial',
  'legal',
  'other',
] as const;

const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;

const WhistleblowerSchema = z.object({
  title: z.string().min(1).max(500).trim(),
  description: z.string().min(10).max(10000).trim(),
  category: z.enum(VALID_CATEGORIES),
  severity: z.enum(VALID_SEVERITIES),
  organization: z.string().max(500).trim().optional(),
  location: z.string().max(500).trim().optional(),
  timeframe: z.string().max(500).trim().optional(),
  evidence: z.string().max(5000).trim().optional(),
  witnessInfo: z.string().max(2000).trim().optional(),
  contactInfo: z.string().max(1000).trim().optional(),
  isAnonymous: z.boolean().default(true),
  protectionNeeded: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const rl = await checkWhistleblowerRate(request);
  if (rl.limited) {
    return NextResponse.json(
      { error: 'Too many requests — please wait before submitting another report' },
      { status: 429 }
    );
  }

  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = WhistleblowerSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // submissionId and submittedAt are always server-generated — never trusted from the client.
    // A client-provided submissionId could be used to collide with or pollute existing records.
    const submissionId = randomUUID();
    const submittedAt = new Date().toISOString();

    const result = await sanityClient.create({
      _type: 'whistleblower',
      submissionId,
      title: data.title,
      description: data.description,
      organization: data.organization ?? null,
      location: data.location ?? null,
      timeframe: data.timeframe ?? null,
      category: data.category,
      severity: data.severity,
      evidence: data.evidence ?? null,
      witnessInfo: data.witnessInfo ?? null,
      contactInfo: data.contactInfo ?? null,
      isAnonymous: data.isAnonymous,
      protectionNeeded: data.protectionNeeded,
      submittedAt,
      status: 'new',
      priority: 'medium',
      notes: null,
    });

    return NextResponse.json(
      {
        success: true,
        id: result._id,
        submissionId,
        message: 'Whistleblower report submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    console.error('[whistleblower] Error:', message);
    return NextResponse.json({ error: 'Failed to submit whistleblower report' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
