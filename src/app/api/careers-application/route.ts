// src/app/api/careers-application/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import sanityClient from '@/lib/sanity/lib/client';

// Server-side schema — mirrors jobApplicationSchema without File refinements
const serverSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  position: z.string().min(1),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  coverLetter: z.string().min(100).max(3000),
  howDidYouFindUs: z.enum([
    'existing-reader',
    'social-media',
    'word-of-mouth',
    'google-search',
    'other',
  ]),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const fields = {
      fullName: (formData.get('fullName') as string | null) ?? '',
      email: (formData.get('email') as string | null) ?? '',
      position: (formData.get('position') as string | null) ?? '',
      portfolioUrl: (formData.get('portfolioUrl') as string | null) ?? undefined,
      linkedinUrl: (formData.get('linkedinUrl') as string | null) ?? undefined,
      coverLetter: (formData.get('coverLetter') as string | null) ?? '',
      howDidYouFindUs: (formData.get('howDidYouFindUs') as string | null) ?? '',
    };

    const parsed = serverSchema.safeParse(fields);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    // Split fullName into firstName + lastName for the jobApplication schema
    const nameParts = parsed.data.fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Upload resume to Sanity Assets if provided
    let resumeAsset: { _type: string; asset: { _type: string; _ref: string } } | undefined;
    const resumeFile = formData.get('resume') as File | null;
    if (resumeFile && resumeFile.size > 0) {
      try {
        const buffer = Buffer.from(await resumeFile.arrayBuffer());
        const uploaded = await sanityClient.assets.upload('file', buffer, {
          filename: resumeFile.name,
          contentType: resumeFile.type,
        });
        resumeAsset = {
          _type: 'file',
          asset: { _type: 'reference', _ref: uploaded._id },
        };
      } catch (uploadErr) {
        console.error('[careers-application] Resume upload failed:', uploadErr);
        // Non-fatal — continue without resume
      }
    }

    await sanityClient.create({
      _type: 'jobApplication',
      firstName,
      lastName,
      email: parsed.data.email,
      positionsOfInterest: [parsed.data.position],
      portfolioWebsite: parsed.data.portfolioUrl || undefined,
      experienceDescription: parsed.data.coverLetter,
      additionalInfo: `LinkedIn: ${parsed.data.linkedinUrl || 'N/A'} | Source: ${parsed.data.howDidYouFindUs}`,
      availability: 'flexible',
      ...(resumeAsset ? { resume: resumeAsset } : {}),
      submittedAt: new Date().toISOString(),
      applicationStatus: 'new',
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('[careers-application] Error:', error);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
