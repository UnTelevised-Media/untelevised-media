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

interface ArticleExtras {
  faqs?: Array<{ question: string; answer: string }> | null;
  sources?: Array<{ label: string; url?: string }> | null;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Estimates reading time from a Portable Text body array.
 * Optionally includes FAQ questions/answers and source labels.
 * Reading speed: 200 wpm (standard average adult pace).
 *
 * @returns number of minutes, minimum 1
 */
export function estimateReadingTime(
  body: PortableTextBlock[] | null | undefined,
  extras?: ArticleExtras
): number {
  let wordCount = 0;

  if (body && Array.isArray(body) && body.length > 0) {
    const bodyText = body
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
    wordCount += countWords(bodyText);
  }

  if (extras?.faqs?.length) {
    for (const faq of extras.faqs) {
      wordCount += countWords(faq.question ?? '');
      wordCount += countWords(faq.answer ?? '');
    }
  }

  if (extras?.sources?.length) {
    for (const source of extras.sources) {
      wordCount += countWords(source.label ?? '');
    }
  }

  if (wordCount === 0) return 1;
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
 * Convenience: estimate from body + optional extras and format in one call.
 */
export function getReadingTime(
  body: PortableTextBlock[] | null | undefined,
  extras?: ArticleExtras
): string {
  return formatReadingTime(estimateReadingTime(body, extras));
}
