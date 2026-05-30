import type { FormSubmission } from '@buildr/types';
import { BaseRepository } from './base.repository.js';

class SubmissionRepository extends BaseRepository<FormSubmission> {
  protected fileName = 'submissions.json';

  findBySite(siteId: string): Promise<FormSubmission[]> {
    return this.findMany({ siteId } as Partial<FormSubmission>);
  }
}

export const submissionRepository = new SubmissionRepository();
