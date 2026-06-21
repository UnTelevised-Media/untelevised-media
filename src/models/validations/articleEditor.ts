import { z } from 'zod';

export const articleEditorFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug: lowercase letters, numbers, hyphens only'),
  description: z.string().max(1000).optional(),
  leadParagraph: z.string().max(1000).optional(),
  featured: z.boolean().default(false),
  breakingNews: z.boolean().default(false),
  location: z.string().max(200).optional(),
  allowComments: z.boolean().default(true),
  publishedAt: z.string().optional(),
  tags: z.string().optional(),
  keywords: z.string().optional(),
  authorRef: z.string().optional(),
  hasEmbeddedVideo: z.boolean().default(false),
  videoLink: z
    .union([
      z.string().url('Video link must be a full URL (https://…)'),
      z.literal(''),
      z.undefined(),
    ])
    .optional(),
  eventDate: z.string().optional(),
  methodology: z.string().max(2000).optional(),
});

export type ArticleEditorFormValues = z.infer<typeof articleEditorFormSchema>;
