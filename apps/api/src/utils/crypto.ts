import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { env } from '../config/env.js';

/**
 * Symmetric encryption for secrets at rest (e.g. per-user API keys), so the
 * JSON store never holds them in plaintext.
 *
 * The key is a random 256-bit value persisted to `<DATA_DIR>/.enc.key`,
 * generated once on first use. This keeps it STABLE across restarts and
 * independent of JWT_SECRET — deriving it from JWT_SECRET previously meant a
 * changed/unset secret in dev silently broke decryption of stored keys.
 */
function loadKey(): Buffer {
  const keyPath = resolve(join(env.DATA_DIR, '.enc.key'));
  try {
    const key = Buffer.from(readFileSync(keyPath, 'utf8').trim(), 'hex');
    if (key.length === 32) return key;
  } catch {
    // Not created yet — fall through and generate.
  }
  const key = randomBytes(32);
  mkdirSync(resolve(env.DATA_DIR), { recursive: true });
  writeFileSync(keyPath, key.toString('hex'), { mode: 0o600 });
  return key;
}

const KEY = loadKey();

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString('base64'),
    tag.toString('base64'),
    enc.toString('base64'),
  ].join('.');
}

export function decryptSecret(payload: string): string | null {
  try {
    const [ivB, tagB, dataB] = payload.split('.');
    if (!ivB || !tagB || !dataB) return null;
    const decipher = createDecipheriv('aes-256-gcm', KEY, Buffer.from(ivB, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB, 'base64'));
    return Buffer.concat([
      decipher.update(Buffer.from(dataB, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    return null;
  }
}
