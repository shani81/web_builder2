import { describe, it, expect } from 'vitest';
import { slugify, isValidSubdomain, uniqueSlug } from './slug.utils';

describe('slugify', () => {
  it('lowercases and hyphenates whitespace', () => {
    expect(slugify('Pricing Plans')).toBe('pricing-plans');
  });

  it('strips diacritics', () => {
    expect(slugify('Café Münchën')).toBe('cafe-munchen');
  });

  it('removes special characters', () => {
    expect(slugify('Hello, World! @2026')).toBe('hello-world-2026');
  });

  it('collapses repeated whitespace/hyphens and trims edges', () => {
    expect(slugify('  About   Us  ')).toBe('about-us');
    expect(slugify('a---b')).toBe('a-b');
  });

  it('drops underscores rather than treating them as separators', () => {
    // Underscores are stripped before separator collapsing, so they join words.
    expect(slugify('about_us')).toBe('aboutus');
  });

  it('returns an empty string for non-sluggable input', () => {
    expect(slugify('!!!')).toBe('');
  });
});

describe('isValidSubdomain', () => {
  it('accepts simple DNS-safe labels', () => {
    expect(isValidSubdomain('acme')).toBe(true);
    expect(isValidSubdomain('a1-b2')).toBe(true);
  });

  it('rejects edge hyphens, uppercase, and underscores', () => {
    expect(isValidSubdomain('-acme')).toBe(false);
    expect(isValidSubdomain('acme-')).toBe(false);
    expect(isValidSubdomain('Acme')).toBe(false);
    expect(isValidSubdomain('a_b')).toBe(false);
  });

  it('enforces the 63-character limit', () => {
    expect(isValidSubdomain('a'.repeat(63))).toBe(true);
    expect(isValidSubdomain('a'.repeat(64))).toBe(false);
  });
});

describe('uniqueSlug', () => {
  it('returns the base slug when it is free', () => {
    expect(uniqueSlug('About', [])).toBe('about');
  });

  it('appends an incrementing suffix on collision', () => {
    expect(uniqueSlug('About', ['about'])).toBe('about-2');
    expect(uniqueSlug('About', ['about', 'about-2'])).toBe('about-3');
  });

  it('falls back to "page" when the base has no sluggable characters', () => {
    expect(uniqueSlug('!!!', [])).toBe('page');
  });
});
