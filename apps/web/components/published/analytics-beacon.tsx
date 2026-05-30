'use client';

import { useEffect } from 'react';
import { trackView } from '@/lib/analytics';

/**
 * Records a single page view on mount. Unique visitors are approximated with a
 * per-site localStorage flag (no cookies, no PII).
 */
export function AnalyticsBeacon({
  subdomain,
  path,
}: {
  subdomain: string;
  path: string;
}) {
  useEffect(() => {
    const key = `buildr_v_${subdomain}`;
    let isNew = false;
    try {
      if (!localStorage.getItem(key)) {
        isNew = true;
        localStorage.setItem(key, '1');
      }
    } catch {
      // Private mode etc. — treat as a returning visitor.
    }
    trackView(subdomain, path, isNew);
  }, [subdomain, path]);

  return null;
}
