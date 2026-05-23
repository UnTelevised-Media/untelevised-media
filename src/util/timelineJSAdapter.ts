/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// TimelineJS Data Adapter
// Transforms Sanity CMS timeline data into TimelineJS-compatible format

import urlForImage from './urlForImage';
import formatDate from './formatDate';

export interface TimelineJSSlide {
  start_date: {
    year: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
  };
  end_date?: {
    year: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
  };
  text: {
    headline: string;
    text: string;
  };
  media?: {
    url: string;
    caption?: string;
    credit?: string;
    thumbnail?: string;
  };
  group?: string;
  display_date?: string;
  background?: {
    url?: string;
    color?: string;
  };
  autolink?: boolean;
  unique_id?: string;
  [key: string]: unknown; // Allow additional properties
}

export interface TimelineJSData {
  title?: {
    media?: {
      url: string;
      caption?: string;
      credit?: string;
    };
    text: {
      headline: string;
      text: string;
    };
  };
  events: TimelineJSSlide[];
  scale?: string;
}

/**
 * Converts a date string to TimelineJS date format
 */
function convertToTimelineJSDate(dateString: string) {
  const date = new Date(dateString);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // TimelineJS uses 1-based months
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
  };
}

/**
 * Converts Sanity media to TimelineJS media format
 */
function convertMedia(event: TimelineEvent): TimelineJSSlide['media'] {
  // Priority 1: Main image
  if (event.mainImage) {
    return {
      url: urlForImage(event.mainImage).width(1200).height(675).url(),
      caption: event.mainImage.alt ?? event.title,
      thumbnail: urlForImage(event.mainImage).width(300).height(200).url(),
      credit: event.mainImage.credit ?? undefined,
    };
  }

  // Priority 2: Media attachments
  if (event.mediaAttachments && event.mediaAttachments.length > 0) {
    const firstMedia = event.mediaAttachments[0];

    if (firstMedia._type === 'video') {
      // Support for various video platforms
      let videoUrl = firstMedia.url;

      // Convert YouTube URLs to embed format
      if (videoUrl.includes('youtube.com/watch?v=')) {
        const videoId = videoUrl.split('v=')[1]?.split('&')[0];
        videoUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        videoUrl = `https://www.youtube.com/embed/${videoId}`;
      }

      // Convert Vimeo URLs to embed format
      if (videoUrl.includes('vimeo.com/')) {
        const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
        videoUrl = `https://player.vimeo.com/video/${videoId}`;
      }

      return {
        url: videoUrl,
        caption: firstMedia.title ?? event.title,
        credit: ((firstMedia as Record<string, unknown>).credit as string) ?? undefined,
      };
    } else if (firstMedia._type === 'image') {
      return {
        url: urlForImage(firstMedia).width(1200).height(675).url(),
        caption: firstMedia.alt ?? firstMedia.caption ?? event.title,
        thumbnail: urlForImage(firstMedia).width(300).height(200).url(),
        credit: firstMedia.credit ?? undefined,
      };
    }
  }

  // Priority 3: External links with media
  if (event.externalLinks && event.externalLinks.length > 0) {
    const mediaLink = event.externalLinks.find(
      (link) =>
        link.url.includes('youtube.com') ||
        link.url.includes('youtu.be') ||
        link.url.includes('vimeo.com') ||
        link.url.includes('twitter.com') ||
        link.url.includes('instagram.com')
    );

    if (mediaLink) {
      return {
        url: mediaLink.url,
        caption: mediaLink.title ?? event.title,
        credit: mediaLink.description ?? undefined,
      };
    }
  }

  return undefined;
}

/**
 * Converts detailed description (block content) to HTML string
 */
function convertBlockContentToHTML(blocks: Block[]): string {
  if (!blocks || blocks.length === 0) {
    return '';
  }

  return blocks
    .map((block) => {
      if (block._type === 'block') {
        const children = block.children ?? [];
        const text = children
          .map((child) => {
            let content = child.text ?? '';
            if (child.marks?.includes('strong')) {
              content = `<strong>${content}</strong>`;
            }
            if (child.marks?.includes('em')) {
              content = `<em>${content}</em>`;
            }
            return content;
          })
          .join('');

        switch (block.style) {
          case 'h1':
            return `<h1>${text}</h1>`;
          case 'h2':
            return `<h2>${text}</h2>`;
          case 'h3':
            return `<h3>${text}</h3>`;
          case 'h4':
            return `<h4>${text}</h4>`;
          case 'blockquote':
            return `<blockquote>${text}</blockquote>`;
          default:
            return `<p>${text}</p>`;
        }
      } else if (block._type === 'image') {
        const imageUrl = urlForImage(block as any)
          .width(600)
          .url();
        const alt = (block as any).alt ?? '';
        return `<img src="${imageUrl}" alt="${alt}" style="max-width: 100%; height: auto;" />`;
      }
      return '';
    })
    .join('');
}

/**
 * Converts a single timeline event to TimelineJS slide format
 */
export function convertEventToSlide(event: TimelineEvent): TimelineJSSlide {
  const slide: TimelineJSSlide = {
    start_date: convertToTimelineJSDate(event.eventDate),
    text: {
      headline: event.title,
      text: event.detailedDescription
        ? convertBlockContentToHTML(event.detailedDescription)
        : event.description || '',
    },
    unique_id: event._id,
    autolink: true,
  };

  // Add end date if available
  if (event.endDate) {
    slide.end_date = convertToTimelineJSDate(event.endDate);
  }

  // Add media
  const media = convertMedia(event);
  if (media) {
    slide.media = media;
  }

  // Add location as group if available
  if (event.location) {
    slide.group = event.location;
  }

  // Add custom display date if needed
  if (event.eventDate) {
    slide.display_date = formatDate(event.eventDate);
  }

  // Add background color based on importance level
  const importanceColors = {
    critical: '#ef4444', // red-500
    high: '#f97316', // orange-500
    medium: '#3b82f6', // blue-500
    low: '#6b7280', // gray-500
  };

  slide.background = {
    color: importanceColors[event.importanceLevel] || importanceColors.medium,
  };

  // Add custom attributes for CSS styling
  if (typeof window !== 'undefined') {
    // These will be added as data attributes to the timeline markers
    (slide as Record<string, unknown>).customAttributes = {
      'data-importance': event.importanceLevel,
      'data-milestone': event.isMilestone.toString(),
      'data-event-type': event.eventType,
      'data-event-id': event._id,
    };
  }

  return slide;
}

/**
 * Converts timeline data to TimelineJS format
 */
export function convertTimelineToTimelineJS(
  timeline: Timeline,
  events: TimelineEvent[]
): TimelineJSData {
  if (!timeline) {
    throw new Error('Timeline is required');
  }

  // Sort events by date
  const sortedEvents = [...(events || [])].sort(
    (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  );

  const timelineJSData: TimelineJSData = {
    events: sortedEvents.map(convertEventToSlide),
    scale: 'human', // Can be 'human' or 'cosmological'
  };

  // Add title slide if timeline has description
  if (timeline.title || timeline.description) {
    let titleText = '';
    if (timeline.description && Array.isArray(timeline.description)) {
      titleText = convertBlockContentToHTML(timeline.description);
    } else if (timeline.shortDescription) {
      titleText = timeline.shortDescription;
    }

    timelineJSData.title = {
      text: {
        headline: timeline.title,
        text: titleText,
      },
    };

    // Add title media if available
    const timelineWithImage = timeline as any;
    if (timelineWithImage.featuredImage) {
      timelineJSData.title.media = {
        url: urlForImage(timelineWithImage.featuredImage).width(1200).height(600).url(),
        caption: timelineWithImage.featuredImage.alt ?? timeline.title,
      };
    }
  }

  return timelineJSData;
}

/**
 * Validates TimelineJS data format
 */
export function validateTimelineJSData(data: TimelineJSData): boolean {
  if (!data.events || !Array.isArray(data.events)) return false;
  if (data.events.length === 0) return false;

  for (const event of data.events) {
    if (!event.start_date?.year) return false;
    if (!event.text?.headline) return false;
  }

  return true;
}
