import { z } from 'zod';

export const generateSiteSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Describe your site in at least 10 characters')
    .max(2000),
  language: z.string().length(2).optional(),
  category: z.string().optional(),
});

export const improveContentSchema = z.object({
  content: z.string().min(1).max(10000),
  instruction: z.string().min(1).max(500),
});

export const analyzeSeoSchema = z.object({
  pageId: z.string(),
  siteId: z.string(),
});

export const generateAltTextSchema = z.object({
  imageDescription: z.string().min(1).max(1000),
});

export const chatSchema = z.object({
  message: z.string().min(1).max(4000),
  context: z.object({
    siteId: z.string(),
    pageId: z.string(),
  }),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .max(50)
    .optional(),
});

export type GenerateSiteInput = z.infer<typeof generateSiteSchema>;
export type ImproveContentInput = z.infer<typeof improveContentSchema>;
export type AnalyzeSeoInput = z.infer<typeof analyzeSeoSchema>;
export type GenerateAltTextInput = z.infer<typeof generateAltTextSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
