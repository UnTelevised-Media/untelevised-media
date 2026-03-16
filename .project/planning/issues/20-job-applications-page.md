<!-- GitHub Issue: #17 -->
## Problem

The `jobApplication` Sanity schema exists and the `/api/job-application` API route exists, but there is no functioning public-facing page where candidates can apply. The plumbing is in place but the front door is missing.

This matters for several reasons:
1. **Operational**: UnTelevised Media needs contributors, journalists, photographers, and video producers. Without a visible application process, the outlet must rely entirely on personal networks.
2. **Credibility signal**: A "Careers" or "Write For Us" page signals the outlet is growing, professional, and treats journalism as a vocation rather than a hobby.
3. **SEO**: A `/careers` page targeting "journalism jobs NYC", "write for independent media", "freelance journalist" keywords is a low-competition, high-intent traffic opportunity.
4. **Editorial capacity**: Surfacing open positions and allowing general applications creates a passive pipeline of future contributors.

The `/join` page (once updated for membership tiers in Issue 16) should link to `/careers` as a separate concern — "Join as a reader/supporter" vs "Join as a contributor/staff".

## Background & Context

- **Existing infrastructure**: `jobApplication` schema and `/api/job-application` route exist but are unconnected to a UI
- **Form pattern**: The project uses `react-hook-form` + `zod` for all forms — follow this pattern exactly
- **Email delivery**: Resend (or Nodemailer with SMTP) is the standard pattern for transactional email in this stack. The existing API route likely already has email infrastructure or a stub.
- **Resume uploads**: Sanity's Asset API can store files. However for MVP, sending the resume as an email attachment is simpler and avoids Sanity storage concerns. The application metadata (name, email, position, links) is stored in Sanity; the file is forwarded by email.
- **Job listings**: Rather than hardcoding open positions in JSX, allow editors to manage active job listings in Sanity as a `jobListing` document type. When no listings are active, a "General Application" fallback is shown.

## Architecture

```
Sanity Studio
  └── jobListing documents (managed by editors)
        └── title, department, type (full-time/freelance/volunteer),
            location, description (blockContent), requirements, isActive, closingDate

src/app/(user)/careers/page.tsx (server component)
  ├── Fetches active job listings from Sanity
  ├── Displays job cards (or "General Application" if none active)
  └── Each job card → reveals ApplicationForm component

src/components/careers/ApplicationForm.tsx (client component)
  └── react-hook-form + zod validation
  └── Fields: name, email, position, portfolio URL, cover letter, resume upload, referral source
  └── onSubmit → POST /api/job-application (FormData — supports file upload)
  └── Success / error states

src/app/api/job-application/route.ts (update existing)
  └── Parse FormData (file upload support)
  └── Zod validation on server
  └── Create jobApplication document in Sanity
  └── Send confirmation email to applicant (via Resend)
  └── Send notification email to hiring editor (jobs@untelevised.media)
  └── Return { success: true } or { error: string }

/join page
  └── Link to /careers: "Want to write for us? →"
```

## Proposed Solution

### Step 1 — Job Listing Sanity Schema

```typescript
// src/lib/sanity/schemas/jobListing.ts
import { defineField, defineType } from 'sanity'
import { BriefcaseIcon } from '@sanity/icons'

export const jobListing = defineType({
  name: 'jobListing',
  title: 'Job Listing',
  type: 'document',
  icon: BriefcaseIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Job Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'department',
      title: 'Department',
      type: 'string',
      options: {
        list: [
          { title: 'Editorial', value: 'editorial' },
          { title: 'Photography', value: 'photography' },
          { title: 'Video', value: 'video' },
          { title: 'Technology', value: 'technology' },
          { title: 'Operations', value: 'operations' },
          { title: 'Community', value: 'community' },
        ],
      },
    }),
    defineField({
      name: 'type',
      title: 'Employment Type',
      type: 'string',
      options: {
        list: [
          { title: 'Full-Time', value: 'full-time' },
          { title: 'Part-Time', value: 'part-time' },
          { title: 'Freelance / Per-Story', value: 'freelance' },
          { title: 'Volunteer', value: 'volunteer' },
        ],
      },
      initialValue: 'freelance',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g. "Remote", "New York, NY", "Hybrid — NYC"',
      initialValue: 'Remote',
    }),
    defineField({
      name: 'description',
      title: 'Job Description',
      type: 'blockContent',
      description: 'Full job description with responsibilities and context.',
    }),
    defineField({
      name: 'requirements',
      title: 'Requirements',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Bullet-pointed requirements list.',
    }),
    defineField({
      name: 'compensation',
      title: 'Compensation',
      type: 'string',
      description: 'e.g. "Per-story rates", "$X/hour", "Volunteer — byline + portfolio"',
    }),
    defineField({
      name: 'isActive',
      title: 'Active Listing',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to hide this listing from the public page.',
    }),
    defineField({
      name: 'closingDate',
      title: 'Application Deadline',
      type: 'date',
      description: 'Optional deadline. Listing auto-hides after this date.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'department',
      isActive: 'isActive',
    },
    prepare({ title, subtitle, isActive }) {
      return {
        title: `${isActive ? '' : '[CLOSED] '}${title}`,
        subtitle,
      }
    },
  },
  orderings: [
    {
      title: 'Department',
      name: 'departmentAsc',
      by: [{ field: 'department', direction: 'asc' }],
    },
  ],
})
```

### Step 2 — GROQ Query

```typescript
// src/lib/sanity/queries.ts — add:

export const queryActiveJobListings = groq`
  *[
    _type == "jobListing"
    && isActive == true
    && (
      !defined(closingDate)
      || closingDate >= $today
    )
  ] | order(department asc) {
    _id,
    title,
    slug,
    department,
    type,
    location,
    compensation,
    description,
    requirements,
    closingDate
  }
`
// Pass params: { today: new Date().toISOString().split('T')[0] }
```

### Step 3 — Application Form Schema (Zod)

```typescript
// src/lib/validations/jobApplicationSchema.ts
import { z } from 'zod'

export const jobApplicationSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name too long'),
  email: z.string().email('Please enter a valid email address'),
  position: z.string().min(1, 'Please select or enter a position'),
  portfolioUrl: z
    .string()
    .url('Please enter a valid URL (include https://)')
    .optional()
    .or(z.literal('')),
  linkedinUrl: z
    .string()
    .url('Please enter a valid LinkedIn URL')
    .optional()
    .or(z.literal('')),
  coverLetter: z
    .string()
    .min(100, 'Cover letter must be at least 100 characters')
    .max(3000, 'Cover letter must be under 3000 characters'),
  howDidYouFindUs: z.enum([
    'social-media',
    'word-of-mouth',
    'google-search',
    'existing-reader',
    'other',
  ]),
  resume: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, 'Resume must be under 5MB')
    .refine(
      (f) => ['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ].includes(f.type),
      'Resume must be PDF or Word document'
    )
    .optional(),
})

export type JobApplicationFormData = z.infer<typeof jobApplicationSchema>
```

### Step 4 — Application Form Component

```typescript
// src/components/careers/ApplicationForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jobApplicationSchema, JobApplicationFormData } from '@/lib/validations/jobApplicationSchema'

interface Props {
  prefilledPosition?: string
  onSuccess?: () => void
}

export function ApplicationForm({ prefilledPosition, onSuccess }: Props) {
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      position: prefilledPosition ?? '',
    },
  })

  async function onSubmit(data: JobApplicationFormData) {
    setSubmitState('submitting')
    setErrorMessage('')

    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value)
      } else if (value !== undefined && value !== '') {
        formData.append(key, String(value))
      }
    })

    try {
      const res = await fetch('/api/job-application', {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Submission failed')
      setSubmitState('success')
      reset()
      onSuccess?.()
    } catch (err: any) {
      setSubmitState('error')
      setErrorMessage(err.message ?? 'An error occurred. Please try again.')
    }
  }

  if (submitState === 'success') {
    return (
      <div className="border border-green-800 bg-green-950/30 p-6 text-center">
        <div className="mb-2 text-xs font-black uppercase tracking-widest text-green-400">
          Application Received
        </div>
        <p className="text-sm text-zinc-300">
          Thank you for applying. We review all applications and will be in touch if there&apos;s a fit.
        </p>
      </div>
    )
  }

  const inputClass =
    'w-full border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-untele focus:outline-none'
  const labelClass = 'mb-1 block text-xs font-black uppercase tracking-widest text-zinc-400'
  const errorClass = 'mt-1 text-xs text-red-400'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <div>
        <label className={labelClass}>Full Name *</label>
        <input
          {...register('fullName')}
          placeholder="Jane Smith"
          className={inputClass}
        />
        {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>Email Address *</label>
        <input
          {...register('email')}
          type="email"
          placeholder="jane@example.com"
          className={inputClass}
        />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      {/* Position */}
      <div>
        <label className={labelClass}>Position *</label>
        <input
          {...register('position')}
          placeholder="e.g. Freelance Reporter, Photographer, General Application"
          className={inputClass}
        />
        {errors.position && <p className={errorClass}>{errors.position.message}</p>}
      </div>

      {/* Portfolio URL */}
      <div>
        <label className={labelClass}>Portfolio / Website URL</label>
        <input
          {...register('portfolioUrl')}
          type="url"
          placeholder="https://yourportfolio.com"
          className={inputClass}
        />
        {errors.portfolioUrl && <p className={errorClass}>{errors.portfolioUrl.message}</p>}
      </div>

      {/* LinkedIn */}
      <div>
        <label className={labelClass}>LinkedIn Profile URL</label>
        <input
          {...register('linkedinUrl')}
          type="url"
          placeholder="https://linkedin.com/in/yourname"
          className={inputClass}
        />
        {errors.linkedinUrl && <p className={errorClass}>{errors.linkedinUrl.message}</p>}
      </div>

      {/* Cover Letter */}
      <div>
        <label className={labelClass}>Cover Letter *</label>
        <textarea
          {...register('coverLetter')}
          rows={8}
          placeholder="Tell us about yourself, your journalism experience, why you want to contribute to UnTelevised Media, and what kind of stories you want to tell..."
          className={`${inputClass} resize-y`}
        />
        {errors.coverLetter && <p className={errorClass}>{errors.coverLetter.message}</p>}
      </div>

      {/* Resume Upload */}
      <div>
        <label className={labelClass}>Resume / CV (PDF or Word, max 5MB)</label>
        <input
          {...register('resume')}
          type="file"
          accept=".pdf,.doc,.docx"
          className="w-full border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 file:mr-4 file:border-0 file:bg-untele file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white"
        />
        {errors.resume && <p className={errorClass}>{errors.resume.message}</p>}
      </div>

      {/* How did you find us */}
      <div>
        <label className={labelClass}>How did you find us? *</label>
        <select
          {...register('howDidYouFindUs')}
          className={inputClass}
        >
          <option value="">Select one...</option>
          <option value="existing-reader">I&apos;m already a reader</option>
          <option value="social-media">Social media</option>
          <option value="word-of-mouth">Word of mouth</option>
          <option value="google-search">Google search</option>
          <option value="other">Other</option>
        </select>
        {errors.howDidYouFindUs && <p className={errorClass}>{errors.howDidYouFindUs.message}</p>}
      </div>

      {submitState === 'error' && (
        <p className="text-sm text-red-400">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={submitState === 'submitting'}
        className="bg-untele py-3 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60 w-full"
      >
        {submitState === 'submitting' ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  )
}
```

### Step 5 — Careers Page

```typescript
// src/app/(user)/careers/page.tsx
import { Metadata } from 'next'
import { sanityFetch } from '@/lib/sanity/fetch'
import { queryActiveJobListings } from '@/lib/sanity/queries'
import { PortableText } from '@portabletext/react'
import { ApplicationForm } from '@/components/careers/ApplicationForm'

export const metadata: Metadata = {
  title: 'Careers — UnTelevised Media',
  description:
    'Join the UnTelevised Media team. Open positions for journalists, photographers, videographers, and more. We are always looking for passionate storytellers.',
  alternates: {
    canonical: 'https://untelevised.media/careers',
  },
}

export default async function CareersPage() {
  const today = new Date().toISOString().split('T')[0]
  const { data: listings } = await sanityFetch({
    query: queryActiveJobListings,
    params: { today },
    tags: ['jobListing'],
  })

  const hasListings = listings && listings.length > 0

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-4 inline-block bg-untele px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
        Join the Team
      </div>
      <h1 className="mb-4 text-4xl font-black uppercase tracking-tight text-white">
        Work at UnTelevised Media
      </h1>
      <p className="mb-10 max-w-2xl text-zinc-300">
        We&apos;re building an independent journalism outlet that covers the stories others won&apos;t.
        We&apos;re looking for journalists, photographers, videographers, and community organizers
        who believe in uncensored, people-first reporting.
      </p>

      {/* Open Listings */}
      {hasListings ? (
        <section className="mb-16">
          <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-zinc-500">
            Open Positions
          </h2>
          <div className="space-y-8">
            {listings.map((job: any) => (
              <details
                key={job._id}
                className="border border-zinc-700 open:border-untele"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 hover:bg-zinc-900">
                  <div>
                    <span className="text-lg font-black uppercase text-white">
                      {job.title}
                    </span>
                    <span className="ml-3 text-xs uppercase tracking-widest text-zinc-500">
                      {job.department} · {job.type} · {job.location}
                    </span>
                  </div>
                  <span className="bg-untele px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
                    Apply
                  </span>
                </summary>
                <div className="border-t border-zinc-700 px-6 py-6">
                  {job.compensation && (
                    <p className="mb-4 text-sm text-zinc-400">
                      <span className="font-bold text-white">Compensation:</span>{' '}
                      {job.compensation}
                    </p>
                  )}
                  {job.description && (
                    <div className="prose prose-invert prose-sm mb-6 max-w-none">
                      <PortableText value={job.description} />
                    </div>
                  )}
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="mb-8">
                      <h4 className="mb-2 text-xs font-black uppercase tracking-widest text-zinc-500">
                        Requirements
                      </h4>
                      <ul className="space-y-1">
                        {job.requirements.map((req: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                            <span className="text-untele">–</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="border-t border-zinc-700 pt-6">
                    <h4 className="mb-4 text-sm font-black uppercase tracking-widest text-white">
                      Apply for: {job.title}
                    </h4>
                    <ApplicationForm prefilledPosition={job.title} />
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* General Application (always shown) */}
      <section className="border border-zinc-700 p-8">
        <h2 className="mb-2 text-xl font-black uppercase tracking-wide text-white">
          {hasListings ? 'General Application' : "We're Always Hiring"}
        </h2>
        <p className="mb-6 text-sm text-zinc-400">
          {hasListings
            ? "Don't see a role that fits? Submit a general application and we'll keep it on file."
            : "We don't have specific open roles right now, but we're always looking for talented journalists, photographers, and storytellers. Submit a general application below."}
        </p>
        <ApplicationForm prefilledPosition="General Application" />
      </section>
    </main>
  )
}
```

### Step 6 — Updated API Route

```typescript
// src/app/api/job-application/route.ts (update existing)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { z } from 'zod'

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_WRITE_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const serverSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  position: z.string().min(1),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  coverLetter: z.string().min(100).max(3000),
  howDidYouFindUs: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const fields = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      position: formData.get('position') as string,
      portfolioUrl: formData.get('portfolioUrl') as string || undefined,
      linkedinUrl: formData.get('linkedinUrl') as string || undefined,
      coverLetter: formData.get('coverLetter') as string,
      howDidYouFindUs: formData.get('howDidYouFindUs') as string,
    }

    // Server-side validation
    const parsed = serverSchema.safeParse(fields)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const resumeFile = formData.get('resume') as File | null

    // Upload resume to Sanity Assets if provided
    let resumeRef = null
    if (resumeFile && resumeFile.size > 0) {
      const buffer = Buffer.from(await resumeFile.arrayBuffer())
      const uploaded = await sanity.assets.upload('file', buffer, {
        filename: resumeFile.name,
        contentType: resumeFile.type,
      })
      resumeRef = { _type: 'file', asset: { _type: 'reference', _ref: uploaded._id } }
    }

    // Create Sanity document
    await sanity.create({
      _type: 'jobApplication',
      applicantName: parsed.data.fullName,
      email: parsed.data.email,
      position: parsed.data.position,
      portfolioUrl: parsed.data.portfolioUrl,
      linkedinUrl: parsed.data.linkedinUrl,
      coverLetter: parsed.data.coverLetter,
      howDidYouFindUs: parsed.data.howDidYouFindUs,
      resume: resumeRef,
      submittedAt: new Date().toISOString(),
      status: 'new',
    })

    // Send confirmation email to applicant
    // TODO: Implement with Resend or SMTP
    // await sendConfirmationEmail(parsed.data.email, parsed.data.fullName, parsed.data.position)

    // Send notification to hiring team
    // TODO: await sendHiringNotification(parsed.data, fields.position)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[job-application] Error:', error)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
```

## Implementation Plan

1. **Schema** — Create `src/lib/sanity/schemas/jobListing.ts`; register in `src/lib/sanity/schemas/index.ts`.
2. **Query** — Add `queryActiveJobListings` to `src/lib/sanity/queries.ts` with today date parameter.
3. **Validation** — Create `src/lib/validations/jobApplicationSchema.ts` with Zod schema.
4. **Form component** — Create `src/components/careers/ApplicationForm.tsx` with react-hook-form.
5. **Careers page** — Create `src/app/(user)/careers/page.tsx` with server-side listings fetch.
6. **API route** — Update `src/app/api/job-application/route.ts` to handle FormData (for file uploads), validate with Zod, create Sanity document, and stub email sending.
7. **Email integration** — Add `resend` package; implement confirmation and notification emails.
8. **Join page** — Add "Write For Us" link to `src/app/(user)/join/page.tsx`.
9. **Sitemap** — Add `/careers` to `src/app/sitemap.ts` (covered by Issue 19, but note the dependency).
10. **Studio** — Create a test job listing in Sanity Studio to verify the query and UI.

## Files Affected

- `src/lib/sanity/schemas/jobListing.ts` — new schema
- `src/lib/sanity/schemas/index.ts` — register jobListing
- `src/lib/sanity/queries.ts` — add `queryActiveJobListings`
- `src/lib/validations/jobApplicationSchema.ts` — new Zod schema
- `src/components/careers/ApplicationForm.tsx` — new form component
- `src/app/(user)/careers/page.tsx` — new page
- `src/app/api/job-application/route.ts` — update existing route for FormData
- `src/app/(user)/join/page.tsx` — add link to /careers
- `src/app/sitemap.ts` — add /careers entry
- `.env.example` — add jobs notification email env var

## Deliverables Checklist

### Sanity Schema
- [ ] `src/lib/sanity/schemas/jobListing.ts` created
- [ ] Schema has fields: `title`, `slug`, `department`, `type`, `location`, `description` (blockContent), `requirements` (string[]), `compensation`, `isActive`, `closingDate`
- [ ] `isActive` defaults to `true`
- [ ] `closingDate` is optional date field
- [ ] Schema preview shows CLOSED prefix for inactive/expired listings
- [ ] Schema registered in `src/lib/sanity/schemas/index.ts`
- [ ] Test job listing created in Sanity Studio to verify schema

### GROQ Query
- [ ] `queryActiveJobListings` added to `src/lib/sanity/queries.ts`
- [ ] Query filters `isActive == true`
- [ ] Query filters `closingDate >= $today` (or closingDate not defined)
- [ ] Query accepts `{ today }` parameter in ISO date format (`YYYY-MM-DD`)
- [ ] Query tested in Sanity Vision tool

### Form Validation
- [ ] `src/lib/validations/jobApplicationSchema.ts` created with Zod schema
- [ ] `fullName` validated: min 2, max 100
- [ ] `email` validated as email format
- [ ] `portfolioUrl` / `linkedinUrl`: URL format, optional
- [ ] `coverLetter` validated: min 100, max 3000 characters
- [ ] `resume`: max 5MB, PDF or Word file types only
- [ ] Schema exported as both type and schema object

### Application Form Component
- [ ] `src/components/careers/ApplicationForm.tsx` created as `'use client'`
- [ ] Uses `react-hook-form` with `zodResolver(jobApplicationSchema)`
- [ ] All fields render correctly with labels, inputs, and error messages
- [ ] Resume file input accepts only `.pdf,.doc,.docx`
- [ ] Submit sends `FormData` via `fetch` to `/api/job-application`
- [ ] Loading state shown on submit button during API call
- [ ] Success state renders confirmation message after successful submission
- [ ] Error state renders error message with retry ability
- [ ] `prefilledPosition` prop pre-fills the position field
- [ ] All inputs styled consistently: `border border-zinc-700 bg-zinc-900 focus:border-untele`
- [ ] Submit button: `bg-untele py-3 text-xs font-black uppercase tracking-widest text-white`

### Careers Page
- [ ] `src/app/(user)/careers/page.tsx` created as server component
- [ ] `generateMetadata` exports correct title and description
- [ ] `alternates.canonical` set to `https://untelevised.media/careers`
- [ ] Fetches active job listings from Sanity with today parameter
- [ ] Job listing cards rendered with `<details>`/`<summary>` for expand/collapse
- [ ] Each listing shows: title, department, type, location, compensation, description, requirements
- [ ] Application form embedded in each listing's expanded section
- [ ] "General Application" section always rendered below listings
- [ ] If no active listings: only "General Application" shown with appropriate copy
- [ ] Page header uses `bg-untele` label bar pattern
- [ ] Works in dark and light mode

### API Route
- [ ] `src/app/api/job-application/route.ts` updated to handle `FormData`
- [ ] Server-side Zod validation on all fields
- [ ] Returns 400 with validation issues on invalid data
- [ ] Creates `jobApplication` Sanity document with all fields
- [ ] Handles resume file upload to Sanity Assets if file provided
- [ ] `submittedAt` and `status: 'new'` set on creation
- [ ] Returns `{ success: true }` on success
- [ ] Error handling returns 500 with message
- [ ] Email confirmation stub in place (or fully implemented with Resend)

### Navigation & Discovery
- [ ] `/join` page links to `/careers` ("Want to write for us? →")
- [ ] `/careers` added to sitemap with `priority: 0.6`, `changeFrequency: 'monthly'`
- [ ] Footer or nav has "Write For Us" or "Careers" link (if applicable)

### QA
- [ ] Submit complete application with resume PDF — verify Sanity document created
- [ ] Submit application without resume — verify it works without file
- [ ] Submit with invalid email — verify form shows error, does not submit
- [ ] Submit with cover letter under 100 chars — verify validation error shown
- [ ] Verify resume file in Sanity Studio (asset uploaded correctly)
- [ ] Expand and collapse job listing cards work correctly
- [ ] `pnpm build` passes without TypeScript errors
- [ ] Page renders correctly on mobile viewport
