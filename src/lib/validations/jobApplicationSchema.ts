// src/lib/validations/jobApplicationSchema.ts
import { z } from 'zod';

export const jobApplicationSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),

  email: z.string().email('Please enter a valid email address'),

  position: z.string().min(1, 'Please enter or select a position'),

  portfolioUrl: z
    .string()
    .url('Please enter a valid URL (include https://)')
    .optional()
    .or(z.literal('')),

  linkedinUrl: z
    .string()
    .url('Please enter a valid LinkedIn URL (include https://)')
    .optional()
    .or(z.literal('')),

  coverLetter: z
    .string()
    .min(100, 'Cover letter must be at least 100 characters')
    .max(3000, 'Cover letter must be under 3000 characters'),

  howDidYouFindUs: z
    .enum(['existing-reader', 'social-media', 'word-of-mouth', 'google-search', 'other'])
    .refine((v) => v.length > 0, 'Please select how you found us'),

  // File validated client-side only — z.instanceof(File) throws on server
  resume: z
    .any()
    .optional()
    .refine(
      (f) => !f || !(f instanceof File) || f.size <= 5 * 1024 * 1024,
      'Resume must be under 5 MB'
    )
    .refine(
      (f) =>
        !f ||
        !(f instanceof File) ||
        [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ].includes(f.type),
      'Resume must be a PDF or Word document'
    ),
});

export type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;
