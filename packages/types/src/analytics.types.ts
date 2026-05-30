import type { Entity } from './common.types';

export type DeviceKind = 'desktop' | 'tablet' | 'mobile';

/** Aggregated per-site analytics, keyed by site id. */
export interface AnalyticsRecord extends Entity {
  totalViews: number;
  uniqueVisitors: number;
  byPath: Record<string, number>;
  byDevice: Record<string, number>;
  byDay: Record<string, number>;
}

/** Dashboard-facing analytics summary. */
export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  topPages: { path: string; views: number }[];
  devices: { device: string; views: number }[];
  byDay: { date: string; views: number }[];
}
