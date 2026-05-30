import type { Entity } from './common.types';

export type FormType = 'contact' | 'newsletter';

/** A form submission captured from a published site. */
export interface FormSubmission extends Entity {
  siteId: string;
  formType: FormType;
  data: Record<string, string>;
}
