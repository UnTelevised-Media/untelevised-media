// src/app/api/secure-contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import sanityClient from '@/lib/sanity/lib/client';
import { checkSubmissionRate } from '@/lib/bookstore/ratelimit';

const SecureContactSchema = z.object({
  name: z.string().max(200).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional().or(z.literal('')),
  phone: z.string().max(30).trim().optional(),
  subject: z.string().min(1).max(500).trim(),
  message: z.string().min(1).max(10000).trim(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  contactMethod: z.enum(['email', 'phone', 'signal', 'none']).default('email'),
  isAnonymous: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const rl = await checkSubmissionRate(request);
  if (rl.limited) {
    return NextResponse.json(
      { error: 'Too many requests — please wait a moment before submitting again' },
      { status: 429 }
    );
  }

  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = SecureContactSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Create the document in Sanity
    const doc = {
      _type: 'secureContact',
      name: data.name ?? null,
      email: data.email || null,
      phone: data.phone ?? null,
      subject: data.subject,
      message: data.message,
      urgency: data.urgency,
      contactMethod: data.contactMethod,
      isAnonymous: data.isAnonymous,
      submittedAt: new Date().toISOString(), // always server-set
      status: 'new',
    };

    const result = await sanityClient.create(doc);

    return NextResponse.json(
      {
        success: true,
        id: result._id,
        message: 'Secure contact submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    console.error('[secure-contact] Error:', message);
    return NextResponse.json({ error: 'Failed to submit secure contact' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
