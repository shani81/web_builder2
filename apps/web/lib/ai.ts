import type { EditorAction, SEOAnalysis, SiteGenerationChunk } from '@buildr/types';
import type {
  AnalyzeSeoInput,
  ChatInput,
  GenerateSiteInput,
  ImproveContentInput,
} from '@buildr/schemas';
import { env } from './env';
import { apiFetch, ApiClientError } from './api-client';

type ChatEvent =
  | { type: 'delta'; text: string }
  | { type: 'action'; action: EditorAction };

/**
 * POST a request and parse the Server-Sent Events response, invoking `onEvent`
 * per event. Resolves when the stream ends; throws on an error event or a
 * non-stream error response (e.g. AI_DISABLED).
 */
async function streamSSE<T>(
  path: string,
  body: unknown,
  onEvent: (event: T) => void,
): Promise<void> {
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => null);
    if (data && data.success === false) {
      throw new ApiClientError(data.error.code, data.error.message, res.status);
    }
    throw new ApiClientError('STREAM_ERROR', 'The request failed.', res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary: number;
    while ((boundary = buffer.indexOf('\n\n')) >= 0) {
      const chunk = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const dataLine = chunk
        .split('\n')
        .find((line) => line.startsWith('data:'));
      if (!dataLine) continue;
      const json = dataLine.slice(5).trim();
      if (!json) continue;

      let event: { type?: string; message?: string } & Record<string, unknown>;
      try {
        event = JSON.parse(json);
      } catch {
        continue;
      }
      if (event.type === 'end') return;
      if (event.type === 'error') {
        throw new ApiClientError(
          'AI_ERROR',
          typeof event.message === 'string' ? event.message : 'AI error',
          500,
        );
      }
      onEvent(event as T);
    }
  }
}

export function aiStatus(): Promise<{ enabled: boolean }> {
  return apiFetch('/ai/status');
}

export function generateSite(
  input: GenerateSiteInput,
  onEvent: (event: SiteGenerationChunk) => void,
): Promise<void> {
  return streamSSE('/ai/generate-site', input, onEvent);
}

export function improveContent(
  input: ImproveContentInput,
  onEvent: (event: { type: 'delta'; text: string }) => void,
): Promise<void> {
  return streamSSE('/ai/improve-content', input, onEvent);
}

export function chat(
  input: ChatInput,
  onEvent: (event: ChatEvent) => void,
): Promise<void> {
  return streamSSE('/ai/chat', input, onEvent);
}

export function analyzeSeo(input: AnalyzeSeoInput): Promise<SEOAnalysis> {
  return apiFetch('/ai/analyze-seo', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
