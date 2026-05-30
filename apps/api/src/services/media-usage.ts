import type { ImageCredit, MediaAsset } from '@buildr/types';

/**
 * Pure helpers for reasoning about which media is used where. An image counts
 * as "used" when its stored URL appears in a usage string — the JSON of the
 * pages/snapshots to check. Matching the serialized JSON makes this robust to
 * whichever block/prop holds the image (src, background, gallery, …).
 */

/** Assets whose stored URL does NOT appear in the usage text. */
export function selectUnusedAssets(
  assets: MediaAsset[],
  usage: string,
): MediaAsset[] {
  return assets.filter((a) => a.url && !usage.includes(a.url));
}

/**
 * Stock-photo attributions for assets that ARE used. Only assets with
 * provenance + an author are credited; duplicates (same provider + author +
 * source page) collapse to one entry.
 */
export function collectCreditsFromAssets(
  assets: MediaAsset[],
  usage: string,
): ImageCredit[] {
  const credits = new Map<string, ImageCredit>();
  for (const a of assets) {
    const p = a.provenance;
    if (!p?.author || p.source === 'upload') continue;
    if (!a.url || !usage.includes(a.url)) continue;
    const key = `${p.source}:${p.author}:${p.sourceUrl ?? ''}`;
    if (credits.has(key)) continue;
    credits.set(key, {
      author: p.author,
      source: p.source,
      sourceUrl: p.sourceUrl ?? p.licenseUrl ?? '',
      license: p.license ?? '',
      licenseUrl: p.licenseUrl ?? '',
    });
  }
  return [...credits.values()];
}
