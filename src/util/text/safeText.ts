/**
 * Guard against Sanity fields that may be stored as a block object instead of a plain
 * string (e.g. from old schema versions or programmatic inserts). Returns the string
 * value if it is a string, or extracts the `content` field if present, otherwise null.
 */
export default function safeText(value: unknown): string | null {
  if (typeof value === 'string') {
    return value || null;
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const v = value as Record<string, unknown>;
    if (typeof v.content === 'string') {
      return v.content || null;
    }
    if (typeof v.text === 'string') {
      return v.text || null;
    }
  }
  return null;
}
