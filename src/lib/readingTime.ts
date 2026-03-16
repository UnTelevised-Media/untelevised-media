// src/lib/readingTime.ts

const WORDS_PER_MINUTE = 200;

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
 * Reading speed: 200 wpm (standard average adult pace).
 *
 * @returns number of minutes, minimum 1
 */
export function estimateReadingTime(body: PortableTextBlock[] | null | undefined): number {
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
 * Formats a reading time in minutes to a display string.
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

/**
 * Estimates reading time from body and returns a formatted string.
 * Single entry point — use this everywhere for consistent results.
 */
export function getReadingTime(body: PortableTextBlock[] | null | undefined): string {
  return formatReadingTime(estimateReadingTime(body));
}
