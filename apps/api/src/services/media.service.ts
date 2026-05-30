import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { shortId } from '@buildr/utils';
import type { MediaAsset, MediaProvenance } from '@buildr/types';
import { mediaRepository } from '../repositories/media.repository.js';
import { siteRepository } from '../repositories/site.repository.js';
import { publishedRepository } from '../repositories/published.repository.js';
import { MAX_IMAGE_WIDTH } from '../config/media.js';
import { storage } from '../config/storage.js';
import { aiService, resolveUserApiKey } from './ai.service.js';
import { AppError } from '../utils/response.js';

interface ProcessedImage {
  data: Buffer;
  width?: number;
  height?: number;
}

/** Auto-orient, downscale, and convert to WebP. */
async function optimize(buffer: Buffer): Promise<ProcessedImage> {
  try {
    const result = await sharp(buffer)
      .rotate()
      .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    return {
      data: result.data,
      width: result.info.width,
      height: result.info.height,
    };
  } catch {
    throw AppError.badRequest('Could not process that image.');
  }
}

/** Best-effort Claude vision alt text; returns '' on any failure or no key. */
async function describe(userId: string, data: Buffer): Promise<string> {
  const apiKey = await resolveUserApiKey(userId);
  if (!apiKey) return '';
  try {
    return await aiService.generateAltText(
      apiKey,
      data.toString('base64'),
      'image/webp',
    );
  } catch {
    return '';
  }
}

export class MediaService {
  /** Optimize an uploaded image, store it, and record it (best-effort alt text). */
  async upload(userId: string, buffer: Buffer): Promise<MediaAsset> {
    const { data, width, height } = await optimize(buffer);

    // Re-uploading an identical image reuses the stored copy.
    const contentHash = createHash('sha256').update(data).digest('hex');
    const dupe = (await mediaRepository.findByUser(userId)).find(
      (m) => m.contentHash === contentHash,
    );
    if (dupe) return dupe;

    const filename = `${shortId('img')}.webp`;
    const url = await storage.put(filename, data, 'image/webp');
    const alt = await describe(userId, data);

    return mediaRepository.create({
      userId,
      filename,
      url,
      mimeType: 'image/webp',
      size: data.length,
      width,
      height,
      alt,
      contentHash,
    });
  }

  /**
   * Import an externally-sourced image (e.g. a downloaded stock photo).
   * Dedupes by content hash and upgrades the alt text with vision when possible,
   * falling back to the provider-supplied `alt` (e.g. tags).
   */
  async importExternal(
    userId: string,
    buffer: Buffer,
    alt: string,
    provenance: MediaProvenance,
  ): Promise<MediaAsset> {
    const { data, width, height } = await optimize(buffer);

    const contentHash = createHash('sha256').update(data).digest('hex');
    const dupe = (await mediaRepository.findByUser(userId)).find(
      (m) => m.contentHash === contentHash,
    );
    if (dupe) return dupe;

    const filename = `${shortId('img')}.webp`;
    const url = await storage.put(filename, data, 'image/webp');
    const described = await describe(userId, data);

    return mediaRepository.create({
      userId,
      filename,
      url,
      mimeType: 'image/webp',
      size: data.length,
      width,
      height,
      alt: described || alt,
      contentHash,
      provenance,
    });
  }

  async list(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: MediaAsset[]; total: number }> {
    const all = (await mediaRepository.findByUser(userId)).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    const start = (page - 1) * limit;
    return { items: all.slice(start, start + limit), total: all.length };
  }

  async remove(id: string, userId: string): Promise<void> {
    const asset = await mediaRepository.findById(id);
    if (!asset || asset.userId !== userId) throw AppError.notFound('media');
    await storage.delete(asset.filename);
    await mediaRepository.delete(id);
  }

  /**
   * Text of every place an image URL could appear for this user: all draft
   * pages plus every published snapshot. An asset is "in use" if its stored
   * URL appears here — robust to whichever block/prop holds the image.
   */
  private async usageHaystack(userId: string): Promise<string> {
    const [sites, published] = await Promise.all([
      siteRepository.findByUser(userId),
      publishedRepository.findMany({ userId }),
    ]);
    const draft = sites.map((s) => JSON.stringify(s.pages)).join('');
    const live = published
      .map((p) => p.versions.map((v) => JSON.stringify(v.pages)).join(''))
      .join('');
    return draft + live;
  }

  /** Assets not referenced by any draft or published page. */
  async findUnused(userId: string): Promise<MediaAsset[]> {
    const [assets, haystack] = await Promise.all([
      mediaRepository.findByUser(userId),
      this.usageHaystack(userId),
    ]);
    return assets.filter((a) => a.url && !haystack.includes(a.url));
  }

  /** Delete every unused asset (file + record). Returns how many were removed. */
  async cleanup(userId: string): Promise<{ deleted: number }> {
    const unused = await this.findUnused(userId);
    for (const asset of unused) {
      await storage.delete(asset.filename);
      await mediaRepository.delete(asset.id);
    }
    return { deleted: unused.length };
  }
}

export const mediaService = new MediaService();
