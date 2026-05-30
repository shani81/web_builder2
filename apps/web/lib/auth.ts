import type { PublicUser } from '@buildr/types';
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from '@buildr/schemas';
import { apiFetch } from './api-client';

/**
 * Non-httpOnly hint cookie read by Next.js middleware to gate routes. The real
 * auth cookies are httpOnly and set by the API on its own origin, so middleware
 * (a different origin) can't see them — this presence flag drives redirect UX
 * only. The dashboard layout still verifies authoritatively via /auth/me.
 */
const SESSION_HINT = 'buildr_session';
const HINT_MAX_AGE = 60 * 60 * 24 * 7;

export function setSessionHint(active: boolean): void {
  if (typeof document === 'undefined') return;
  document.cookie = active
    ? `${SESSION_HINT}=1; path=/; max-age=${HINT_MAX_AGE}; samesite=lax`
    : `${SESSION_HINT}=; path=/; max-age=0; samesite=lax`;
}

export function apiRegister(
  input: RegisterInput,
): Promise<{ user: PublicUser }> {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function apiLogin(input: LoginInput): Promise<{ user: PublicUser }> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function apiLogout(): Promise<{ loggedOut: boolean }> {
  return apiFetch('/auth/logout', { method: 'POST' });
}

export function apiMe(): Promise<{ user: PublicUser }> {
  return apiFetch('/auth/me');
}

export function apiUpdateProfile(
  input: UpdateProfileInput,
): Promise<{ user: PublicUser }> {
  return apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify(input) });
}

export function apiChangePassword(
  input: ChangePasswordInput,
): Promise<{ changed: boolean }> {
  return apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function apiDeleteAccount(): Promise<{ deleted: boolean }> {
  return apiFetch('/auth/account', { method: 'DELETE' });
}

export function apiGetAiKey(): Promise<{ hasKey: boolean }> {
  return apiFetch('/auth/ai-key');
}

export function apiSetAiKey(apiKey: string): Promise<{ hasKey: boolean }> {
  return apiFetch('/auth/ai-key', {
    method: 'PUT',
    body: JSON.stringify({ apiKey }),
  });
}

export function apiRemoveAiKey(): Promise<{ hasKey: boolean }> {
  return apiFetch('/auth/ai-key', { method: 'DELETE' });
}

export function apiGetNotifyEmail(): Promise<{
  email: string | null;
  deliveryConfigured: boolean;
}> {
  return apiFetch('/auth/notify-email');
}

export function apiSetNotifyEmail(
  email: string | null,
): Promise<{ user: PublicUser }> {
  return apiFetch('/auth/notify-email', {
    method: 'PUT',
    body: JSON.stringify({ email }),
  });
}

export function apiGetStockKey(): Promise<{ hasKey: boolean }> {
  return apiFetch('/auth/stock-key');
}

export function apiSetStockKey(apiKey: string): Promise<{ hasKey: boolean }> {
  return apiFetch('/auth/stock-key', {
    method: 'PUT',
    body: JSON.stringify({ apiKey }),
  });
}

export function apiRemoveStockKey(): Promise<{ hasKey: boolean }> {
  return apiFetch('/auth/stock-key', { method: 'DELETE' });
}

export interface AiModelOption {
  id: string;
  label: string;
  description: string;
}

export function apiGetAiModel(): Promise<{
  model: string;
  models: AiModelOption[];
}> {
  return apiFetch('/auth/ai-model');
}

export function apiSetAiModel(model: string): Promise<{ model: string }> {
  return apiFetch('/auth/ai-model', {
    method: 'PUT',
    body: JSON.stringify({ model }),
  });
}
