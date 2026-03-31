// src/lib/portal/sanitize.ts
// Input sanitization for portal form submissions.
// All user text is sanitized before writing to Sanity.

/**
 * Strip HTML tags and normalize whitespace from a plain-text string.
 * Prevents script injection and XSS in text fields stored as strings in Sanity.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // strip all HTML tags
    .replace(/[<>'"]/g, (c) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      };
      return map[c] ?? c;
    })
    .trim();
}

/**
 * Lightweight HTML sanitizer for rich-text content that goes into Portable Text blocks.
 * At the portal layer this is a last-resort safety net — Tiptap's output is already
 * sanitized through the Portable Text serializer. We strip any script/iframe/object
 * tags that should never appear in article content.
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // remove inline event handlers
    .replace(/javascript:/gi, '');
}
