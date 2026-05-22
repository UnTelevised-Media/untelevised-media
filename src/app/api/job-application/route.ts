import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import sanityClient from '@/lib/sanity/lib/client';

const VALID_POSITIONS = [
  'article-writer',
  'article-editor',
  'video-editor',
  'live-street-journalist',
  'social-media-manager',
  'content-creator',
  'radio-host',
  'video-producer',
  'photographer',
  'graphic-designer',
  'web-developer',
  'research-analyst',
  'other',
] as const;

const VALID_SOCIAL_PLATFORMS = [
  'youtube',
  'tiktok',
  'instagram',
  'twitter',
  'facebook',
  'linkedin',
  'twitch',
  'podcast',
  'blog',
  'other',
  'none',
] as const;

const JobApplicationSchema = z.object({
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().max(20).trim().optional(),
  location: z.string().max(100).trim().optional(),
  positionsOfInterest: z.array(z.enum(VALID_POSITIONS)).min(1).max(5),
  otherPosition: z.string().max(200).trim().optional(),
  socialMediaPlatforms: z.array(z.enum(VALID_SOCIAL_PLATFORMS)).max(10).optional(),
  portfolioWebsite: z.string().url().optional().or(z.literal('')),
  youtubeChannel: z.string().url().optional().or(z.literal('')),
  socialMediaLinks: z
    .array(
      z.object({
        platform: z.string().max(50).trim(),
        url: z.string().url(),
      })
    )
    .max(10)
    .optional(),
  experienceLevel: z.enum(['beginner', 'some', 'experienced', 'expert']),
  experienceDescription: z.string().min(50).max(1000).trim(),
  workSamples: z
    .array(
      z.object({
        title: z.string().max(200).trim(),
        url: z.string().url(),
      })
    )
    .max(10)
    .optional(),
  availability: z.enum(['part-time', 'full-time', 'freelance', 'volunteer', 'flexible']),
  additionalInfo: z.string().max(2000).trim().optional(),
});

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json().catch(() => null);

    if (!rawBody) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = JobApplicationSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    await sanityClient.create({
      _type: 'jobApplication',
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      location: data.location,
      positionsOfInterest: data.positionsOfInterest,
      otherPosition: data.otherPosition,
      socialMediaPlatforms: data.socialMediaPlatforms,
      portfolioWebsite: data.portfolioWebsite ?? undefined,
      youtubeChannel: data.youtubeChannel ?? undefined,
      socialMediaLinks: data.socialMediaLinks ?? [],
      experienceLevel: data.experienceLevel,
      experienceDescription: data.experienceDescription,
      workSamples: data.workSamples ?? [],
      availability: data.availability,
      additionalInfo: data.additionalInfo,
      submittedAt: new Date().toISOString(),
      applicationStatus: 'new',
    });

    return NextResponse.json(
      { success: true, message: 'Application submitted successfully!' },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    console.error('[job-application] Error:', message);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}
