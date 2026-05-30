import { now } from '@buildr/utils';
import type {
  PublicSite,
  PublishedSite,
  PublishedSnapshot,
  PublishedVersionMeta,
  Site,
} from '@buildr/types';
import { siteRepository } from '../repositories/site.repository.js';
import { publishedRepository } from '../repositories/published.repository.js';
import { siteService } from './site.service.js';
import { AppError } from '../utils/response.js';

const MAX_VERSIONS = 5;

function meta(record: PublishedSite | null): PublishedVersionMeta[] {
  return (record?.versions ?? []).map((v) => ({
    version: v.version,
    publishedAt: v.publishedAt,
  }));
}

export class PublishService {
  /** Snapshot the site's current content as a new live version. */
  async publish(siteId: string, userId: string): Promise<Site> {
    const site = await siteService.getOwned(siteId, userId);
    const timestamp = now();
    const existing = await publishedRepository.findById(siteId);
    const nextVersion = (existing?.versions[0]?.version ?? 0) + 1;

    const snapshot: PublishedSnapshot = {
      version: nextVersion,
      publishedAt: timestamp,
      name: site.name,
      theme: site.theme,
      pages: structuredClone(site.pages),
    };

    const versions = [snapshot, ...(existing?.versions ?? [])].slice(
      0,
      MAX_VERSIONS,
    );

    await publishedRepository.upsert({
      id: siteId,
      userId,
      subdomain: site.subdomain,
      live: true,
      versions,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    });

    const updated = await siteRepository.update(siteId, {
      status: 'published',
      publishedAt: timestamp,
    });
    return updated ?? site;
  }

  async listVersions(
    siteId: string,
    userId: string,
  ): Promise<PublishedVersionMeta[]> {
    await siteService.getOwned(siteId, userId);
    return meta(await publishedRepository.findById(siteId));
  }

  /** Re-publish a prior snapshot as a new live version. */
  async rollback(
    siteId: string,
    userId: string,
    version: number,
  ): Promise<PublishedVersionMeta[]> {
    await siteService.getOwned(siteId, userId);
    const record = await publishedRepository.findById(siteId);
    if (!record) throw AppError.notFound('published site');
    const target = record.versions.find((v) => v.version === version);
    if (!target) throw AppError.notFound('version');

    const nextVersion = (record.versions[0]?.version ?? 0) + 1;
    const restored: PublishedSnapshot = {
      ...structuredClone(target),
      version: nextVersion,
      publishedAt: now(),
    };
    const versions = [restored, ...record.versions].slice(0, MAX_VERSIONS);

    const updated = { ...record, live: true, versions, updatedAt: now() };
    await publishedRepository.upsert(updated);
    return meta(updated);
  }

  /** Toggle live state (used when a site is unpublished via status change). */
  async setLive(siteId: string, live: boolean): Promise<void> {
    const record = await publishedRepository.findById(siteId);
    if (record && record.live !== live) {
      await publishedRepository.upsert({ ...record, live, updatedAt: now() });
    }
  }

  /** Public read by subdomain — the current live version, or null. */
  async getPublic(subdomain: string): Promise<PublicSite | null> {
    const record = await publishedRepository.findBySubdomain(subdomain);
    if (!record || !record.live || record.versions.length === 0) return null;
    const current = record.versions[0]!;
    return {
      id: record.id,
      name: current.name,
      subdomain: record.subdomain,
      theme: current.theme,
      pages: current.pages,
    };
  }
}

export const publishService = new PublishService();
