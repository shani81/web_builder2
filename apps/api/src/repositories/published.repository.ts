import type { PublishedSite } from '@buildr/types';
import { BaseRepository } from './base.repository.js';

/**
 * Published snapshots, keyed by site id. Uses `upsert` (not the base `create`)
 * because the record id must equal the site id, and the service manages
 * versions/timestamps explicitly.
 */
class PublishedRepository extends BaseRepository<PublishedSite> {
  protected fileName = 'published.json';

  async findBySubdomain(subdomain: string): Promise<PublishedSite | null> {
    const lower = subdomain.toLowerCase();
    const all = await this.findMany();
    return all.find((r) => r.subdomain === lower) ?? null;
  }

  async upsert(record: PublishedSite): Promise<PublishedSite> {
    const all = await this.readAll();
    const index = all.findIndex((r) => r.id === record.id);
    if (index >= 0) all[index] = record;
    else all.push(record);
    await this.writeAll(all);
    return record;
  }
}

export const publishedRepository = new PublishedRepository();
