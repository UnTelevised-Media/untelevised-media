export default function formatDate(date: string | number | Date | null | undefined): string {
  if (!date) {
    return '';
  }

  const dateObj = new Date(date);

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  // Check if the date is today (which might indicate a missing proper date)
  const today = new Date();
  const isToday = dateObj.toDateString() === today.toDateString();

  // If it's today and it's likely a _createdAt fallback, return empty
  if (isToday) {
    return '';
  }

  return dateObj.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
