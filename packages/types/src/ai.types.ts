import type { Block, Page, SiteTheme } from './site.types';

export interface GenerateSiteOptions {
  /** Optional preferred language for generated copy (ISO 639-1). */
  language?: string;
  /** Optional template category hint. */
  category?: string;
}

/** Streaming chunk types emitted while AI generates a site. */
export type SiteGenerationChunk =
  | { type: 'meta'; name: string; tagline: string }
  | { type: 'theme'; theme: SiteTheme }
  | { type: 'page'; page: Page }
  | { type: 'progress'; message: string }
  | { type: 'created'; siteId: string; pageId: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface SEOIssue {
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
}

export interface SEOAnalysis {
  score: number; // 0-100
  issues: SEOIssue[];
  suggestedMetaTitle?: string;
  suggestedMetaDescription?: string;
}

/** Context passed to the AI so chat/actions understand the current page. */
export interface EditorContext {
  siteId: string;
  pageId: string;
  theme: SiteTheme;
  blocks: Pick<Block, 'id' | 'type'>[];
}

export type EditorActionType =
  | 'changeColor'
  | 'updateText'
  | 'addBlock'
  | 'removeBlock'
  | 'updateTheme'
  | 'findImages'
  | 'noop';

export interface EditorAction {
  type: EditorActionType;
  /** Block this action targets, when applicable. */
  targetBlockId?: string;
  payload: Record<string, unknown>;
  /** Human-readable summary shown in the confirmation UI. */
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
