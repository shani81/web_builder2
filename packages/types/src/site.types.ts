import type { Entity, ISODateString } from './common.types';

export type SiteStatus = 'draft' | 'published' | 'archived';
export type DevicePreview = 'desktop' | 'tablet' | 'mobile';

export type BlockType =
  | 'section'
  | 'column'
  | 'hero'
  | 'navbar'
  | 'features'
  | 'feature-item'
  | 'pricing'
  | 'testimonials'
  | 'cta'
  | 'gallery'
  | 'contact'
  | 'footer'
  | 'text'
  | 'heading'
  | 'button'
  | 'image'
  | 'video'
  | 'embed'
  | 'spacer'
  | 'divider'
  | 'countdown'
  | 'form'
  | 'map'
  | 'social'
  | 'code'
  | 'faq'
  | 'stats'
  | 'team'
  | 'newsletter'
  | 'logos'
  | 'ai-generated';

export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type SpacingScale = 'compact' | 'normal' | 'relaxed';

export interface SiteTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  borderRadius: BorderRadius;
  spacing: SpacingScale;
}

export interface BlockProps {
  [key: string]: unknown;
}

export interface Block {
  id: string;
  type: BlockType;
  props: BlockProps;
  styles: Record<string, string | number>;
  children?: Block[];
  locked: boolean;
  visible: boolean;
  responsive: {
    desktop: Partial<BlockProps>;
    tablet: Partial<BlockProps>;
    mobile: Partial<BlockProps>;
  };
}

export interface PageSEO {
  metaTitle: string;
  metaDescription: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex: boolean;
}

export interface Page {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  blocks: Block[];
  seo: PageSEO;
  isHome: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface SiteSettings {
  language: string;
  favicon?: string;
  passwordProtected: boolean;
  password?: string;
  customHead?: string;
  customCss?: string;
  socialLinks: Record<string, string>;
}

export interface SiteAnalytics {
  totalVisits: number;
  uniqueVisitors: number;
  lastVisitAt?: ISODateString;
}

export interface Site extends Entity {
  userId: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  status: SiteStatus;
  theme: SiteTheme;
  pages: Page[];
  settings: SiteSettings;
  analytics: SiteAnalytics;
  publishedAt?: ISODateString;
}

/** Lightweight projection used in dashboard listings. */
export interface SiteSummary {
  id: string;
  name: string;
  subdomain: string;
  status: SiteStatus;
  pageCount: number;
  updatedAt: ISODateString;
  publishedAt?: ISODateString;
}
