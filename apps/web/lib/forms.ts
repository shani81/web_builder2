import type { FormType } from '@buildr/types';
import { env } from './env';
import { ApiClientError } from './api-client';

/** Extract the subdomain from a published linkBase like "/s/acme". */
export function subdomainFromBase(linkBase: string): string {
  const match = /^\/s\/([^/]+)/.exec(linkBase || '');
  return match ? match[1]! : '';
}

/** Submit a published-site form. Throws ApiClientError with a friendly message. */
export async function submitForm(
  subdomain: string,
  formType: FormType,
  data: Record<string, string>,
  website: string,
): Promise<void> {
  const res = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/public/sites/${encodeURIComponent(
      subdomain,
    )}/submit`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formType, data, website }),
    },
  );
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    throw new ApiClientError(
      body?.error?.code ?? 'SUBMIT_ERROR',
      body?.error?.message ?? 'Could not send. Please try again.',
      res.status,
    );
  }
}
