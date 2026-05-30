export interface CsvColumn {
  /** Key to read from each row object. */
  key: string;
  /** Human-readable header label. */
  label: string;
}

/** Escape a single CSV field per RFC 4180 (quote when it contains , " CR or LF). */
function escapeField(value: unknown): string {
  const str = value == null ? '' : String(value);
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

/**
 * Serialize rows to a CSV string (RFC 4180, CRLF line endings). The header row
 * uses column labels; each data row reads `row[column.key]`. Missing/nullish
 * values become empty fields.
 */
export function toCsv(
  columns: CsvColumn[],
  rows: Array<Record<string, unknown>>,
): string {
  const header = columns.map((c) => escapeField(c.label)).join(',');
  const body = rows.map((row) =>
    columns.map((c) => escapeField(row[c.key])).join(','),
  );
  return [header, ...body].join('\r\n');
}
