import { z } from 'zod';

export const blockTypeSchema = z.enum([
  'section',
  'column',
  'hero',
  'navbar',
  'features',
  'pricing',
  'testimonials',
  'cta',
  'gallery',
  'contact',
  'footer',
  'text',
  'heading',
  'button',
  'image',
  'video',
  'embed',
  'spacer',
  'divider',
  'countdown',
  'form',
  'map',
  'social',
  'code',
  'faq',
  'stats',
  'team',
  'newsletter',
  'logos',
  'ai-generated',
]);

export const siteStatusSchema = z.enum(['draft', 'published', 'archived']);
export const devicePreviewSchema = z.enum(['desktop', 'tablet', 'mobile']);

/** Hex color (#rgb or #rrggbb). */
const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a hex color');

export const siteThemeSchema = z.object({
  primaryColor: hexColor,
  secondaryColor: hexColor,
  accentColor: hexColor,
  backgroundColor: hexColor,
  textColor: hexColor,
  fontHeading: z.string().min(1),
  fontBody: z.string().min(1),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
  spacing: z.enum(['compact', 'normal', 'relaxed']),
});

// Block is recursive (children), so the type is annotated explicitly.
export const blockSchema: z.ZodType<BlockShape> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: blockTypeSchema,
    props: z.record(z.unknown()),
    styles: z.record(z.union([z.string(), z.number()])),
    children: z.array(blockSchema).optional(),
    locked: z.boolean(),
    visible: z.boolean(),
    responsive: z.object({
      desktop: z.record(z.unknown()),
      tablet: z.record(z.unknown()),
      mobile: z.record(z.unknown()),
    }),
  }),
);

interface BlockShape {
  id: string;
  type: z.infer<typeof blockTypeSchema>;
  props: Record<string, unknown>;
  styles: Record<string, string | number>;
  children?: BlockShape[];
  locked: boolean;
  visible: boolean;
  responsive: {
    desktop: Record<string, unknown>;
    tablet: Record<string, unknown>;
    mobile: Record<string, unknown>;
  };
}

export const pageSeoSchema = z.object({
  metaTitle: z.string().max(70).default(''),
  metaDescription: z.string().max(160).default(''),
  ogImage: z.string().url().optional(),
  canonicalUrl: z.string().url().optional(),
  noIndex: z.boolean().default(false),
});

const subdomain = z
  .string()
  .min(3, 'Subdomain must be at least 3 characters')
  .max(63, 'Subdomain is too long')
  .regex(
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
    'Use lowercase letters, numbers, and hyphens only',
  );

export const createSiteSchema = z.object({
  name: z.string().min(1, 'Site name is required').max(80),
  subdomain,
  templateId: z.string().optional(),
});

export const updateSiteSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  customDomain: z.string().optional(),
  status: siteStatusSchema.optional(),
  theme: siteThemeSchema.partial().optional(),
});

export const reorderBlocksSchema = z.object({
  blockIds: z.array(z.string()).min(1),
});

export const savePageSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  blocks: z.array(blockSchema),
  seo: pageSeoSchema.partial().optional(),
});

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
export type ReorderBlocksInput = z.infer<typeof reorderBlocksSchema>;
export type SavePageInput = z.infer<typeof savePageSchema>;
