import { z } from 'zod';

/**
 * Server environment validation. Fails fast on boot if anything required
 * is missing or malformed, so misconfiguration never reaches a request.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4001),
  // Bind dual-stack so `localhost` (which resolves to IPv6 ::1 first on
  // Windows/macOS) reaches the API directly over either address family.
  HOST: z.string().default('::'),

  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .default('dev-only-insecure-jwt-secret-change-me-32+'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters')
    .default('dev-only-insecure-refresh-secret-change-me-32+'),

  ANTHROPIC_API_KEY: z.string().optional(),
  UNSPLASH_ACCESS_KEY: z.string().optional(),
  // Platform-wide Pixabay key (server-only). Without it, stock photos are off.
  PIXABAY_API_KEY: z.string().optional(),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  DATA_DIR: z.string().default('./data'),

  // Public base URL of this API, used to build absolute media URLs.
  PUBLIC_URL: z.string().url().default('http://localhost:4001'),

  // Public base URL of the web app, used for sitemap / canonical URLs.
  SITE_URL: z.string().url().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    '❌ Invalid environment configuration:',
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
