import { now } from '@buildr/utils';
import type {
  AnalyticsRecord,
  AnalyticsSummary,
  DeviceKind,
} from '@buildr/types';
import { analyticsRepository } from '../repositories/analytics.repository.js';
import { publishedRepository } from '../repositories/published.repository.js';
import { siteService } from './site.service.js';

const MAX_DAYS = 30;

function deviceFromUA(ua: string): DeviceKind {
  if (/ipad|tablet/i.test(ua)) return 'tablet';
  if (/mobi|android|iphone|ipod/i.test(ua)) return 'mobile';
  return 'desktop';
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Keep only the most recent N days in the byDay map. */
function trimDays(byDay: Record<string, number>): Record<string, number> {
  const keys = Object.keys(byDay).sort();
  if (keys.length <= MAX_DAYS) return byDay;
  const keep = keys.slice(-MAX_DAYS);
  return Object.fromEntries(keep.map((k) => [k, byDay[k]!]));
}

export class AnalyticsService {
  /** Record a published-site page view. Silently ignores unpublished sites. */
  async track(
    subdomain: string,
    path: string,
    userAgent: string,
    isNewVisitor: boolean,
  ): Promise<void> {
    const published = await publishedRepository.findBySubdomain(subdomain);
    if (!published || !published.live) return;

    const siteId = published.id;
    const timestamp = now();
    const existing = await analyticsRepository.findById(siteId);
    const base: AnalyticsRecord =
      existing ??
      ({
        id: siteId,
        totalViews: 0,
        uniqueVisitors: 0,
        byPath: {},
        byDevice: {},
        byDay: {},
        createdAt: timestamp,
        updatedAt: timestamp,
      } as AnalyticsRecord);

    const cleanPath = (path || '/').slice(0, 256);
    const device = deviceFromUA(userAgent);
    const day = today();

    await analyticsRepository.upsert({
      ...base,
      totalViews: base.totalViews + 1,
      uniqueVisitors: base.uniqueVisitors + (isNewVisitor ? 1 : 0),
      byPath: { ...base.byPath, [cleanPath]: (base.byPath[cleanPath] ?? 0) + 1 },
      byDevice: {
        ...base.byDevice,
        [device]: (base.byDevice[device] ?? 0) + 1,
      },
      byDay: trimDays({ ...base.byDay, [day]: (base.byDay[day] ?? 0) + 1 }),
      updatedAt: timestamp,
    });
  }

  /** Owner-facing summary for a site. */
  async getSummary(siteId: string, userId: string): Promise<AnalyticsSummary> {
    await siteService.getOwned(siteId, userId);
    const record = await analyticsRepository.findById(siteId);

    if (!record) {
      return {
        totalViews: 0,
        uniqueVisitors: 0,
        topPages: [],
        devices: [],
        byDay: [],
      };
    }

    const topPages = Object.entries(record.byPath)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    const devices = Object.entries(record.byDevice)
      .map(([device, views]) => ({ device, views }))
      .sort((a, b) => b.views - a.views);

    // Last 14 days, oldest → newest, filling gaps with 0.
    const byDay: { date: string; views: number }[] = [];
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      byDay.push({ date: key, views: record.byDay[key] ?? 0 });
    }

    return {
      totalViews: record.totalViews,
      uniqueVisitors: record.uniqueVisitors,
      topPages,
      devices,
      byDay,
    };
  }
}

export const analyticsService = new AnalyticsService();
