import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { now, uuid } from '@buildr/utils';
import { env } from '../config/env.js';

/**
 * JSON-file-backed repository. This is the ONLY layer that knows how data is
 * stored. To move to Postgres/Mongo later, reimplement this class against the
 * driver — services and routes never change.
 *
 * Writes are atomic (write to a temp file, then rename) and serialized per
 * instance via a promise chain so concurrent calls cannot corrupt the file.
 */
export abstract class BaseRepository<
  T extends { id: string; createdAt: string; updatedAt: string },
> {
  /** File name within DATA_DIR, e.g. "sites.json". */
  protected abstract fileName: string;

  private writeLock: Promise<void> = Promise.resolve();

  private get filePath(): string {
    return join(env.DATA_DIR, this.fileName);
  }

  protected async readAll(): Promise<T[]> {
    try {
      const raw = await readFile(this.filePath, 'utf-8');
      // Defensive BOM strip — some editors/tools prepend a UTF-8 BOM (U+FEFF).
      const withoutBom =
        raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
      const clean = withoutBom.trim();
      return clean ? (JSON.parse(clean) as T[]) : [];
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw err;
    }
  }

  protected async writeAll(items: T[]): Promise<void> {
    // Serialize writes so overlapping requests don't clobber each other.
    const run = async () => {
      await mkdir(dirname(this.filePath), { recursive: true });
      const tmp = `${this.filePath}.${uuid()}.tmp`;
      await writeFile(tmp, JSON.stringify(items, null, 2), 'utf-8');
      await rename(tmp, this.filePath);
    };
    this.writeLock = this.writeLock.then(run, run);
    return this.writeLock;
  }

  async findById(id: string): Promise<T | null> {
    const items = await this.readAll();
    return items.find((item) => item.id === id) ?? null;
  }

  async findMany(filter?: Partial<T>): Promise<T[]> {
    const items = await this.readAll();
    if (!filter) return items;
    const entries = Object.entries(filter) as [keyof T, unknown][];
    return items.filter((item) =>
      entries.every(([key, value]) => item[key] === value),
    );
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const items = await this.readAll();
    const timestamp = now();
    const entity = {
      ...(data as object),
      id: uuid(),
      createdAt: timestamp,
      updatedAt: timestamp,
    } as T;
    items.push(entity);
    await this.writeAll(items);
    return entity;
  }

  async update(
    id: string,
    data: Partial<Omit<T, 'id' | 'createdAt'>>,
  ): Promise<T | null> {
    const items = await this.readAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const updated = {
      ...items[index]!,
      ...data,
      id,
      updatedAt: now(),
    } as T;
    items[index] = updated;
    await this.writeAll(items);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const items = await this.readAll();
    const next = items.filter((item) => item.id !== id);
    if (next.length === items.length) return false;
    await this.writeAll(next);
    return true;
  }
}
