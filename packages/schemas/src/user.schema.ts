import { z } from 'zod';

export const planTierSchema = z.enum(['free', 'pro', 'business', 'enterprise']);
export const userRoleSchema = z.enum(['user', 'admin']);

export const registerSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
  name: z.string().min(1, 'Name is required').max(80, 'Name is too long'),
});

export const loginSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  avatarUrl: z.string().url().optional(),
  timezone: z.string().min(1).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export const setAiKeySchema = z.object({
  apiKey: z
    .string()
    .trim()
    .min(20, 'That does not look like a valid API key')
    .max(200)
    .startsWith('sk-ant-', 'Anthropic API keys start with "sk-ant-"'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
// Pixabay keys are ~34-char tokens (digits + hex with a dash), no fixed prefix.
export const setStockKeySchema = z.object({
  apiKey: z
    .string()
    .trim()
    .min(20, 'That does not look like a valid Pixabay API key')
    .max(100),
});

export type SetAiKeyInput = z.infer<typeof setAiKeySchema>;
export type SetStockKeyInput = z.infer<typeof setStockKeySchema>;
