import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { now, shortId, slugify } from '@buildr/utils';
import type {
  Block,
  EditorAction,
  EditorContext,
  Page,
  SEOAnalysis,
  SiteGenerationChunk,
  SiteTheme,
} from '@buildr/types';
import { siteThemeSchema } from '@buildr/schemas';
import { AI_DEFAULTS, AI_MODEL, isValidModel } from '../config/ai.js';
import { DEFAULT_THEME } from '../config/site-defaults.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/response.js';
import { decryptSecret } from '../utils/crypto.js';
import { authService } from './auth.service.js';

/**
 * The assistant's emittable block set + token enums come from the builder's
 * capability manifest (builder-capabilities.json) so the AI stays in lockstep
 * with the real registry. If the manifest can't be read, fall back to the
 * known implemented set so generation still works.
 */
interface CapManifest {
  components: { type: string }[];
  tokens?: { borderRadius?: string[]; spacing?: string[] };
}

function loadCapabilities(): CapManifest | null {
  const candidates = [
    resolve(import.meta.dirname, '../../../../builder-capabilities.json'),
    resolve(process.cwd(), 'builder-capabilities.json'),
  ];
  for (const p of candidates) {
    try {
      if (existsSync(p))
        return JSON.parse(readFileSync(p, 'utf8')) as CapManifest;
    } catch {
      /* fall through to the next candidate */
    }
  }
  return null;
}

const CAPS = loadCapabilities();
// Containers/child-only types the flat generator shouldn't emit directly.
const STRUCTURAL = new Set(['section', 'column', 'feature-item']);
const FALLBACK_EMITTABLE = [
  'navbar',
  'hero',
  'features',
  'testimonials',
  'cta',
  'image',
  'text',
  'heading',
  'button',
  'divider',
  'footer',
  'pricing',
  'faq',
  'stats',
  'team',
  'contact',
  'newsletter',
  'gallery',
  'video',
  'countdown',
  'logos',
];
const EMITTABLE = new Set<string>(
  CAPS
    ? CAPS.components.map((c) => c.type).filter((t) => !STRUCTURAL.has(t))
    : FALLBACK_EMITTABLE,
);

/** A hard constraint line derived from the manifest, appended to prompts. */
const CAPS_CONSTRAINT = `You may use ONLY these block types: ${[...EMITTABLE].join(', ')}.${
  CAPS?.tokens
    ? ` Theme borderRadius ∈ {${(CAPS.tokens.borderRadius ?? []).join(', ')}}, spacing ∈ {${(CAPS.tokens.spacing ?? []).join(', ')}}.`
    : ''
}`;

const BLOCK_GUIDE = `Available block types and their props:
- navbar: { brand, links (lines of "Label | URL"), ctaLabel, ctaHref }
- hero: { headline, subtext, ctaLabel, ctaHref, secondaryCtaLabel, secondaryCtaHref, align ("left"|"center"), background (hex), textColor (hex) }
- features: { heading, columns ("2"|"3"|"4"), items (lines of "Title | Description") }
- testimonials: { heading, items (lines of "Quote | Author | Role") }
- pricing: { heading, items (lines of "Name | Price | Period | feat1; feat2 | buttonURL") }
- faq: { heading, items (lines of "Question | Answer") }
- stats: { heading, columns ("2"|"3"|"4"), items (lines of "Value | Label") }
- team: { heading, items (lines of "Name | Role | imageUrl") }
- logos: { heading, items (comma string of brand names) }
- cta: { headline, subtext, ctaLabel, ctaHref, background (hex), textColor (hex) }
- newsletter: { heading, subtext, buttonLabel, background (hex), textColor (hex) }
- contact: { heading, subtext, buttonLabel }
- gallery: { heading, columns ("2"|"3"|"4"), images (one URL per line) }
- video: { url (YouTube/Vimeo), caption }
- countdown: { heading, targetDate ("YYYY-MM-DD"), expiredText }
- image: { src (url), alt, caption, link }
- text: { heading, content, align ("left"|"center") }
- heading: { text, level ("h1"|"h2"|"h3"|"h4"|"h5"|"h6"), align ("left"|"center"|"right"), weight ("normal"|"medium"|"semibold"|"bold") }
- button: { label, href, variant ("filled"|"outline"|"ghost"), size ("sm"|"md"|"lg"), align ("left"|"center"|"right") }
- divider: { text (optional label), position ("left"|"center"|"right") }
- footer: { brand, tagline, links (lines of "Label | URL"), social (lines of "Label | URL"), text }

Always give links and buttons working hrefs: in-page anchors like "#features", site paths like "/pricing", or full https URLs.`;

// One client per API key (users may bring their own; env is the fallback).
const clients = new Map<string, Anthropic>();

function getClient(apiKey: string): Anthropic {
  let client = clients.get(apiKey);
  if (!client) {
    client = new Anthropic({ apiKey });
    clients.set(apiKey, client);
  }
  return client;
}

/** Resolve a user's AI key (own → env) and chosen model (→ default). */
export async function resolveUserAi(
  userId: string,
): Promise<{ apiKey: string | null; model: string }> {
  const user = await authService.getUserById(userId);
  const own = user.anthropicApiKey ? decryptSecret(user.anthropicApiKey) : null;
  return {
    apiKey: own || env.ANTHROPIC_API_KEY || null,
    model: isValidModel(user.aiModel) ? user.aiModel : AI_MODEL.default,
  };
}

/** Resolve only the API key (own → env). */
export async function resolveUserApiKey(
  userId: string,
): Promise<string | null> {
  return (await resolveUserAi(userId)).apiKey;
}

/** Collect the text from a streaming message into a single string. */
async function streamText(
  apiKey: string,
  params: Anthropic.MessageCreateParamsStreaming,
): Promise<string> {
  const stream = await getClient(apiKey).messages.create(params);
  let text = '';
  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      text += event.delta.text;
    }
  }
  return text;
}

/** Yield text deltas from a streaming message. */
async function* streamDeltas(
  apiKey: string,
  params: Anthropic.MessageCreateParamsStreaming,
): AsyncGenerator<string> {
  const stream = await getClient(apiKey).messages.create(params);
  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}

/** Extract a JSON object from model output that may be fenced or chatty. */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1]! : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw AppError.badRequest('The AI returned an unexpected response.');
  }
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    throw AppError.badRequest('The AI returned malformed JSON.');
  }
}

function sanitizeTheme(raw: unknown): SiteTheme {
  const parsed = siteThemeSchema.partial().safeParse(raw);
  return { ...DEFAULT_THEME, ...(parsed.success ? parsed.data : {}) };
}

function sanitizeBlock(raw: unknown): Block | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw as Record<string, unknown>;
  const type = record.type;
  if (typeof type !== 'string' || !EMITTABLE.has(type)) {
    return null;
  }
  const props =
    typeof record.props === 'object' && record.props !== null
      ? (record.props as Record<string, unknown>)
      : {};
  return {
    id: shortId('blk'),
    type: type as Block['type'],
    props,
    styles: {},
    locked: false,
    visible: true,
    responsive: { desktop: {}, tablet: {}, mobile: {} },
  };
}

export interface GeneratedSite {
  name: string;
  tagline: string;
  theme: SiteTheme;
  pages: Page[];
}

export class AIService {
  /** Stream a generated site as structured chunks (meta, theme, page…). */
  async *generateSite(
    apiKey: string,
    model: string,
    prompt: string,
    options: { language?: string; category?: string },
  ): AsyncGenerator<SiteGenerationChunk> {
    yield { type: 'progress', message: 'Designing your site…' };

    const system = `You are an expert web designer. Given a description, produce a single, complete, professional marketing website as JSON.

${BLOCK_GUIDE}

${CAPS_CONSTRAINT}

Output ONLY a JSON object of this shape (no prose, no markdown fence):
{
  "name": "Site name",
  "tagline": "Short tagline",
  "theme": { "primaryColor": "#4F6EF7", "secondaryColor": "#0F0F12", "accentColor": "#22C55E", "backgroundColor": "#FFFFFF", "textColor": "#0F0F12", "fontHeading": "Inter", "fontBody": "Inter", "borderRadius": "md", "spacing": "normal" },
  "pages": [ { "title": "Home", "blocks": [ { "type": "navbar", "props": { ... } }, ... ] } ]
}
Build one rich "Home" page that starts with a navbar and ends with a footer, with a hero and several content blocks in between. Write real, specific copy — never lorem ipsum.${
      options.language
        ? ` Write all copy in language code "${options.language}".`
        : ''
    }`;

    const text = await streamText(apiKey, {
      model,
      max_tokens: AI_DEFAULTS.maxTokens,
      stream: true,
      system,
      messages: [{ role: 'user', content: prompt }],
    });

    const data = extractJson(text) as Record<string, unknown>;
    const name = typeof data.name === 'string' ? data.name : 'My Site';
    const tagline = typeof data.tagline === 'string' ? data.tagline : '';

    yield { type: 'meta', name, tagline };
    yield { type: 'theme', theme: sanitizeTheme(data.theme) };

    const rawPages = Array.isArray(data.pages) ? data.pages : [];
    const timestamp = now();

    for (const [index, rawPage] of rawPages.entries()) {
      const pageRecord = (rawPage ?? {}) as Record<string, unknown>;
      const title =
        typeof pageRecord.title === 'string' ? pageRecord.title : 'Home';
      const rawBlocks = Array.isArray(pageRecord.blocks)
        ? pageRecord.blocks
        : [];
      const blocks = rawBlocks
        .map(sanitizeBlock)
        .filter((b): b is Block => b !== null);

      const page: Page = {
        id: shortId('page'),
        siteId: '',
        title,
        slug: index === 0 ? 'home' : slugify(title) || `page-${index + 1}`,
        blocks,
        seo: { metaTitle: title, metaDescription: tagline, noIndex: false },
        isHome: index === 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      yield { type: 'page', page };
    }
  }

  /** Stream improved/rewritten content as text deltas. */
  improveContent(
    apiKey: string,
    model: string,
    content: string,
    instruction: string,
  ): AsyncGenerator<string> {
    const system =
      'You are a concise, expert copywriter. Rewrite the user content per the instruction. Return ONLY the rewritten text, no preamble, no quotes.';
    return streamDeltas(apiKey, {
      model,
      max_tokens: 1024,
      stream: true,
      system,
      messages: [
        {
          role: 'user',
          content: `Instruction: ${instruction}\n\nContent:\n${content}`,
        },
      ],
    });
  }

  /** Generate concise alt text for an image using vision. */
  async generateAltText(
    apiKey: string,
    base64: string,
    mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
  ): Promise<string> {
    const message = await getClient(apiKey).messages.create({
      model: AI_MODEL.fast,
      max_tokens: 80,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: 'Write concise, descriptive alt text (max 12 words) for this image. Return only the alt text, no quotes.',
            },
          ],
        },
      ],
    });
    return message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();
  }

  /** Analyze a page and return an SEO score with suggestions. */
  async analyzeSEO(apiKey: string, page: Page): Promise<SEOAnalysis> {
    const summary = {
      title: page.title,
      seo: page.seo,
      blocks: page.blocks.map((b) => ({ type: b.type, props: b.props })),
    };
    const system = `You are an SEO expert. Analyze the page and return ONLY JSON:
{ "score": 0-100, "issues": [ { "severity": "critical"|"warning"|"info", "message": "...", "suggestion": "..." } ], "suggestedMetaTitle": "...", "suggestedMetaDescription": "..." }`;

    const text = await streamText(apiKey, {
      model: AI_MODEL.fast,
      max_tokens: 1024,
      stream: true,
      system,
      messages: [{ role: 'user', content: JSON.stringify(summary) }],
    });

    const data = extractJson(text) as Partial<SEOAnalysis>;
    return {
      score:
        typeof data.score === 'number'
          ? Math.max(0, Math.min(100, Math.round(data.score)))
          : 0,
      issues: Array.isArray(data.issues) ? data.issues : [],
      suggestedMetaTitle: data.suggestedMetaTitle,
      suggestedMetaDescription: data.suggestedMetaDescription,
    };
  }

  /**
   * Chat with editor context. Streams assistant text, then any actions the
   * model proposed (parsed from a fenced ```action {json}``` block).
   */
  async *chat(
    apiKey: string,
    model: string,
    message: string,
    context: EditorContext,
    history: { role: 'user' | 'assistant'; content: string }[] = [],
  ): AsyncGenerator<
    { type: 'delta'; text: string } | { type: 'action'; action: EditorAction }
  > {
    const system = `You are BUILDR's in-editor assistant. Help the user improve the current page.

${BLOCK_GUIDE}

${CAPS_CONSTRAINT}

Current page blocks (id:type): ${
      context.blocks.map((b) => `${b.id}:${b.type}`).join(', ') || '(empty)'
    }.

Reply conversationally and briefly. If — and only if — the user asks you to change the page, append a single fenced block at the very end:
\`\`\`action
{ "type": "addBlock"|"updateBlock"|"removeBlock"|"findImages", "targetBlockId": "<id, when editing/removing>", "payload": { ... }, "description": "what this does" }
\`\`\`
For addBlock, payload is { "blockType": "hero", "props": { ... } }. For updateBlock, payload is { "props": { ... } } merged into the block.
If the user asks to find, search for, or add a photo/image, use type "findImages" with payload { "query": "<2-4 concrete visual keywords>" } — this opens a stock-photo picker. Expand vague requests into specific, photographable subjects: prefer nouns for subject + setting/style, drop articles and filler, and use the page's industry/theme for context. E.g. "a nice picture for my barbershop hero" → "barber shop interior, vintage chair, grooming"; "something for the about section" (a bakery site) → "artisan bakery, fresh bread, baker hands".`;

    const messages: Anthropic.MessageParam[] = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: message },
    ];

    let full = '';
    for await (const delta of streamDeltas(apiKey, {
      model,
      max_tokens: 1024,
      stream: true,
      system,
      messages,
    })) {
      full += delta;
      // Don't stream the raw action block to the user.
      if (!full.includes('```action')) yield { type: 'delta', text: delta };
    }

    const actionMatch = full.match(/```action\s*([\s\S]*?)```/);
    if (actionMatch) {
      try {
        const action = JSON.parse(actionMatch[1]!) as EditorAction;
        if (action && typeof action.type === 'string') {
          yield { type: 'action', action };
        }
      } catch {
        // Ignore malformed action blocks.
      }
    }
  }
}

export const aiService = new AIService();
