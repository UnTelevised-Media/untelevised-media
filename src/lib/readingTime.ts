// src/lib/readingTime.ts

const WORDS_PER_MINUTE = 238;

interface PortableTextSpan {
  _type: string;
  text?: string;
}

interface PortableTextBlock {
  _type: string;
  children?: PortableTextSpan[];
}

/**
 * Estimates reading time from a Portable Text body array.
 * Extracts text from `block` nodes only (skips images, embeds, etc).
 * Average adult reading speed: 238 words per minute.
 *
 * @returns number of minutes, minimum 1
 */
export function estimateReadingTime(body: PortableTextBlock[]): number {
  if (!body || !Array.isArray(body) || body.length === 0) return 1;

  const text = body
    .filter((block) => block._type === 'block')
    .map((block) => {
      if (!block.children) return '';
      return block.children
        .filter((child) => child._type === 'span' && typeof child.text === 'string')
        .map((child) => child.text ?? '')
        .join(' ');
    })
    .join(' ')
    .trim();

  if (!text) return 1;

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

/**
 * Estimates reading time from a pre-computed word count (e.g. from GROQ).
 * Used in card components where the full body is not fetched.
 */
export function readingTimeFromWordCount(wordCount: number | null | undefined): number {
  if (!wordCount || wordCount <= 0) return 1;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

/**
 * Formats a reading time in minutes to a display string.
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

/**
 * Convenience: estimate from body and format in one call.
 */
export function getReadingTime(body: PortableTextBlock[] | null | undefined): string {
  if (!body) return '1 min read';
  return formatReadingTime(estimateReadingTime(body));
}
