import { describe, it, expect } from 'vitest';
import { encryptSecret, decryptSecret } from './crypto.js';

describe('encryptSecret / decryptSecret', () => {
  it('round-trips a secret', () => {
    const secret = 'sk-ant-api03-example-key';
    const enc = encryptSecret(secret);
    expect(enc).not.toBe(secret);
    expect(decryptSecret(enc)).toBe(secret);
  });

  it('produces different ciphertext each time (random IV)', () => {
    expect(encryptSecret('same input')).not.toBe(encryptSecret('same input'));
  });

  it('round-trips unicode strings', () => {
    expect(decryptSecret(encryptSecret('héllo 🌍 ключ'))).toBe('héllo 🌍 ключ');
  });

  it('returns null for malformed payloads', () => {
    expect(decryptSecret('not-a-payload')).toBeNull();
    expect(decryptSecret('only.two')).toBeNull();
    expect(decryptSecret('')).toBeNull();
  });

  it('returns null when the ciphertext is tampered (auth tag fails)', () => {
    const [iv, tag, data] = encryptSecret('tamper-me').split('.');
    const bytes = Buffer.from(data!, 'base64');
    bytes[0] = bytes[0]! ^ 0xff; // flip a bit in the ciphertext
    const tampered = [iv, tag, bytes.toString('base64')].join('.');
    expect(decryptSecret(tampered)).toBeNull();
  });
});
