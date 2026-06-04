'use server';

import { sanityFetch } from '@/lib/sanity/lib/fetch';
import { queryPastEventsWithPagination } from '@/lib/sanity/lib/queries';

export async function loadMorePastEvents(
  start: number = 0,
  end: number = 12
): Promise<{ events: LiveEvent[]; hasMore: boolean }> {
  try {
    // Fetch events with pagination
    const { data: events } = await sanityFetch({
      query: queryPastEventsWithPagination,
      params: { start, end },
      tags: ['liveEvent'],
    });

    // Check if there are more events by fetching one extra
    const { data: nextBatch } = await sanityFetch({
      query: queryPastEventsWithPagination,
      params: { start: end, end: end + 1 },
      tags: ['liveEvent'],
    });

    return {
      events: (events as LiveEvent[]) || [],
      hasMore: ((nextBatch as LiveEvent[])?.length || 0) > 0,
    };
  } catch (error) {
    console.error('Error loading more past events:', error);
    return {
      events: [],
      hasMore: false,
    };
  }
}

export async function searchPastEvents(
  searchTerm: string,
  tagFilter?: string,
  sortBy: 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' = 'date-desc',
  start: number = 0,
  end: number = 12
): Promise<{ events: LiveEvent[]; hasMore: boolean; total: number }> {
  try {
    // Build dynamic query based on filters
    let filterConditions = `_type=='liveEvent' && isCurrentEvent == false`;

    if (searchTerm) {
      const searchCondition = `(
        title match "${searchTerm}*" ||
        description match "${searchTerm}*" ||
        location match "${searchTerm}*"
      )`;
      filterConditions += ` && ${searchCondition}`;
    }

    if (tagFilter) {
      filterConditions += ` && "${tagFilter}" in eventTag[]->title`;
    }

    // Determine sort order
    let orderClause = '';
    switch (sortBy) {
      case 'date-desc':
        orderClause = '| order(eventDate desc)';
        break;
      case 'date-asc':
        orderClause = '| order(eventDate asc)';
        break;
      case 'title-asc':
        orderClause = '| order(title asc)';
        break;
      case 'title-desc':
        orderClause = '| order(title desc)';
        break;
    }

    const searchQuery = `
      *[${filterConditions}] {
        ...,
        description,
        title,
        slug,
        eventDate,
        mainImage,
        subtitle,
        location,
        videoLink,
        keywords,
        eventTag[]->,
        keyEvent[]->{
          title,
          slug,
          eventDate,
          description
        },
        relatedArticles[]-> {
          slug,
          _id,
          title,
          _createdAt,
          description,
          eventDate,
          publishedAt,
          mainImage
        }
      } 
      ${orderClause}
    `;

    // Get total count
    const countQuery = `count(*[${filterConditions}])`;

    // Get paginated results
    const paginatedQuery = `${searchQuery}[${start}...${end}]`;

    const [{ data: events }, { data: total }] = await Promise.all([
      sanityFetch({
        query: paginatedQuery,
        tags: ['liveEvent'],
      }),
      sanityFetch({
        query: countQuery,
        tags: ['liveEvent'],
      }),
    ]);

    return {
      events: (events as LiveEvent[]) || [],
      hasMore: end < ((total as number) || 0),
      total: (total as number) || 0,
    };
  } catch (error) {
    console.error('Error searching past events:', error);
    return {
      events: [],
      hasMore: false,
      total: 0,
    };
  }
}
