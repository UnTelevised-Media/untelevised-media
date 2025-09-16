'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Clock,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  SkipBack,
  SkipForward
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TimelineNavigationProps {
  events: TimelineEvent[];
  currentZoomLevel: 'year' | 'month' | 'week' | 'day' | 'hour';
  onZoomChange: (level: 'year' | 'month' | 'week' | 'day' | 'hour') => void;
  onEventSelect?: (event: TimelineEvent) => void;
  onTimeRangeChange?: (startDate: Date, endDate: Date) => void;
  className?: string;
}

type ZoomLevel = 'year' | 'month' | 'week' | 'day' | 'hour';

const ZOOM_LEVELS: ZoomLevel[] = ['year', 'month', 'week', 'day', 'hour'];

const ZOOM_LEVEL_INFO = {
  year: { label: 'Year View', icon: Calendar, step: 365 * 24 * 60 * 60 * 1000 },
  month: { label: 'Month View', icon: Calendar, step: 30 * 24 * 60 * 60 * 1000 },
  week: { label: 'Week View', icon: Calendar, step: 7 * 24 * 60 * 60 * 1000 },
  day: { label: 'Day View', icon: Clock, step: 24 * 60 * 60 * 1000 },
  hour: { label: 'Hour View', icon: Clock, step: 60 * 60 * 1000 },
};

const TimelineNavigation: React.FC<TimelineNavigationProps> = ({
  events,
  currentZoomLevel,
  onZoomChange,
  onEventSelect,
  onTimeRangeChange,
  className = '',
}) => {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2000); // milliseconds
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  );

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && sortedEvents.length > 0) {
      autoPlayRef.current = setInterval(() => {
        setCurrentEventIndex(prev => {
          const nextIndex = (prev + 1) % sortedEvents.length;
          if (onEventSelect && sortedEvents[nextIndex]) {
            onEventSelect(sortedEvents[nextIndex]);
          }
          return nextIndex;
        });
      }, playbackSpeed);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, playbackSpeed, sortedEvents, onEventSelect]);

  // Zoom controls
  const zoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(currentZoomLevel);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      onZoomChange(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const zoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(currentZoomLevel);
    if (currentIndex > 0) {
      onZoomChange(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const resetZoom = () => {
    onZoomChange('month');
  };

  // Navigation controls
  const goToNextEvent = () => {
    if (sortedEvents.length > 0) {
      const nextIndex = Math.min(currentEventIndex + 1, sortedEvents.length - 1);
      setCurrentEventIndex(nextIndex);
      if (onEventSelect && sortedEvents[nextIndex]) {
        onEventSelect(sortedEvents[nextIndex]);
      }
    }
  };

  const goToPreviousEvent = () => {
    if (sortedEvents.length > 0) {
      const prevIndex = Math.max(currentEventIndex - 1, 0);
      setCurrentEventIndex(prevIndex);
      if (onEventSelect && sortedEvents[prevIndex]) {
        onEventSelect(sortedEvents[prevIndex]);
      }
    }
  };

  const goToFirstEvent = () => {
    if (sortedEvents.length > 0) {
      setCurrentEventIndex(0);
      if (onEventSelect && sortedEvents[0]) {
        onEventSelect(sortedEvents[0]);
      }
    }
  };

  const goToLastEvent = () => {
    if (sortedEvents.length > 0) {
      const lastIndex = sortedEvents.length - 1;
      setCurrentEventIndex(lastIndex);
      if (onEventSelect && sortedEvents[lastIndex]) {
        onEventSelect(sortedEvents[lastIndex]);
      }
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Time navigation
  const navigateTime = (direction: 'forward' | 'backward') => {
    const step = ZOOM_LEVEL_INFO[currentZoomLevel].step;
    const newDate = new Date(currentViewDate.getTime() + (direction === 'forward' ? step : -step));
    setCurrentViewDate(newDate);
    
    if (onTimeRangeChange) {
      const endDate = new Date(newDate.getTime() + step);
      onTimeRangeChange(newDate, endDate);
    }
  };

  const currentEvent = sortedEvents[currentEventIndex];
  const currentZoomInfo = ZOOM_LEVEL_INFO[currentZoomLevel];

  return (
    <div className={`timeline-navigation bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              disabled={currentZoomLevel === 'year'}
              className="rounded-r-none border-r border-slate-200 dark:border-slate-700"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <div className="px-3 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-700 flex items-center gap-2 min-w-32 justify-center">
              <currentZoomInfo.icon className="h-4 w-4" />
              <span className="capitalize">{currentZoomLevel}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              disabled={currentZoomLevel === 'hour'}
              className="rounded-l-none border-l border-slate-200 dark:border-slate-700"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={resetZoom}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Event Navigation */}
        {sortedEvents.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToFirstEvent}
                disabled={currentEventIndex === 0}
                className="rounded-r-none"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousEvent}
                disabled={currentEventIndex === 0}
                className="rounded-none border-x border-slate-200 dark:border-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 min-w-24 text-center">
                {currentEventIndex + 1} / {sortedEvents.length}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextEvent}
                disabled={currentEventIndex === sortedEvents.length - 1}
                className="rounded-none border-x border-slate-200 dark:border-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={goToLastEvent}
                disabled={currentEventIndex === sortedEvents.length - 1}
                className="rounded-l-none"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Auto-play Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoPlay}
                className={`flex items-center gap-2 ${isAutoPlaying ? 'bg-untele text-white' : ''}`}
              >
                {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isAutoPlaying ? 'Pause' : 'Play'}
              </Button>

              {isAutoPlaying && (
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="text-sm border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-800"
                >
                  <option value={500}>0.5s</option>
                  <option value={1000}>1s</option>
                  <option value={2000}>2s</option>
                  <option value={3000}>3s</option>
                  <option value={5000}>5s</option>
                </select>
              )}
            </div>
          </div>
        )}

        {/* Time Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTime('backward')}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous {currentZoomLevel}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTime('forward')}
            className="flex items-center gap-2"
          >
            Next {currentZoomLevel}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="flex items-center gap-2"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* Current Event Info */}
      {currentEvent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                {currentEvent.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {new Date(currentEvent.eventDate).toLocaleDateString()} 
                {currentEvent.location && ` • ${currentEvent.location}`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {currentEvent.isMilestone && (
                <Badge className="bg-yellow-500 text-yellow-900">
                  Milestone
                </Badge>
              )}
              <Badge 
                variant={currentEvent.importanceLevel === 'critical' ? 'destructive' : 'secondary'}
                className="capitalize"
              >
                {currentEvent.importanceLevel}
              </Badge>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline Progress Bar */}
      {sortedEvents.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
            <span>Timeline Progress</span>
            <span>{Math.round(((currentEventIndex + 1) / sortedEvents.length) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <motion.div
              className="bg-untele h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentEventIndex + 1) / sortedEvents.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineNavigation;
