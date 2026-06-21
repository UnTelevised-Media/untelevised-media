import type { SanityBookFormat } from '@/models/types/bookstore';

export default function formatBookFormatLabel(format: SanityBookFormat): string {
  if (format.formatType === 'physical') {
    return 'Physical Book';
  }
  if (format.formatType === 'digital') {
    return 'Digital Edition';
  }
  if (format.formatType === 'bundle') {
    return 'Physical + Digital Bundle';
  }
  return format.formatType;
}
