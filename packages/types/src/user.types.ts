import type { Entity } from './common.types';

export type PlanTier = 'free' | 'pro' | 'business' | 'enterprise';
export type UserRole = 'user' | 'admin';

export interface User extends Entity {
  email: string;
  name: string;
  avatarUrl?: string;
  timezone: string;
  plan: PlanTier;
  role: UserRole;
  emailVerified: boolean;
}

/** User shape safe to expose to the client (never includes secrets). */
export type PublicUser = Omit<User, never>;

/** Internal record persisted in the store — carries auth secrets. */
export interface UserRecord extends User {
  passwordHash: string;
  /** User's own Anthropic API key, encrypted at rest. Never sent to clients. */
  anthropicApiKey?: string;
  /** Preferred model id for generation/chat; falls back to the default. */
  aiModel?: string;
  /** Pixabay API key for stock photos, encrypted at rest. Never sent to clients. */
  pixabayApiKey?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SessionPayload {
  sub: string;
  email: string;
  role: UserRole;
  plan: PlanTier;
}
