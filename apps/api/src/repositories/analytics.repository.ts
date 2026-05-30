import type { AnalyticsRecord } from '@buildr/types';
import { BaseRepository } from './base.repository.js';

/** Aggregated analytics keyed by site id. Uses `upsert` (id === siteId). */
class AnalyticsRepository extends BaseRepository<AnalyticsRecord> {
  protected fileName = 'analytics.json';

  async upsert(record: AnalyticsRecord): Promise<AnalyticsRecord> {
    const all = await this.readAll();
    const index = all.findIndex((r) => r.id === record.id);
    if (index >= 0) all[index] = record;
    else all.push(record);
    await this.writeAll(all);
    return record;
  }
}

export const analyticsRepository = new AnalyticsRepository();
