import type { FormSubmission, FormType, PublishedSite } from '@buildr/types';
import type { SubmitFormInput } from '@buildr/schemas';
import { submissionRepository } from '../repositories/submission.repository.js';
import { publishedRepository } from '../repositories/published.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { siteService } from './site.service.js';
import { emailService } from './email.service.js';
import { buildSubmissionEmail } from './notification-templates.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/response.js';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function clean(value: string | undefined, max = 2000): string {
  return (value ?? '').trim().slice(0, max);
}

/** Validate + shape the public payload per form type. Throws on bad input. */
function sanitize(
  formType: FormType,
  data: Record<string, string>,
): Record<string, string> {
  if (formType === 'newsletter') {
    const email = clean(data.email, 200);
    if (!EMAIL_RE.test(email)) {
      throw AppError.badRequest('A valid email is required.', {
        field: 'email',
      });
    }
    return { email };
  }
  // contact
  const name = clean(data.name, 200);
  const email = clean(data.email, 200);
  const message = clean(data.message, 5000);
  if (!name || !message) {
    throw AppError.badRequest('Please fill in your name and message.');
  }
  if (!EMAIL_RE.test(email)) {
    throw AppError.badRequest('A valid email is required.', { field: 'email' });
  }
  return { name, email, message };
}

export class SubmissionService {
  /** Capture a submission from a published site. Honeypot hits are ignored. */
  async submit(subdomain: string, input: SubmitFormInput): Promise<void> {
    if (input.website && input.website.trim()) return; // bot — silently drop
    const published = await publishedRepository.findBySubdomain(subdomain);
    if (!published || !published.live) throw AppError.notFound('site');

    const data = sanitize(input.formType, input.data);
    await submissionRepository.create({
      siteId: published.id,
      formType: input.formType,
      data,
    });

    await this.notifyOwner(published, input.formType, data);
  }

  /** Email the site owner about a new submission. Best-effort — never throws. */
  private async notifyOwner(
    published: PublishedSite,
    formType: FormType,
    data: Record<string, string>,
  ): Promise<void> {
    try {
      const owner = await userRepository.findById(published.userId);
      if (!owner?.notifyEmail) return;
      await emailService.send(
        buildSubmissionEmail({
          to: owner.notifyEmail,
          siteName: published.versions[0]?.name ?? 'your site',
          formType,
          data,
          inboxUrl: `${env.SITE_URL}/submissions`,
        }),
      );
    } catch (err) {
      console.error('[submission] owner notification failed', err);
    }
  }

  async list(siteId: string, userId: string): Promise<FormSubmission[]> {
    await siteService.getOwned(siteId, userId);
    const items = await submissionRepository.findBySite(siteId);
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async remove(
    siteId: string,
    submissionId: string,
    userId: string,
  ): Promise<void> {
    await siteService.getOwned(siteId, userId);
    const sub = await submissionRepository.findById(submissionId);
    if (sub && sub.siteId === siteId) {
      await submissionRepository.delete(submissionId);
    }
  }
}

export const submissionService = new SubmissionService();
