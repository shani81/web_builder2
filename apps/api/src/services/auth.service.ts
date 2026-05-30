import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import type {
  AuthTokens,
  PublicUser,
  SessionPayload,
  UserRecord,
} from '@buildr/types';
import type { UpdateProfileInput } from '@buildr/schemas';
import type { RegisterInput } from '@buildr/schemas';
import { env } from '../config/env.js';
import {
  ACCESS_TOKEN_MAX_AGE,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
} from '../config/auth.js';
import { AppError } from '../utils/response.js';
import { decryptSecret, encryptSecret } from '../utils/crypto.js';
import { userRepository } from '../repositories/user.repository.js';

interface RefreshClaims {
  sub: string;
  /** "remember me" flag, carried so refresh can reissue with the same policy. */
  rmb: boolean;
}

/**
 * All authentication business logic. Routes stay thin; they only translate
 * HTTP <-> these methods and manage cookies.
 */
export class AuthService {
  async register(input: RegisterInput): Promise<PublicUser> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict('An account with this email already exists', {
        field: 'email',
      });
    }

    const passwordHash = await argon2.hash(input.password);
    const record = await userRepository.create({
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash,
      timezone: 'UTC',
      plan: 'free',
      role: 'user',
      emailVerified: false,
    });

    return this.toPublicUser(record);
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserRecord> {
    const record = await userRepository.findByEmail(email);
    // Verify even when the user is missing? We short-circuit but keep the
    // generic message so we don't leak which emails are registered.
    if (!record) throw AppError.unauthorized('Invalid email or password');

    const valid = await argon2.verify(record.passwordHash, password);
    if (!valid) throw AppError.unauthorized('Invalid email or password');

    return record;
  }

  issueTokens(user: UserRecord, rememberMe: boolean): AuthTokens {
    const payload: SessionPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
    };
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL,
    });
    const refreshClaims: RefreshClaims = { sub: user.id, rmb: rememberMe };
    const refreshToken = jwt.sign(refreshClaims, env.JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_TTL,
    });
    return { accessToken, refreshToken, expiresIn: ACCESS_TOKEN_MAX_AGE };
  }

  verifyAccess(token: string): SessionPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as SessionPayload;
    } catch {
      throw AppError.unauthorized('Invalid or expired session');
    }
  }

  verifyRefresh(token: string): RefreshClaims {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshClaims;
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }
  }

  async getUserById(id: string): Promise<UserRecord> {
    const record = await userRepository.findById(id);
    if (!record) throw AppError.unauthorized('Account no longer exists');
    return record;
  }

  async updateProfile(
    id: string,
    input: UpdateProfileInput,
  ): Promise<PublicUser> {
    const record = await userRepository.update(id, input);
    if (!record) throw AppError.unauthorized('Account no longer exists');
    return this.toPublicUser(record);
  }

  /** Set (or clear, with null) the form-submission notification email. */
  async setNotifyEmail(id: string, email: string | null): Promise<PublicUser> {
    const record = await userRepository.update(id, {
      notifyEmail: email ?? undefined,
    });
    if (!record) throw AppError.unauthorized('Account no longer exists');
    return this.toPublicUser(record);
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const record = await this.getUserById(id);
    const valid = await argon2.verify(record.passwordHash, currentPassword);
    if (!valid) throw AppError.unauthorized('Current password is incorrect');
    const passwordHash = await argon2.hash(newPassword);
    await userRepository.update(id, { passwordHash });
  }

  async deleteAccount(id: string): Promise<void> {
    await userRepository.delete(id);
  }

  async setAiKey(id: string, apiKey: string): Promise<void> {
    await userRepository.update(id, { anthropicApiKey: encryptSecret(apiKey) });
  }

  async removeAiKey(id: string): Promise<void> {
    await userRepository.update(id, { anthropicApiKey: undefined });
  }

  async hasAiKey(id: string): Promise<boolean> {
    const record = await this.getUserById(id);
    // "Has a key" means a key that actually decrypts — so the Settings badge
    // matches whether AI really works (a stale/undecryptable key reads false).
    return record.anthropicApiKey
      ? decryptSecret(record.anthropicApiKey) !== null
      : false;
  }

  async setStockKey(id: string, apiKey: string): Promise<void> {
    await userRepository.update(id, { pixabayApiKey: encryptSecret(apiKey) });
  }

  async removeStockKey(id: string): Promise<void> {
    await userRepository.update(id, { pixabayApiKey: undefined });
  }

  async hasStockKey(id: string): Promise<boolean> {
    const record = await this.getUserById(id);
    return record.pixabayApiKey
      ? decryptSecret(record.pixabayApiKey) !== null
      : false;
  }

  /** Decrypted Pixabay key, or null if the user has none set. */
  async getStockKey(id: string): Promise<string | null> {
    const record = await this.getUserById(id);
    return record.pixabayApiKey ? decryptSecret(record.pixabayApiKey) : null;
  }

  async getAiModel(id: string): Promise<string | undefined> {
    return (await this.getUserById(id)).aiModel;
  }

  async setAiModel(id: string, model: string): Promise<void> {
    await userRepository.update(id, { aiModel: model });
  }

  toPublicUser(record: UserRecord): PublicUser {
    // Strip every secret before the record leaves the server.
    const {
      passwordHash: _passwordHash,
      anthropicApiKey: _anthropicApiKey,
      pixabayApiKey: _pixabayApiKey,
      ...publicUser
    } = record;
    return publicUser;
  }
}

export const authService = new AuthService();
