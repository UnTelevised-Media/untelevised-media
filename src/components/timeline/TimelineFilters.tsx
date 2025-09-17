'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Calendar,
  Star,
  AlertTriangle,
  Clock,
  MapPin,
  X,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TimelineFiltersProps {
  events: TimelineEvent[];
  categories?: TimelineCategory[];
  onFilterChange: (filteredEvents: TimelineEvent[]) => void;
  className?: string;
}

interface FilterState {
  searchTerm: string;
  selectedCategories: string[];
  selectedEventTypes: string[];
  selectedImportanceLevels: string[];
  dateRange: {
    start: string;
    end: string;
  };
  milestonesOnly: boolean;
  location: string;
}

const EVENT_TYPES = [
  { value: 'breaking', label: 'Breaking News', icon: AlertTriangle },
  { value: 'investigation', label: 'Investigation', icon: Search },
  { value: 'live', label: 'Live Event', icon: Clock },
  { value: 'political', label: 'Political', icon: Calendar },
  { value: 'social', label: 'Social Movement', icon: Calendar },
  { value: 'economic', label: 'Economic', icon: Calendar },
  { value: 'environmental', label: 'Environmental', icon: Calendar },
  { value: 'technology', label: 'Technology', icon: Calendar },
  { value: 'cultural', label: 'Cultural', icon: Calendar },
  { value: 'other', label: 'Other', icon: Calendar },
];

const IMPORTANCE_LEVELS = [
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
];

const TimelineFilters: React.FC<TimelineFiltersProps> = ({
  events,
  categories = [],
  onFilterChange,
  className = '',
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedCategories: [],
    selectedEventTypes: [],
    selectedImportanceLevels: [],
    dateRange: { start: '', end: '' },
    milestonesOnly: false,
    location: '',
  });

  // Apply filters whenever filter state changes
  useEffect(() => {
    const filteredEvents = events.filter((event) => {
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.location?.toLowerCase().includes(searchLower) ||
          event.tags?.some((tag) => tag.toLowerCase().includes(searchLower));

        if (!matchesSearch) {
          return false;
        }
      }

      // Category filter
      if (filters.selectedCategories.length > 0) {
        const eventCategoryIds = event.timelineCategories?.map((cat) => cat._id) || [];
        if (!filters.selectedCategories.some((catId) => eventCategoryIds.includes(catId))) {
          return false;
        }
      }

      // Event type filter
      if (filters.selectedEventTypes.length > 0) {
        if (!filters.selectedEventTypes.includes(event.eventType)) {
          return false;
        }
      }

      // Importance level filter
      if (filters.selectedImportanceLevels.length > 0) {
        if (!filters.selectedImportanceLevels.includes(event.importanceLevel)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const eventDate = new Date(event.eventDate);
        if (filters.dateRange.start && eventDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && eventDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }

      // Milestone filter
      if (filters.milestonesOnly && !event.isMilestone) {
        return false;
      }

      // Location filter
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        if (!event.location?.toLowerCase().includes(locationLower)) {
          return false;
        }
      }

      return true;
    });

    onFilterChange(filteredEvents);
  }, [filters, events, onFilterChange]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (
    key: 'selectedCategories' | 'selectedEventTypes' | 'selectedImportanceLevels',
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      selectedCategories: [],
      selectedEventTypes: [],
      selectedImportanceLevels: [],
      dateRange: { start: '', end: '' },
      milestonesOnly: false,
      location: '',
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) {
      count++;
    }
    if (filters.selectedCategories.length > 0) {
      count++;
    }
    if (filters.selectedEventTypes.length > 0) {
      count++;
    }
    if (filters.selectedImportanceLevels.length > 0) {
      count++;
    }
    if (filters.dateRange.start || filters.dateRange.end) {
      count++;
    }
    if (filters.milestonesOnly) {
      count++;
    }
    if (filters.location) {
      count++;
    }
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`timeline-filters ${className}`}>
      {/* Search Bar */}
      <div className='mb-4 flex flex-wrap items-center gap-4'>
        <div className='relative min-w-64 flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-400' />
          <Input
            type='text'
            placeholder='Search timeline events...'
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className='pl-10'
          />
        </div>

        <Button
          variant='outline'
          onClick={() => setShowFilters(!showFilters)}
          className='relative flex items-center gap-2'
        >
          <SlidersHorizontal className='h-4 w-4' />
          Filters
          {activeFilterCount > 0 && (
            <Badge className='ml-1 flex h-5 w-5 items-center justify-center p-0 text-xs'>
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant='ghost'
            size='sm'
            onClick={clearAllFilters}
            className='text-slate-600 hover:text-slate-900'
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='space-y-6 rounded-lg border bg-slate-50 p-6 dark:bg-slate-900'
          >
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <h4 className='mb-3 flex items-center gap-2 text-sm font-medium'>
                    <Filter className='h-4 w-4' />
                    Categories
                  </h4>
                  <div className='max-h-32 space-y-2 overflow-y-auto'>
                    {categories.map((category) => (
                      <label key={category._id} className='flex cursor-pointer items-center gap-2'>
                        <input
                          type='checkbox'
                          checked={filters.selectedCategories.includes(category._id)}
                          onChange={() => toggleArrayFilter('selectedCategories', category._id)}
                          className='rounded'
                        />
                        <span className='text-sm'>{category.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Types */}
              <div>
                <h4 className='mb-3 flex items-center gap-2 text-sm font-medium'>
                  <Calendar className='h-4 w-4' />
                  Event Types
                </h4>
                <div className='max-h-32 space-y-2 overflow-y-auto'>
                  {EVENT_TYPES.map((type) => (
                    <label key={type.value} className='flex cursor-pointer items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={filters.selectedEventTypes.includes(type.value)}
                        onChange={() => toggleArrayFilter('selectedEventTypes', type.value)}
                        className='rounded'
                      />
                      <type.icon className='h-3 w-3' />
                      <span className='text-sm'>{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Importance Levels */}
              <div>
                <h4 className='mb-3 flex items-center gap-2 text-sm font-medium'>
                  <AlertTriangle className='h-4 w-4' />
                  Importance
                </h4>
                <div className='space-y-2'>
                  {IMPORTANCE_LEVELS.map((level) => (
                    <label key={level.value} className='flex cursor-pointer items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={filters.selectedImportanceLevels.includes(level.value)}
                        onChange={() => toggleArrayFilter('selectedImportanceLevels', level.value)}
                        className='rounded'
                      />
                      <div className={`h-3 w-3 rounded-full ${level.color}`} />
                      <span className='text-sm'>{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Filters Row */}
            <div className='grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 dark:border-slate-700 md:grid-cols-3'>
              {/* Date Range */}
              <div>
                <h4 className='mb-2 text-sm font-medium'>Date Range</h4>
                <div className='space-y-2'>
                  <Input
                    type='date'
                    placeholder='Start date'
                    value={filters.dateRange.start}
                    onChange={(e) =>
                      updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })
                    }
                    className='text-sm'
                  />
                  <Input
                    type='date'
                    placeholder='End date'
                    value={filters.dateRange.end}
                    onChange={(e) =>
                      updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })
                    }
                    className='text-sm'
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className='mb-2 flex items-center gap-2 text-sm font-medium'>
                  <MapPin className='h-4 w-4' />
                  Location
                </h4>
                <Input
                  type='text'
                  placeholder='Filter by location...'
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  className='text-sm'
                />
              </div>

              {/* Special Filters */}
              <div>
                <h4 className='mb-2 text-sm font-medium'>Special Filters</h4>
                <label className='flex cursor-pointer items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={filters.milestonesOnly}
                    onChange={(e) => updateFilter('milestonesOnly', e.target.checked)}
                    className='rounded'
                  />
                  <Star className='h-3 w-3 text-yellow-500' />
                  <span className='text-sm'>Milestones only</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className='mt-4 flex flex-wrap items-center gap-2'>
          <span className='text-sm text-slate-600 dark:text-slate-400'>Active filters:</span>

          {filters.searchTerm && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              Search: &quot;{filters.searchTerm}&quot;
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => updateFilter('searchTerm', '')}
              />
            </Badge>
          )}

          {filters.selectedCategories.map((catId) => {
            const category = categories.find((c) => c._id === catId);
            return category ? (
              <Badge key={catId} variant='secondary' className='flex items-center gap-1'>
                {category.title}
                <X
                  className='h-3 w-3 cursor-pointer'
                  onClick={() => toggleArrayFilter('selectedCategories', catId)}
                />
              </Badge>
            ) : null;
          })}

          {filters.selectedEventTypes.map((type) => (
            <Badge key={type} variant='secondary' className='flex items-center gap-1'>
              {EVENT_TYPES.find((t) => t.value === type)?.label}
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => toggleArrayFilter('selectedEventTypes', type)}
              />
            </Badge>
          ))}

          {filters.milestonesOnly && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <Star className='h-3 w-3' />
              Milestones
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => updateFilter('milestonesOnly', false)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default TimelineFilters;
