'use client';

import React, { useState, useMemo, useTransition } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Clock,
  MapPin,
  Tag,
  Loader2,
} from 'lucide-react';

import PastEventCard from '@/components/cards/PastEventCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { loadMorePastEvents } from '@/lib/actions/pastEvents';

interface PastEventsPageProps {
  initialEvents: LiveEvent[];
}

type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';
type ViewMode = 'grid' | 'list';

const PastEventsPage: React.FC<PastEventsPageProps> = ({ initialEvents }) => {
  const [events, setEvents] = useState<LiveEvent[]>(initialEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [displayCount, setDisplayCount] = useState(12);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Extract unique tags from events
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    events.forEach((event) => {
      event.eventTag?.forEach((tag) => {
        if (tag.title) tags.add(tag.title);
      });
    });
    return Array.from(tags).sort();
  }, [events]);

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter((event) => {
      const matchesSearch =
        !searchTerm ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTag = !selectedTag || event.eventTag?.some((tag) => tag.title === selectedTag);

      return matchesSearch && matchesTag;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
        case 'date-asc':
          return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchTerm, sortBy, selectedTag]);

  const displayedEvents = filteredAndSortedEvents.slice(0, displayCount);
  const showLoadMore = displayedEvents.length < filteredAndSortedEvents.length || hasMoreEvents;

  const handleLoadMore = () => {
    if (searchTerm || selectedTag || sortBy !== 'date-desc') {
      // For filtered results, just show more from current filtered set
      setDisplayCount((prev) => prev + 12);
    } else {
      // For unfiltered results, load more from server
      startTransition(async () => {
        try {
          const result = await loadMorePastEvents(events.length, events.length + 12);
          if (result.events.length > 0) {
            setEvents((prev) => [...prev, ...result.events]);
            setHasMoreEvents(result.hasMore);
          } else {
            setHasMoreEvents(false);
          }
        } catch (error) {
          console.error('Error loading more events:', error);
          setHasMoreEvents(false);
        }
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    setSortBy('date-desc');
  };

  if (events.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/50'>
          <Clock className='h-6 w-6 text-untele/50' />
        </div>
        <h3 className='mb-2 text-xl font-semibold text-slate-300'>No past events available</h3>
        <p className='text-slate-500'>
          Check back soon as we continue to archive our live event coverage
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Filters and Controls */}
      <div className='space-y-4'>
        {/* Search Bar */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='Search events by title, description, or location...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-500 focus:border-untele focus:outline-none focus:ring-2 focus:ring-untele/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400'
          />
        </div>

        {/* Filter Controls */}
        <div className='flex flex-wrap items-center gap-4'>
          {/* Tag Filter */}
          {availableTags.length > 0 && (
            <div className='flex items-center gap-2'>
              <Tag className='h-4 w-4 text-slate-600 dark:text-slate-400' />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white'
              >
                <option value=''>All Categories</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Options */}
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-slate-600 dark:text-slate-400' />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white'
            >
              <option value='date-desc'>Newest First</option>
              <option value='date-asc'>Oldest First</option>
              <option value='title-asc'>Title A-Z</option>
              <option value='title-desc'>Title Z-A</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className='flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-600 dark:bg-slate-800'>
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-untele text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              <Grid3X3 className='h-4 w-4' />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-untele text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              <List className='h-4 w-4' />
            </button>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedTag || sortBy !== 'date-desc') && (
            <Button
              onClick={clearFilters}
              variant='outline'
              size='sm'
              className='text-slate-600 dark:text-slate-400'
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results Summary */}
        <div className='flex items-center justify-between text-sm text-slate-600 dark:text-slate-400'>
          <span>
            Showing {displayedEvents.length} of {filteredAndSortedEvents.length} events
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedTag && ` in "${selectedTag}"`}
          </span>
        </div>
      </div>

      {/* Events Grid/List */}
      {filteredAndSortedEvents.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 text-center'>
          <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/50'>
            <Search className='h-6 w-6 text-untele/50' />
          </div>
          <h3 className='mb-2 text-xl font-semibold text-slate-300'>No events found</h3>
          <p className='mb-4 text-slate-500'>Try adjusting your search terms or filters</p>
          <Button onClick={clearFilters} variant='outline'>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'
            }
          >
            {displayedEvents.map((event) => (
              <PastEventCard
                key={event._id}
                event={event}
                variant={viewMode === 'list' ? 'compact' : 'default'}
                showRelated={true}
              />
            ))}
          </div>

          {/* Load More Button */}
          {showLoadMore && (
            <div className='flex justify-center pt-8'>
              <Button
                onClick={handleLoadMore}
                size='lg'
                disabled={isPending}
                className='bg-untele text-white hover:bg-untele/90 disabled:opacity-50'
              >
                {isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Loading...
                  </>
                ) : (
                  'Load More Events'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PastEventsPage;
