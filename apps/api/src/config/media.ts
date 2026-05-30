import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { env } from './env.js';

/** Where optimized uploads are stored and served from (`/uploads/*`). */
export const UPLOADS_DIR = resolve(join(env.DATA_DIR, 'uploads'));

// Ensure the directory exists at boot so @fastify/static can mount it.
mkdirSync(UPLOADS_DIR, { recursive: true });

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_IMAGE_WIDTH = 1600;

export const ALLOWED_UPLOAD_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);
