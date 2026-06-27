// Extract YouTube video ID from various URL formats
export function getYoutubeVideoId(url: string): string | null {
  if (!url) {
    return null;
  }

  // Handle already-embed format
  if (url.includes('youtube.com/embed/')) {
    const match = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    return match?.[1] ?? null;
  }

  // Handle watch format: youtube.com/watch?v=ID
  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) {
    return watchMatch[1];
  }

  // Handle youtu.be short format: youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) {
    return shortMatch[1];
  }

  // Handle /v/ format: youtube.com/v/ID
  const vMatch = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]+)/);
  if (vMatch) {
    return vMatch[1];
  }

  return null;
}

// Convert any YouTube URL to embed format
export function getYoutubeEmbedUrl(
  url: string,
  _options?: { allowFullscreen?: boolean }
): string | null {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) {
    return null;
  }

  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);

  // Add helpful parameters
  embedUrl.searchParams.set('rel', '0'); // Don't show related videos
  embedUrl.searchParams.set('modestbranding', '1'); // Minimal branding

  return embedUrl.toString();
}
