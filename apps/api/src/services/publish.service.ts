import { now } from '@buildr/utils';
import type {
  ImageCredit,
  Page,
  PublicSite,
  PublishedSite,
  PublishedSnapshot,
  PublishedVersionMeta,
  PublishStatus,
  Site,
} from '@buildr/types';
import { siteRepository } from '../repositories/site.repository.js';
import { publishedRepository } from '../repositories/published.repository.js';
import { mediaRepository } from '../repositories/media.repository.js';
import { siteService } from './site.service.js';
import { collectCreditsFromAssets } from './media-usage.js';
import { AppError } from '../utils/response.js';

const MAX_VERSIONS = 5;

/**
 * Collect stock-photo attributions for every imported image used anywhere in
 * the pages (matched by the asset URL appearing in the page JSON).
 */
async function collectCredits(
  userId: string,
  pages: Page[],
): Promise<ImageCredit[]> {
  const assets = await mediaRepository.findByUser(userId);
  return collectCreditsFromAssets(assets, JSON.stringify(pages));
}

function meta(record: PublishedSite | null): PublishedVersionMeta[] {
  return (record?.versions ?? []).map((v) => ({
    version: v.version,
    publishedAt: v.publishedAt,
  }));
}

/** A scheduled time still in the future, or undefined. Past times are ignored. */
function futureSchedule(scheduledAt?: string | null): string | undefined {
  if (!scheduledAt) return undefined;
  const t = new Date(scheduledAt).getTime();
  return Number.isFinite(t) && t > Date.now() ? scheduledAt : undefined;
}

export class PublishService {
  /**
   * Snapshot the site's current content as a new version. With `scheduledAt`
   * in the future the version is stored but stays hidden publicly until then;
   * otherwise it goes live immediately (clearing any prior schedule).
   */
  async publish(
    siteId: string,
    userId: string,
    scheduledAt?: string,
  ): Promise<Site> {
    const site = await siteService.getOwned(siteId, userId);
    const timestamp = now();
    const existing = await publishedRepository.findById(siteId);
    const nextVersion = (existing?.versions[0]?.version ?? 0) + 1;
    const schedule = futureSchedule(scheduledAt);

    const pages = structuredClone(site.pages);
    const snapshot: PublishedSnapshot = {
      version: nextVersion,
      publishedAt: timestamp,
      name: site.name,
      theme: site.theme,
      pages,
      credits: await collectCredits(userId, pages),
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
      scheduledAt: schedule,
      versions,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    });

    // The site is "published"; the scheduled gate lives on the published record.
    const updated = await siteRepository.update(siteId, {
      status: 'published',
      publishedAt: timestamp,
    });
    return updated ?? site;
  }

  async status(siteId: string, userId: string): Promise<PublishStatus> {
    await siteService.getOwned(siteId, userId);
    const record = await publishedRepository.findById(siteId);
    return {
      versions: meta(record),
      scheduledAt: futureSchedule(record?.scheduledAt) ?? null,
    };
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

    // Restoring goes live immediately — drop any pending schedule.
    const updated = {
      ...record,
      live: true,
      scheduledAt: undefined,
      versions,
      updatedAt: now(),
    };
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
    // Scheduled-but-not-yet-live sites stay hidden until their go-live time.
    if (futureSchedule(record.scheduledAt)) return null;
    const current = record.versions[0]!;
    return {
      id: record.id,
      name: current.name,
      subdomain: record.subdomain,
      theme: current.theme,
      pages: current.pages,
      credits: current.credits ?? [],
    };
  }
}

export const publishService = new PublishService();
