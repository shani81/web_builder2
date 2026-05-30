import { describe, it, expect } from 'vitest';
import { toCsv } from './csv.utils';

const cols = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
];

describe('toCsv', () => {
  it('writes a header row from labels', () => {
    expect(toCsv(cols, [])).toBe('Name,Email');
  });

  it('writes rows reading by column key, CRLF-separated', () => {
    const csv = toCsv(cols, [
      { name: 'Jo', email: 'jo@x.com' },
      { name: 'Al', email: 'al@x.com' },
    ]);
    expect(csv).toBe('Name,Email\r\nJo,jo@x.com\r\nAl,al@x.com');
  });

  it('quotes fields containing commas, quotes, or newlines', () => {
    const csv = toCsv(
      [{ key: 'msg', label: 'Message' }],
      [
        { msg: 'Hello, world' },
        { msg: 'She said "hi"' },
        { msg: 'line1\nline2' },
      ],
    );
    expect(csv).toBe(
      'Message\r\n"Hello, world"\r\n"She said ""hi"""\r\n"line1\nline2"',
    );
  });

  it('renders missing or nullish values as empty fields', () => {
    const csv = toCsv(cols, [{ name: 'Jo' }, { email: null }]);
    expect(csv).toBe('Name,Email\r\nJo,\r\n,');
  });
});
