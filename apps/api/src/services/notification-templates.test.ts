import { describe, it, expect } from 'vitest';
import { buildSubmissionEmail } from './notification-templates.js';

describe('buildSubmissionEmail', () => {
  it('builds a contact-message notification', () => {
    const msg = buildSubmissionEmail({
      to: 'owner@example.com',
      siteName: 'Acme',
      formType: 'contact',
      data: { name: 'Jo', email: 'jo@x.com', message: 'Hi there' },
      inboxUrl: 'https://app/submissions',
    });
    expect(msg.to).toBe('owner@example.com');
    expect(msg.subject).toBe('New contact message on Acme');
    expect(msg.text).toContain('name: Jo');
    expect(msg.text).toContain('message: Hi there');
    expect(msg.text).toContain('https://app/submissions');
  });

  it('labels newsletter signups distinctly', () => {
    const msg = buildSubmissionEmail({
      to: 'o@e.com',
      siteName: 'Blog',
      formType: 'newsletter',
      data: { email: 'fan@x.com' },
      inboxUrl: 'https://app/submissions',
    });
    expect(msg.subject).toBe('New newsletter signup on Blog');
    expect(msg.text).toContain('email: fan@x.com');
  });
});
