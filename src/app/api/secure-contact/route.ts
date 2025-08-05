// src/app/api/secure-contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/sanity/lib/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.subject || !body.message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // Create the document in Sanity
    const doc = {
      _type: 'secureContact',
      name: body.name || null,
      email: body.email || null,
      phone: body.phone || null,
      subject: body.subject,
      message: body.message,
      urgency: body.urgency || 'medium',
      contactMethod: body.contactMethod || 'email',
      isAnonymous: body.isAnonymous || false,
      submittedAt: body.submittedAt || new Date().toISOString(),
      status: 'new',
    };

    const result = await client.create(doc);

    return NextResponse.json(
      { 
        success: true, 
        id: result._id,
        message: 'Secure contact submitted successfully' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating secure contact:', error);
    return NextResponse.json(
      { error: 'Failed to submit secure contact' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
