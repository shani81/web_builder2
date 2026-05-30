import { now, uuid } from '@buildr/utils';
import type {
  Page,
  SiteAnalytics,
  SiteSettings,
  SiteTheme,
} from '@buildr/types';

/** Theme applied to every newly created site until the user customizes it. */
export const DEFAULT_THEME: SiteTheme = {
  primaryColor: '#4F6EF7',
  secondaryColor: '#0F0F12',
  accentColor: '#22C55E',
  backgroundColor: '#FFFFFF',
  textColor: '#0F0F12',
  fontHeading: 'Inter',
  fontBody: 'Inter',
  borderRadius: 'md',
  spacing: 'normal',
};

export function createDefaultSettings(): SiteSettings {
  return {
    language: 'en',
    passwordProtected: false,
    socialLinks: {},
  };
}

export function createDefaultAnalytics(): SiteAnalytics {
  return { totalVisits: 0, uniqueVisitors: 0 };
}

/** A blank home page. The editor (Phase 3) fills it with blocks. */
export function createHomePage(siteId: string): Page {
  const timestamp = now();
  return {
    id: uuid(),
    siteId,
    title: 'Home',
    slug: 'home',
    blocks: [],
    seo: { metaTitle: '', metaDescription: '', noIndex: false },
    isHome: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
