import type { Entity } from './common.types';
import type { Page, SiteTheme } from './site.types';

export type TemplateCategory =
  | 'business'
  | 'portfolio'
  | 'restaurant'
  | 'ecommerce'
  | 'blog'
  | 'agency'
  | 'saas'
  | 'event'
  | 'medical'
  | 'education';

export interface Template extends Entity {
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  thumbnailUrl: string;
  previewUrl?: string;
  theme: SiteTheme;
  pages: Page[];
  isPremium: boolean;
  /** Number of times this template has been used to create a site. */
  usageCount: number;
}

export interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  thumbnailUrl: string;
  isPremium: boolean;
}
