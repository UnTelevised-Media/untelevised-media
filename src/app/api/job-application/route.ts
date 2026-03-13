import { NextRequest, NextResponse } from 'next/server';
import sanityClient from '@/lib/sanity/lib/client';

interface SocialMediaLink {
  platform: string;
  url: string;
}

interface WorkSample {
  title: string;
  url: string;
}

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'positionsOfInterest',
      'experienceLevel',
      'experienceDescription',
      'availability',
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Clean up the data
    const cleanedData = {
      ...body,
      socialMediaLinks:
        body.socialMediaLinks?.filter((link: SocialMediaLink) => link.platform && link.url) ?? [],
      workSamples:
        body.workSamples?.filter((sample: WorkSample) => sample.title && sample.url) ?? [],
      submittedAt: new Date().toISOString(),
      applicationStatus: 'new',
    };

    // Create the document in Sanity
    const result = await sanityClient.create({
      _type: 'jobApplication',
      ...cleanedData,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully!',
        id: result._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting job application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}
