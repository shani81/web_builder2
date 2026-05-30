import type { FastifyInstance, FastifyReply } from 'fastify';
import type { AuthTokens } from '@buildr/types';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  setAiKeySchema,
  setStockKeySchema,
  updateProfileSchema,
} from '@buildr/schemas';
import { z } from 'zod';
import { authService } from '../../services/auth.service.js';
import { siteService } from '../../services/site.service.js';
import { emailService } from '../../services/email.service.js';
import { AI_MODEL, AI_MODELS, isValidModel } from '../../config/ai.js';
import { ok, AppError } from '../../utils/response.js';
import {
  COOKIE,
  REFRESH_COOKIE_PATH,
  accessCookieOptions,
  clearCookieOptions,
  refreshCookieOptions,
} from '../../config/auth.js';

function setAuthCookies(
  reply: FastifyReply,
  tokens: AuthTokens,
  rememberMe: boolean,
): void {
  reply.setCookie(COOKIE.access, tokens.accessToken, accessCookieOptions());
  reply.setCookie(
    COOKIE.refresh,
    tokens.refreshToken,
    refreshCookieOptions(rememberMe),
  );
}

function clearAuthCookies(reply: FastifyReply): void {
  reply.clearCookie(COOKIE.access, clearCookieOptions('/'));
  reply.clearCookie(COOKIE.refresh, clearCookieOptions(REFRESH_COOKIE_PATH));
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // Register + auto-login.
  app.post('/auth/register', async (request, reply) => {
    const input = registerSchema.parse(request.body);
    const user = await authService.register(input);
    const record = await authService.getUserById(user.id);
    setAuthCookies(reply, authService.issueTokens(record, true), true);
    return reply.code(201).send(ok({ user }));
  });

  app.post('/auth/login', async (request, reply) => {
    const input = loginSchema.parse(request.body);
    const record = await authService.validateCredentials(
      input.email,
      input.password,
    );
    const rememberMe = input.rememberMe ?? false;
    setAuthCookies(
      reply,
      authService.issueTokens(record, rememberMe),
      rememberMe,
    );
    return ok({ user: authService.toPublicUser(record) });
  });

  // Rotate tokens using the refresh cookie.
  app.post('/auth/refresh', async (request, reply) => {
    const token = request.cookies[COOKIE.refresh];
    if (!token) throw AppError.unauthorized('No refresh token');
    const { sub, rmb } = authService.verifyRefresh(token);
    const record = await authService.getUserById(sub);
    setAuthCookies(reply, authService.issueTokens(record, rmb), rmb);
    return ok({ user: authService.toPublicUser(record) });
  });

  app.get('/auth/me', { preHandler: app.authenticate }, async (request) => {
    const record = await authService.getUserById(request.user!.sub);
    return ok({ user: authService.toPublicUser(record) });
  });

  app.post('/auth/logout', async (_request, reply) => {
    clearAuthCookies(reply);
    return ok({ loggedOut: true });
  });

  // ── Account settings (all require a valid session) ──────────────────────
  app.patch('/auth/me', { preHandler: app.authenticate }, async (request) => {
    const input = updateProfileSchema.parse(request.body);
    const user = await authService.updateProfile(request.user!.sub, input);
    return ok({ user });
  });

  app.get(
    '/auth/notify-email',
    { preHandler: app.authenticate },
    async (request) => {
      const record = await authService.getUserById(request.user!.sub);
      return ok({
        email: record.notifyEmail ?? null,
        deliveryConfigured: emailService.providerName !== 'log',
      });
    },
  );

  app.put(
    '/auth/notify-email',
    { preHandler: app.authenticate },
    async (request) => {
      const { email } = z
        .object({ email: z.string().email().max(200).nullable() })
        .parse(request.body);
      const user = await authService.setNotifyEmail(request.user!.sub, email);
      return ok({ user });
    },
  );

  app.post(
    '/auth/change-password',
    { preHandler: app.authenticate },
    async (request) => {
      const { currentPassword, newPassword } = changePasswordSchema.parse(
        request.body,
      );
      await authService.changePassword(
        request.user!.sub,
        currentPassword,
        newPassword,
      );
      return ok({ changed: true });
    },
  );

  app.delete(
    '/auth/account',
    { preHandler: app.authenticate },
    async (request, reply) => {
      const userId = request.user!.sub;
      await siteService.deleteAllForUser(userId);
      await authService.deleteAccount(userId);
      clearAuthCookies(reply);
      return ok({ deleted: true });
    },
  );

  // ── Anthropic API key (per-user, encrypted at rest) ─────────────────────
  app.get('/auth/ai-key', { preHandler: app.authenticate }, async (request) => {
    return ok({ hasKey: await authService.hasAiKey(request.user!.sub) });
  });

  app.put('/auth/ai-key', { preHandler: app.authenticate }, async (request) => {
    const { apiKey } = setAiKeySchema.parse(request.body);
    await authService.setAiKey(request.user!.sub, apiKey);
    return ok({ hasKey: true });
  });

  app.delete(
    '/auth/ai-key',
    { preHandler: app.authenticate },
    async (request) => {
      await authService.removeAiKey(request.user!.sub);
      return ok({ hasKey: false });
    },
  );

  // ── Pixabay stock-photo key (per-user, encrypted at rest) ───────────────
  app.get(
    '/auth/stock-key',
    { preHandler: app.authenticate },
    async (request) => {
      return ok({ hasKey: await authService.hasStockKey(request.user!.sub) });
    },
  );

  app.put(
    '/auth/stock-key',
    { preHandler: app.authenticate },
    async (request) => {
      const { apiKey } = setStockKeySchema.parse(request.body);
      await authService.setStockKey(request.user!.sub, apiKey);
      return ok({ hasKey: true });
    },
  );

  app.delete(
    '/auth/stock-key',
    { preHandler: app.authenticate },
    async (request) => {
      await authService.removeStockKey(request.user!.sub);
      return ok({ hasKey: false });
    },
  );

  // ── AI model preference ─────────────────────────────────────────────────
  app.get(
    '/auth/ai-model',
    { preHandler: app.authenticate },
    async (request) => {
      const chosen = await authService.getAiModel(request.user!.sub);
      return ok({
        model: isValidModel(chosen) ? chosen : AI_MODEL.default,
        models: AI_MODELS,
      });
    },
  );

  app.put(
    '/auth/ai-model',
    { preHandler: app.authenticate },
    async (request) => {
      const { model } = z.object({ model: z.string() }).parse(request.body);
      if (!isValidModel(model)) {
        throw AppError.badRequest('Unknown model.', { field: 'model' });
      }
      await authService.setAiModel(request.user!.sub, model);
      return ok({ model });
    },
  );
}
