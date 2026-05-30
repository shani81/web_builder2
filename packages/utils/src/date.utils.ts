import type { ISODateString } from '@buildr/types';

/** Current timestamp as an ISO-8601 string. */
export function now(): ISODateString {
  return new Date().toISOString();
}

/**
 * Human-friendly relative time, e.g. "just now", "5 minutes ago", "2 days ago".
 * Used by the dashboard ("last edited") and editor ("Saved 2 minutes ago").
 */
export function timeAgo(iso: ISODateString, from: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const seconds = Math.round((from.getTime() - then) / 1000);
  if (Number.isNaN(seconds)) return '';
  if (seconds < 10) return 'just now';

  const units: [limit: number, secs: number, label: string][] = [
    [60, 1, 'second'],
    [3600, 60, 'minute'],
    [86400, 3600, 'hour'],
    [604800, 86400, 'day'],
    [2629800, 604800, 'week'],
    [31557600, 2629800, 'month'],
    [Infinity, 31557600, 'year'],
  ];

  for (const [limit, secs, label] of units) {
    if (seconds < limit) {
      const value = Math.floor(seconds / secs);
      return `${value} ${label}${value === 1 ? '' : 's'} ago`;
    }
  }
  return '';
}
