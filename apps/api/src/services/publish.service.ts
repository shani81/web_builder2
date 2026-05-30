import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { now } from '@buildr/utils';
import type {
  ImageCredit,
  LockedSite,
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
import { env } from '../config/env.js';
import { AppError } from '../utils/response.js';

const MAX_VERSIONS = 5;
const UNLOCK_TTL = '12h';

interface UnlockClaims {
  sid: string;
  purpose: 'unlock';
}

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

/** Build the public-facing shape from a record's current (newest) version. */
function toPublicSite(record: PublishedSite): PublicSite {
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
      // Preserve any visitor password across re-publishes.
      passwordHash: existing?.passwordHash,
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
      protected: Boolean(record?.passwordHash),
    };
  }

  /** Set (or clear, with null) the visitor password. Requires a published site. */
  async setPassword(
    siteId: string,
    userId: string,
    password: string | null,
  ): Promise<{ protected: boolean }> {
    await siteService.getOwned(siteId, userId);
    const record = await publishedRepository.findById(siteId);
    if (!record) {
      throw AppError.badRequest('Publish the site before adding a password.');
    }
    const passwordHash = password ? await argon2.hash(password) : undefined;
    await publishedRepository.upsert({
      ...record,
      passwordHash,
      updatedAt: now(),
    });
    return { protected: Boolean(passwordHash) };
  }

  /** Verify a visitor password and issue a short-lived unlock token, or null. */
  async unlock(subdomain: string, password: string): Promise<string | null> {
    const record = await publishedRepository.findBySubdomain(subdomain);
    if (!record?.passwordHash) return null;
    const valid = await argon2.verify(record.passwordHash, password);
    if (!valid) return null;
    const claims: UnlockClaims = { sid: record.id, purpose: 'unlock' };
    return jwt.sign(claims, env.JWT_SECRET, { expiresIn: UNLOCK_TTL });
  }

  private verifyUnlock(token: string, siteId: string): boolean {
    try {
      const claims = jwt.verify(token, env.JWT_SECRET) as UnlockClaims;
      return claims.purpose === 'unlock' && claims.sid === siteId;
    } catch {
      return false;
    }
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

  /**
   * Public read by subdomain — the current live version, or null. Ignores the
   * visitor password (used for internal reads like sitemap/submit/track).
   */
  async getPublic(subdomain: string): Promise<PublicSite | null> {
    const record = await publishedRepository.findBySubdomain(subdomain);
    if (!record || !record.live || record.versions.length === 0) return null;
    // Scheduled-but-not-yet-live sites stay hidden until their go-live time.
    if (futureSchedule(record.scheduledAt)) return null;
    return toPublicSite(record);
  }

  /**
   * Gated public read: the site, a `locked` marker when a password is required
   * and the token is missing/invalid, or null when not found/live/scheduled.
   */
  async access(
    subdomain: string,
    token?: string,
  ): Promise<PublicSite | LockedSite | null> {
    const record = await publishedRepository.findBySubdomain(subdomain);
    if (!record || !record.live || record.versions.length === 0) return null;
    if (futureSchedule(record.scheduledAt)) return null;
    if (
      record.passwordHash &&
      !(token && this.verifyUnlock(token, record.id))
    ) {
      return { locked: true, name: record.versions[0]!.name };
    }
    return toPublicSite(record);
  }
}

export const publishService = new PublishService();
