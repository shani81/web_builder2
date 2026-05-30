import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';
import { AppError } from './response.js';

function resolveOrigin(request: FastifyRequest): string {
  const allowed = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  const origin = request.headers.origin;
  if (origin && allowed.includes(origin)) return origin;
  return allowed[0] ?? '*';
}

/**
 * Stream an async generator of JSON events to the client as Server-Sent Events.
 *
 * We hijack the reply and write the raw response, so CORS headers (normally
 * added by @fastify/cors on the reply object) must be set here manually for the
 * browser to read the cross-origin stream with credentials.
 */
export async function streamSSE<T>(
  request: FastifyRequest,
  reply: FastifyReply,
  generator: AsyncGenerator<T>,
): Promise<void> {
  reply.hijack();
  const res = reply.raw;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': resolveOrigin(request),
    'Access-Control-Allow-Credentials': 'true',
  });

  const write = (event: unknown) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  // Stop generating if the client disconnects mid-stream.
  let closed = false;
  request.raw.on('close', () => {
    closed = true;
  });

  try {
    for await (const event of generator) {
      if (closed) break;
      write(event);
    }
  } catch (err) {
    const message =
      err instanceof AppError ? err.message : 'The AI request failed.';
    if (!closed) write({ type: 'error', message });
  } finally {
    if (!closed) {
      write({ type: 'end' });
      res.end();
    }
  }
}
