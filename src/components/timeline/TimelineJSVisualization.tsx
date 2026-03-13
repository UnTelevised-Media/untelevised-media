/* eslint-disable no-console */
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  convertTimelineToTimelineJS,
  validateTimelineJSData,
  type TimelineJSData,
} from '@/util/timelineJSAdapter';
import '@/styles/timelinejs-custom.css';

interface TimelineJSVisualizationProps {
  timeline: Timeline;
  events: TimelineEvent[];
  className?: string;
  height?: string;
  options?: {
    hash_bookmark?: boolean;
    debug?: boolean;
    is_embed?: boolean;
    default_bg_color?: string;
    scale_factor?: number;
    initial_zoom?: number;
    zoom_sequence?: number[];
    timenav_position?: 'bottom' | 'top';
    optimal_tick_width?: number;
    base_class?: string;
    timenav_height?: number;
    timenav_height_percentage?: number;
    timenav_mobile_height_percentage?: number;
    timenav_height_min?: number;
    marker_height_min?: number;
    marker_width_min?: number;
    marker_padding?: number;
    start_at_slide?: number;
    start_at_end?: boolean;
    menubar_height?: number;
    use_bc?: boolean;
    duration?: number;
    ease?: string;
    dragging?: boolean;
    trackResize?: boolean;
    slide_padding_lr?: number;
    slide_default_fade?: string;
    language?: string;
    ga_property_id?: string;
    track_events?: string[];
  };
}

declare global {
  interface Window {
    TL?: {
      Timeline: new (
        containerId: string,
        data: TimelineJSData,
        options?: Record<string, unknown>
      ) => {
        updateDisplay: () => void;
        goTo: (slideIndex: number) => void;
        goToId: (slideId: string) => void;
        add: (data: Record<string, unknown>) => void;
        remove: (slideId: string) => void;
        getData: () => TimelineJSData;
        getSlide: (slideIndex: number) => Record<string, unknown>;
        getCurrentSlide: () => Record<string, unknown>;
        updateConfig: (options: Record<string, unknown>) => void;
      };
    };
  }
}

const TimelineJSVisualization: React.FC<TimelineJSVisualizationProps> = ({
  timeline,
  events,
  className = '',
  height = '600px',
  options = {},
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstanceRef = useRef<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Responsive options based on screen size
  const getResponsiveOptions = useCallback(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const isTablet = typeof window !== 'undefined' && window.innerWidth < 1024;

    return {
      hash_bookmark: false,
      debug: false,
      is_embed: false,
      default_bg_color: 'white',
      scale_factor: isMobile ? 1 : 2,
      initial_zoom: isMobile ? 1 : 2,
      timenav_position: 'bottom' as const,
      optimal_tick_width: isMobile ? 60 : 100,
      base_class: 'tl-timeline',
      timenav_height: isMobile ? 120 : 150,
      timenav_height_percentage: isMobile ? 35 : 25,
      timenav_mobile_height_percentage: 45,
      timenav_height_min: isMobile ? 100 : 150,
      marker_height_min: isMobile ? 20 : 30,
      marker_width_min: isMobile ? 60 : 100,
      marker_padding: isMobile ? 3 : 5,
      start_at_slide: 0,
      start_at_end: false,
      menubar_height: 0,
      use_bc: false,
      duration: isMobile ? 500 : 1000,
      ease: 'easeInOutQuint',
      dragging: true,
      trackResize: true,
      slide_padding_lr: isMobile ? 20 : isTablet ? 50 : 100,
      slide_default_fade: '0%',
      language: 'en',
      ...options,
    };
  }, [options]);

  // Load TimelineJS CSS and JS from CDN
  useEffect(() => {
    const loadTimelineJS = async () => {
      try {
        console.log('🔄 Starting TimelineJS loading process...');

        // Check if TimelineJS is already loaded
        if (window.TL) {
          console.log('✅ TimelineJS already loaded');
          setIsScriptLoaded(true);
          return;
        }

        console.log('📦 Loading TimelineJS CSS...');
        // Load CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css';
        cssLink.onload = () => console.log('✅ TimelineJS CSS loaded');
        cssLink.onerror = () => console.error('❌ Failed to load TimelineJS CSS');
        document.head.appendChild(cssLink);

        console.log('📦 Loading TimelineJS JavaScript...');
        // Load JavaScript
        const script = document.createElement('script');
        script.src = 'https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js';
        script.async = true;

        // Set up a timeout to detect hanging script loads
        const loadTimeout = setTimeout(() => {
          console.error('⏰ TimelineJS script loading timeout (10 seconds)');
          setError('TimelineJS library loading timeout');
          setIsLoading(false);
        }, 10000);

        script.onload = () => {
          clearTimeout(loadTimeout);
          console.log('✅ TimelineJS script loaded successfully');
          console.log('🔍 Checking window.TL:', !!window.TL);

          // Give a small delay for the library to initialize
          setTimeout(() => {
            if (window.TL) {
              console.log('✅ window.TL is available');
              setIsScriptLoaded(true);
            } else {
              console.error('❌ window.TL not available after script load');
              setError('TimelineJS library not properly initialized');
              setIsLoading(false);
            }
          }, 100);
        };

        script.onerror = (error) => {
          clearTimeout(loadTimeout);
          console.error('❌ Failed to load TimelineJS script from latest:', error);
          console.log('🔄 Trying fallback version...');

          // Try fallback version
          const fallbackScript = document.createElement('script');
          fallbackScript.src = 'https://cdn.knightlab.com/libs/timeline3/3.8.25/js/timeline.js';
          fallbackScript.async = true;

          const fallbackTimeout = setTimeout(() => {
            console.error('⏰ Fallback TimelineJS script loading timeout');
            setError('Failed to load TimelineJS library (both latest and fallback versions)');
            setIsLoading(false);
          }, 10000);

          fallbackScript.onload = () => {
            clearTimeout(fallbackTimeout);
            console.log('✅ Fallback TimelineJS script loaded successfully');
            setTimeout(() => {
              if (window.TL) {
                console.log('✅ window.TL is available from fallback');
                setIsScriptLoaded(true);
              } else {
                console.error('❌ window.TL not available after fallback script load');
                setError('TimelineJS library not properly initialized');
                setIsLoading(false);
              }
            }, 100);
          };

          fallbackScript.onerror = () => {
            clearTimeout(fallbackTimeout);
            console.error('❌ Failed to load fallback TimelineJS script');
            setError('Failed to load TimelineJS library');
            setIsLoading(false);
          };

          document.head.appendChild(fallbackScript);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('❌ Error in loadTimelineJS:', error);
        setError('Failed to initialize TimelineJS');
        setIsLoading(false);
      }
    };

    loadTimelineJS();
  }, []);

  // Initialize timeline when script is loaded
  useEffect(() => {
    console.log('🔄 Timeline initialization effect triggered');
    console.log('📊 State check:', {
      isScriptLoaded,
      hasTimelineRef: !!timelineRef.current,
      hasWindowTL: !!window.TL,
      timelineId: timeline?._id,
      eventsCount: events?.length,
    });

    if (!isScriptLoaded) {
      console.log('⏳ Script not loaded yet, waiting...');
      return;
    }

    if (!window.TL) {
      console.log('❌ window.TL not available even though script is loaded');
      setError('TimelineJS library not properly loaded');
      setIsLoading(false);
      return;
    }

    // Add a small delay to ensure the ref is ready with retry limit
    let retryCount = 0;
    const maxRetries = 50; // Maximum 5 seconds of retries (50 * 100ms)

    const initializeTimeline = () => {
      if (!timelineRef.current) {
        retryCount++;
        if (retryCount >= maxRetries) {
          console.error('❌ Timeline ref failed to initialize after maximum retries');
          setError('Timeline container failed to initialize');
          setIsLoading(false);
          return;
        }
        console.log(
          `⏳ Timeline ref not ready yet, retrying in 100ms... (${retryCount}/${maxRetries})`
        );
        setTimeout(initializeTimeline, 100);
        return;
      }

      console.log('✅ Timeline ref is ready, proceeding with initialization');
      createTimelineInstance();
    };

    const createTimelineInstance = () => {
      try {
        console.log('🔄 Converting timeline data...');
        console.log('📊 Input data:', { timeline: !!timeline, events: events?.length });

        // Create timeline ID
        const timelineId = `timeline-${timeline?._id || Date.now()}`;
        if (timelineRef.current) {
          timelineRef.current.id = timelineId;
        }
        console.log('🏗️ Creating timeline with ID:', timelineId);

        // Get responsive options
        const timelineOptions = getResponsiveOptions();
        console.log('⚙️ Timeline options:', timelineOptions);

        // Convert Sanity data to TimelineJS format
        const timelineData = convertTimelineToTimelineJS(timeline, events);
        console.log('✅ Timeline data converted:', timelineData);

        // Test with minimal data if conversion fails
        if (!timelineData?.events || timelineData.events.length === 0) {
          console.warn('⚠️ No events found, creating minimal test data');
          const testData = {
            events: [
              {
                start_date: { year: 2024, month: 1, day: 1 },
                text: {
                  headline: 'Test Event',
                  text: 'This is a test event to verify TimelineJS is working.',
                },
              },
            ],
          };
          console.log('🧪 Using test data:', testData);

          if (window.TL) {
            timelineInstanceRef.current = new window.TL.Timeline(
              timelineId,
              testData,
              timelineOptions
            );
          }
          console.log('✅ Test timeline instance created successfully');
          setIsLoading(false);
          setError(null);
          return;
        }

        // Validate the data
        console.log('🔍 Validating timeline data...');
        if (!validateTimelineJSData(timelineData)) {
          console.error('❌ Timeline data validation failed');
          setError('Invalid timeline data format');
          setIsLoading(false);
          return;
        }
        console.log('✅ Timeline data validation passed');

        // Clear any existing timeline
        if (timelineInstanceRef.current && timelineRef.current) {
          console.log('🧹 Clearing existing timeline');
          timelineRef.current.innerHTML = '';
        }

        // Create new timeline instance
        if (window.TL) {
          timelineInstanceRef.current = new window.TL.Timeline(
            timelineId,
            timelineData,
            timelineOptions
          );
        }

        console.log('✅ Timeline instance created successfully');
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('❌ Error initializing TimelineJS:', err);
        setError(
          `Failed to initialize timeline: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
        setIsLoading(false);
      }
    };

    // Start the initialization process
    initializeTimeline();
  }, [isScriptLoaded, timeline, events, getResponsiveOptions]);

  // Cleanup on unmount
  useEffect(() => {
    const currentTimelineRef = timelineRef.current;
    return () => {
      if (timelineInstanceRef.current && currentTimelineRef) {
        currentTimelineRef.innerHTML = '';
        timelineInstanceRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`timeline-error p-8 text-center ${className}`}
      >
        <div className='mx-auto max-w-md'>
          <AlertCircle className='mx-auto mb-4 h-12 w-12 text-red-500' />
          <h3 className='mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100'>
            Timeline Error
          </h3>
          <p className='mb-4 text-slate-600 dark:text-slate-400'>{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant='outline'
            className='flex items-center gap-2'
          >
            Try Again
          </Button>
        </div>
      </motion.div>
    );
  }

  // Always render the timeline container, but show loading overlay when needed

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`timeline-js-container ${className}`}
    >
      {/* Timeline Header */}
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex-1'>
          <h2 className='text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl'>
            {timeline.title}
          </h2>
          {timeline.shortDescription && (
            <p className='mt-2 text-sm text-slate-600 dark:text-slate-400 sm:text-base'>
              {timeline.shortDescription}
            </p>
          )}
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant='secondary' className='flex items-center gap-1 text-xs sm:text-sm'>
            {events.length} Events
          </Badge>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center gap-1 text-xs sm:text-sm'
            onClick={() => window.open('https://timeline.knightlab.com/', '_blank')}
          >
            <ExternalLink className='h-3 w-3' />
            <span className='hidden sm:inline'>Powered by</span> TimelineJS
          </Button>
        </div>
      </div>

      {/* TimelineJS Container */}
      <div className='relative'>
        <div
          ref={timelineRef}
          className='timeline-js-embed overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
          style={{
            height: typeof window !== 'undefined' && window.innerWidth < 768 ? '500px' : height,
          }}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-white/90 dark:bg-slate-900/90'>
            <div className='text-center'>
              <Loader2 className='mx-auto mb-4 h-8 w-8 animate-spin text-blue-500' />
              <p className='text-slate-600 dark:text-slate-400'>Loading interactive timeline...</p>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Footer */}
      <div className='mt-4 text-center'>
        <p className='text-sm text-slate-500 dark:text-slate-400'>
          Navigate through time using the timeline controls below the main content area
        </p>
      </div>
    </motion.div>
  );
};

export default TimelineJSVisualization;
