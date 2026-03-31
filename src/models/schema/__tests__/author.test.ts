// src/models/schema/__tests__/author.test.ts
// Verifies the author Sanity schema includes the clerkId field
// with the correct security constraints (readOnly, hidden callback).
//
// NOTE: `sanity` is mocked because the package is ESM-only and cannot be
// required directly by Jest's CommonJS test runner. `defineField` and
// `defineType` are identity wrappers at runtime — mocking them with passthrough
// functions is the standard Jest pattern for Sanity schema testing and does not
// change the actual field definitions being tested.

jest.mock('sanity', () => ({
  defineField: (field: unknown) => field,
  defineType: (schema: unknown) => schema,
}));

// lucide-react is also ESM — mock the icon import used by other schemas
jest.mock('lucide-react', () => ({ Link: null, FileText: null }));

import authorSchema from '../author';

const fields = authorSchema.fields as Array<Record<string, unknown>>;
const clerkIdField = fields.find((f) => f.name === 'clerkId');

describe('author schema — clerkId field', () => {
  it('has a clerkId field', () => {
    expect(clerkIdField).toBeDefined();
  });

  it('is of type string', () => {
    expect(clerkIdField?.type).toBe('string');
  });

  it('is marked readOnly', () => {
    expect(clerkIdField?.readOnly).toBe(true);
  });

  it('has a descriptive description mentioning Admin', () => {
    expect(typeof clerkIdField?.description).toBe('string');
    expect((clerkIdField?.description as string).toLowerCase()).toContain('admin');
  });

  it('hidden callback hides the field for non-administrators', () => {
    const hidden = clerkIdField?.hidden;
    if (typeof hidden !== 'function') {
      throw new Error('Expected hidden to be a function');
    }
    const nonAdmin = { currentUser: { roles: [{ name: 'editor' }] } };
    expect(hidden(nonAdmin as never)).toBe(true);
  });

  it('hidden callback shows the field for Sanity administrators', () => {
    const hidden = clerkIdField?.hidden;
    if (typeof hidden !== 'function') {
      throw new Error('Expected hidden to be a function');
    }
    const admin = { currentUser: { roles: [{ name: 'administrator' }] } };
    expect(hidden(admin as never)).toBe(false);
  });

  it('hidden callback hides the field when currentUser is null', () => {
    const hidden = clerkIdField?.hidden;
    if (typeof hidden !== 'function') {
      throw new Error('Expected hidden to be a function');
    }
    expect(hidden({ currentUser: null } as never)).toBe(true);
  });
});
