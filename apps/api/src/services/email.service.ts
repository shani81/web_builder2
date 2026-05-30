import { env } from '../config/env.js';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<boolean>;
}

/** Fallback when no provider is configured: log instead of sending. */
class LogProvider implements EmailProvider {
  readonly name = 'log';
  async send(message: EmailMessage): Promise<boolean> {
    console.warn(
      `[email:log] would send to=${message.to} subject="${message.subject}"\n${message.text}`,
    );
    return true;
  }
}

/** Resend (https://resend.com) via its REST API — zero extra dependencies. */
class ResendProvider implements EmailProvider {
  readonly name = 'resend';
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(message: EmailMessage): Promise<boolean> {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.from,
          to: message.to,
          subject: message.subject,
          text: message.text,
          ...(message.html ? { html: message.html } : {}),
        }),
      });
      if (!res.ok) {
        console.error(`[email:resend] send failed (${res.status})`);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[email:resend] send error', err);
      return false;
    }
  }
}

function selectProvider(): EmailProvider {
  if (env.RESEND_API_KEY) {
    return new ResendProvider(env.RESEND_API_KEY, env.EMAIL_FROM);
  }
  return new LogProvider();
}

class EmailService {
  private readonly provider = selectProvider();

  /** Which provider is active ('resend' when configured, else 'log'). */
  get providerName(): string {
    return this.provider.name;
  }

  /** Send an email. Returns false on failure; never throws. */
  send(message: EmailMessage): Promise<boolean> {
    return this.provider.send(message);
  }
}

export const emailService = new EmailService();
