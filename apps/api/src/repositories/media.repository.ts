import type { MediaAsset } from '@buildr/types';
import { BaseRepository } from './base.repository.js';

class MediaRepository extends BaseRepository<MediaAsset> {
  protected fileName = 'media.json';

  findByUser(userId: string): Promise<MediaAsset[]> {
    return this.findMany({ userId } as Partial<MediaAsset>);
  }
}

export const mediaRepository = new MediaRepository();
