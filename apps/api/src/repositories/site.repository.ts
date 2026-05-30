import type { Site } from '@buildr/types';
import { BaseRepository } from './base.repository.js';

class SiteRepository extends BaseRepository<Site> {
  protected fileName = 'sites.json';

  findByUser(userId: string): Promise<Site[]> {
    return this.findMany({ userId } as Partial<Site>);
  }

  async findBySubdomain(subdomain: string): Promise<Site | null> {
    const sites = await this.findMany();
    const lower = subdomain.toLowerCase();
    return sites.find((site) => site.subdomain === lower) ?? null;
  }
}

export const siteRepository = new SiteRepository();
