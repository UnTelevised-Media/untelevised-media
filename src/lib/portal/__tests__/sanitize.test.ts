// src/lib/portal/__tests__/sanitize.test.ts
// Unit tests for input sanitization — pure functions, no mocks.

import { sanitizeText, sanitizeHtml } from '../sanitize';

describe('sanitizeText', () => {
  it('strips HTML tags from input', () => {
    expect(sanitizeText('<script>alert(1)</script>Hello')).not.toContain('<');
    expect(sanitizeText('<b>bold</b>')).toBe('bold');
  });

  it('encodes angle brackets', () => {
    const result = sanitizeText('Title <em>here</em>');
    expect(result).not.toContain('<em>');
    expect(result).toContain('here');
  });

  it('trims leading/trailing whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('returns plain text unchanged', () => {
    expect(sanitizeText('Breaking: City Council votes on budget')).toBe(
      'Breaking: City Council votes on budget'
    );
  });

  it('handles empty string', () => {
    expect(sanitizeText('')).toBe('');
  });
});

describe('sanitizeHtml', () => {
  it('removes script tags', () => {
    const input = '<p>Hello</p><script>evil()</script><p>world</p>';
    expect(sanitizeHtml(input)).not.toContain('<script>');
    expect(sanitizeHtml(input)).toContain('<p>Hello</p>');
  });

  it('removes iframe tags', () => {
    const input = '<p>text</p><iframe src="evil.com"></iframe>';
    expect(sanitizeHtml(input)).not.toContain('<iframe');
  });

  it('removes inline event handlers', () => {
    const input = '<p onclick="evil()">click</p>';
    expect(sanitizeHtml(input)).not.toContain('onclick=');
  });

  it('removes javascript: protocol', () => {
    const input = '<a href="javascript:evil()">click</a>';
    expect(sanitizeHtml(input)).not.toContain('javascript:');
  });

  it('preserves safe HTML', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    expect(sanitizeHtml(input)).toBe(input);
  });
});
