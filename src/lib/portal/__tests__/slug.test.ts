// src/lib/portal/__tests__/slug.test.ts
// Tests for the slug-generation logic extracted from ArticleEditorForm.
// This is the same function used inline in the component — duplicated here
// so it can be tested without a JSDOM/React mount.

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

describe('titleToSlug', () => {
  it('converts spaces to hyphens', () => {
    expect(titleToSlug('Hello World')).toBe('hello-world');
  });

  it('lowercases the input', () => {
    expect(titleToSlug('BREAKING NEWS')).toBe('breaking-news');
  });

  it('strips special characters', () => {
    expect(titleToSlug("Atlanta's Mayor: What's Next?")).toBe('atlantas-mayor-whats-next');
  });

  it('collapses multiple spaces and hyphens', () => {
    expect(titleToSlug('A  B   C---D')).toBe('a-b-c-d');
  });

  it('truncates at 100 characters', () => {
    const long = 'a'.repeat(200);
    expect(titleToSlug(long)).toHaveLength(100);
  });

  it('handles an empty string', () => {
    expect(titleToSlug('')).toBe('');
  });

  it('handles a title that is all special chars', () => {
    expect(titleToSlug('!!!')).toBe('');
  });
});
