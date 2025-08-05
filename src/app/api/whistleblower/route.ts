// src/app/api/whistleblower/route.ts
import { NextRequest, NextResponse } from 'next/server';
import sanityClient from '@/lib/sanity/lib/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.category || !body.severity) {
      return NextResponse.json(
        { error: 'Title, description, category, and severity are required' },
        { status: 400 }
      );
    }

    // Create the document in Sanity
    const doc = {
      _type: 'whistleblower',
      submissionId: body.submissionId,
      title: body.title,
      description: body.description,
      organization: body.organization ?? null,
      location: body.location ?? null,
      timeframe: body.timeframe ?? null,
      category: body.category,
      severity: body.severity,
      evidence: body.evidence ?? null,
      witnessInfo: body.witnessInfo ?? null,
      contactInfo: body.contactInfo ?? null,
      isAnonymous: body.isAnonymous !== undefined ? body.isAnonymous : true,
      protectionNeeded: body.protectionNeeded ?? false,
      submittedAt: body.submittedAt ?? new Date().toISOString(),
      status: 'new',
      priority: 'medium',
      notes: null,
    };

    const result = await sanityClient.create(doc);

    return NextResponse.json(
      {
        success: true,
        id: result._id,
        submissionId: body.submissionId,
        message: 'Whistleblower report submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating whistleblower submission:', error);
    return NextResponse.json({ error: 'Failed to submit whistleblower report' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
