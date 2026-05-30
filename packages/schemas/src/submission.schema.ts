import { z } from 'zod';

export const submitFormSchema = z.object({
  formType: z.enum(['contact', 'newsletter']),
  data: z.record(z.string().max(5000)).default({}),
  /** Honeypot — must stay empty; bots tend to fill it. */
  website: z.string().optional(),
});

export type SubmitFormInput = z.infer<typeof submitFormSchema>;
