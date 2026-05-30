import { describe, it, expect } from 'vitest';
import type { MediaAsset, MediaProvenance } from '@buildr/types';
import { collectCreditsFromAssets, selectUnusedAssets } from './media-usage.js';

function asset(over: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id: 'id',
    userId: 'u',
    filename: 'f.webp',
    url: '/uploads/f.webp',
    mimeType: 'image/webp',
    size: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...over,
  };
}

const pixabay = (author: string, sourceUrl: string): MediaProvenance => ({
  source: 'pixabay',
  author,
  sourceUrl,
  license: 'Pixabay Content License',
  licenseUrl: 'https://pixabay.com/service/license-summary/',
});

describe('selectUnusedAssets', () => {
  it('returns only assets whose URL is absent from the usage text', () => {
    const a = asset({ id: 'a', url: '/uploads/a.webp' });
    const b = asset({ id: 'b', url: '/uploads/b.webp' });
    const usage = JSON.stringify({ blocks: [{ src: '/uploads/a.webp' }] });

    const unused = selectUnusedAssets([a, b], usage);
    expect(unused.map((x) => x.id)).toEqual(['b']);
  });

  it('treats everything as unused when nothing is referenced', () => {
    const a = asset({ id: 'a', url: '/uploads/a.webp' });
    const b = asset({ id: 'b', url: '/uploads/b.webp' });
    expect(selectUnusedAssets([a, b], '').map((x) => x.id)).toEqual(['a', 'b']);
  });

  it('treats everything as used when all are referenced', () => {
    const a = asset({ id: 'a', url: '/uploads/a.webp' });
    const usage = 'prefix /uploads/a.webp suffix';
    expect(selectUnusedAssets([a], usage)).toEqual([]);
  });
});

describe('collectCreditsFromAssets', () => {
  it('credits only stock assets that are actually used', () => {
    const used = asset({
      id: 'u',
      url: '/uploads/used.webp',
      provenance: pixabay('Theo', 'https://pixabay.com/photos/x'),
    });
    const unused = asset({
      id: 'n',
      url: '/uploads/unused.webp',
      provenance: pixabay('Other', 'https://pixabay.com/photos/y'),
    });
    const usage = '… /uploads/used.webp …';

    const credits = collectCreditsFromAssets([used, unused], usage);
    expect(credits).toHaveLength(1);
    expect(credits[0]).toMatchObject({ author: 'Theo', source: 'pixabay' });
  });

  it('ignores uploads and assets with no author', () => {
    const upload = asset({ id: '1', url: '/uploads/1.webp' }); // no provenance
    const noAuthor = asset({
      id: '2',
      url: '/uploads/2.webp',
      provenance: { source: 'unsplash' },
    });
    const usage = '/uploads/1.webp /uploads/2.webp';
    expect(collectCreditsFromAssets([upload, noAuthor], usage)).toEqual([]);
  });

  it('dedupes the same photographer + source page', () => {
    const one = asset({
      id: '1',
      url: '/uploads/1.webp',
      provenance: pixabay('Theo', 'https://pixabay.com/photos/x'),
    });
    const two = asset({
      id: '2',
      url: '/uploads/2.webp',
      provenance: pixabay('Theo', 'https://pixabay.com/photos/x'),
    });
    const usage = '/uploads/1.webp /uploads/2.webp';
    expect(collectCreditsFromAssets([one, two], usage)).toHaveLength(1);
  });

  it('keeps distinct authors separate', () => {
    const a = asset({
      id: '1',
      url: '/uploads/1.webp',
      provenance: pixabay('Theo', 'https://pixabay.com/photos/x'),
    });
    const b = asset({
      id: '2',
      url: '/uploads/2.webp',
      provenance: pixabay('Mostafa', 'https://pixabay.com/photos/y'),
    });
    const usage = '/uploads/1.webp /uploads/2.webp';
    const credits = collectCreditsFromAssets([a, b], usage);
    expect(credits.map((c) => c.author).sort()).toEqual(['Mostafa', 'Theo']);
  });
});
