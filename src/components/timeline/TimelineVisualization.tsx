'use client';

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Star, AlertTriangle, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import TimelineFilters from './TimelineFilters';
import TimelineNavigation from './TimelineNavigation';
import urlForImage from '@/util/urlForImage';
import formatDate from '@/util/formatDate';

interface TimelineVisualizationProps {
  events: TimelineEvent[];
  categories?: TimelineCategory[];
  initialZoomLevel?: 'year' | 'month' | 'week' | 'day' | 'hour';
  className?: string;
}

type ZoomLevel = 'year' | 'month' | 'week' | 'day' | 'hour';

const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({
  events,
  categories = [],
  initialZoomLevel = 'month',
  className = '',
}) => {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(initialZoomLevel);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>(events);
  const [, setCurrentViewDate] = useState(new Date());

  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });

  // Sort events by date
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
  }, [filteredEvents]);

  // Handle filter changes
  const handleFilterChange = (newFilteredEvents: TimelineEvent[]) => {
    setFilteredEvents(newFilteredEvents);
  };

  // Handle event selection
  const handleEventSelect = (event: TimelineEvent) => {
    setSelectedEvent(event);
  };

  // Handle time range changes
  const handleTimeRangeChange = (startDate: Date, _endDate: Date) => {
    setCurrentViewDate(startDate);
  };

  // Get importance level styling
  const getImportanceStyle = (level: string) => {
    switch (level) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20';
      case 'medium':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'low':
        return 'border-gray-500 bg-gray-50 dark:bg-gray-950/20';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  // Get event type icon
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'breaking':
        return <AlertTriangle className='h-4 w-4' />;
      case 'investigation':
        return <Search className='h-4 w-4' />;
      case 'live':
        return <Clock className='h-4 w-4' />;
      default:
        return <Calendar className='h-4 w-4' />;
    }
  };

  // Handle mouse drag for timeline scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!timelineRef.current) {
      return;
    }
    setIsDragging(true);
    setDragStart({
      x: e.pageX - timelineRef.current.offsetLeft,
      scrollLeft: timelineRef.current.scrollLeft,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current) {
      return;
    }
    e.preventDefault();
    const x = e.pageX - timelineRef.current.offsetLeft;
    const walk = (x - dragStart.x) * 2;
    timelineRef.current.scrollLeft = dragStart.scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className={`timeline-visualization ${className}`}>
      {/* Timeline Filters */}
      <div className='mb-6'>
        <TimelineFilters
          events={events}
          categories={categories}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Timeline Navigation */}
      <div className='mb-6'>
        <TimelineNavigation
          events={sortedEvents}
          currentZoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          onEventSelect={handleEventSelect}
          onTimeRangeChange={handleTimeRangeChange}
        />
      </div>

      {/* Timeline */}
      <div className='relative'>
        <div
          ref={timelineRef}
          className='scrollbar-hide cursor-grab overflow-x-auto active:cursor-grabbing'
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className='relative min-w-full' style={{ width: `${sortedEvents.length * 300}px` }}>
            {/* Timeline Line */}
            <div className='absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 transform bg-slate-300 dark:bg-slate-600' />

            {/* Events */}
            <div className='flex items-center justify-start gap-8 py-8'>
              {sortedEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='relative w-72 flex-shrink-0'
                >
                  {/* Event Card */}
                  <div
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg ${getImportanceStyle(event.importanceLevel)} ${event.isMilestone ? 'ring-2 ring-yellow-400' : ''} `}
                    onClick={() => setSelectedEvent(event)}
                  >
                    {/* Milestone Star */}
                    {event.isMilestone && (
                      <div className='absolute -right-2 -top-2'>
                        <Star className='h-6 w-6 fill-current text-yellow-500' />
                      </div>
                    )}

                    {/* Event Image */}
                    {event.mainImage && (
                      <div className='relative mb-3 h-32 w-full overflow-hidden rounded'>
                        <Image
                          src={urlForImage(event.mainImage)?.url() ?? ''}
                          alt={event.mainImage.alt ?? event.title}
                          fill
                          className='object-cover'
                        />
                      </div>
                    )}

                    {/* Event Content */}
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400'>
                        {getEventTypeIcon(event.eventType)}
                        <span className='capitalize'>{event.eventType}</span>
                        {event.location && (
                          <>
                            <MapPin className='h-3 w-3' />
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>

                      <h3 className='line-clamp-2 text-sm font-semibold'>{event.title}</h3>

                      <p className='line-clamp-3 text-xs text-slate-600 dark:text-slate-400'>
                        {event.description}
                      </p>

                      <div className='text-xs font-medium text-slate-700 dark:text-slate-300'>
                        {formatDate(event.eventDate)}
                      </div>

                      {/* Categories */}
                      {event.timelineCategories && event.timelineCategories.length > 0 && (
                        <div className='flex flex-wrap gap-1'>
                          {event.timelineCategories.slice(0, 2).map((category) => (
                            <Badge key={category._id} variant='secondary' className='text-xs'>
                              {category.title}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Timeline Connector */}
                    <div className='absolute -bottom-4 left-1/2 top-1/2 w-0.5 -translate-x-1/2 transform bg-slate-400 dark:bg-slate-500' />
                    <div className='absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-2 border-slate-400 bg-white dark:border-slate-500 dark:bg-slate-800' />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-slate-800'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='space-y-4'>
                <div className='flex items-start justify-between'>
                  <h2 className='text-xl font-bold'>{selectedEvent.title}</h2>
                  <Button variant='ghost' size='sm' onClick={() => setSelectedEvent(null)}>
                    ×
                  </Button>
                </div>

                {selectedEvent.mainImage && (
                  <div className='relative h-48 w-full overflow-hidden rounded'>
                    <Image
                      src={urlForImage(selectedEvent.mainImage)?.url() ?? ''}
                      alt={selectedEvent.mainImage.alt ?? selectedEvent.title}
                      fill
                      className='object-cover'
                    />
                  </div>
                )}

                <div className='space-y-2'>
                  <p className='text-slate-600 dark:text-slate-400'>{selectedEvent.description}</p>

                  <div className='flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400'>
                    <span>{formatDate(selectedEvent.eventDate)}</span>
                    {selectedEvent.location && (
                      <span className='flex items-center gap-1'>
                        <MapPin className='h-3 w-3' />
                        {selectedEvent.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className='flex justify-end'>
                  <Link href={`/timeline/event/${selectedEvent.slug.current}`}>
                    <Button>View Full Details</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimelineVisualization;
