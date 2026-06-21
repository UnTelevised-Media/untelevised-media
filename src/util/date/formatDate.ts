type DateFormat = 'long' | 'short';

export default function formatDate(
  date: string | number | Date | null | undefined,
  format: DateFormat = 'long',
  fallback: string = ''
): string {
  if (!date) {
    return fallback;
  }

  const dateObj = new Date(date);

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return fallback;
  }

  // Check if the date is today (which might indicate a missing proper date)
  const today = new Date();
  const isToday = dateObj.toDateString() === today.toDateString();

  // If it's today and it's likely a _createdAt fallback, return fallback
  if (isToday) {
    return fallback;
  }

  const monthFormat = format === 'short' ? 'short' : 'long';

  return dateObj.toLocaleDateString('en-US', {
    day: 'numeric',
    month: monthFormat,
    year: 'numeric',
  });
}
