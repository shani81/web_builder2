import { unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { UPLOADS_DIR } from './media.js';

/**
 * Storage abstraction so media can move from local disk to S3/CDN later by
 * swapping the implementation only — nothing else in the codebase changes.
 */
export interface StorageAdapter {
  /** Store bytes under `key`; returns the public URL to serve them. */
  put(key: string, data: Buffer, contentType: string): Promise<string>;
  delete(key: string): Promise<void>;
}

class LocalStorage implements StorageAdapter {
  async put(key: string, data: Buffer): Promise<string> {
    await writeFile(join(UPLOADS_DIR, key), data);
    // Relative, origin-independent URL. The web app proxies /uploads/* to the
    // API, so media loads from whatever origin the page is served on.
    return `/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    await unlink(join(UPLOADS_DIR, key)).catch(() => {
      // Already gone — the record removal is what matters.
    });
  }
}

// v1 uses local disk. A future S3Storage can be selected here via an env flag.
export const storage: StorageAdapter = new LocalStorage();
