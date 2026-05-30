import type { FormType } from '@buildr/types';
import type { EmailMessage } from './email.service.js';

const FORM_LABEL: Record<FormType, string> = {
  contact: 'contact message',
  newsletter: 'newsletter signup',
};

/** Build the owner-notification email for a new form submission (pure). */
export function buildSubmissionEmail(opts: {
  to: string;
  siteName: string;
  formType: FormType;
  data: Record<string, string>;
  inboxUrl: string;
}): EmailMessage {
  const label = FORM_LABEL[opts.formType];
  const fields = Object.entries(opts.data)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return {
    to: opts.to,
    subject: `New ${label} on ${opts.siteName}`,
    text: [
      `You received a new ${label} on ${opts.siteName}.`,
      '',
      fields,
      '',
      `View all submissions: ${opts.inboxUrl}`,
    ].join('\n'),
  };
}
