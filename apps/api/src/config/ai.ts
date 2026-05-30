/**
 * Centralized AI model configuration.
 *
 * Swapping models later is a one-line change here — nothing else in the
 * codebase should hardcode a model id.
 */
export const AI_MODEL = {
  /** Default model for generation and chat (user-overridable in Settings). */
  default: 'claude-sonnet-4-6',
  /** Cheaper/faster model for lightweight tasks (alt text, SEO). */
  fast: 'claude-haiku-4-5-20251001',
} as const;

/** User-selectable models for generation/chat, shown in Settings. */
export const AI_MODELS = [
  {
    id: 'claude-sonnet-4-6',
    label: 'Claude Sonnet 4.6',
    description: 'Balanced quality and cost — recommended.',
  },
  {
    id: 'claude-opus-4-8',
    label: 'Claude Opus 4.8',
    description: 'Most capable, higher cost.',
  },
  {
    id: 'claude-haiku-4-5-20251001',
    label: 'Claude Haiku 4.5',
    description: 'Fastest and cheapest.',
  },
] as const;

export type AiModelId = (typeof AI_MODELS)[number]['id'];

export function isValidModel(id: unknown): id is AiModelId {
  return typeof id === 'string' && AI_MODELS.some((m) => m.id === id);
}

export const AI_DEFAULTS = {
  maxTokens: 4096,
  temperature: 0.7,
} as const;
