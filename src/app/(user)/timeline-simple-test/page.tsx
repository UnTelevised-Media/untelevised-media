/* eslint-disable no-console */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { type TimelineJSData } from '@/util/timelineJSAdapter';

const SimpleTimelineTest = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Loading...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTimelineJS = async () => {
      try {
        console.log('🔄 Starting simple TimelineJS test...');
        setStatus('Loading TimelineJS CSS...');

        // Load CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css';
        cssLink.onload = () => {
          console.log('✅ CSS loaded');
          setStatus('Loading TimelineJS JavaScript...');
        };
        cssLink.onerror = () => {
          console.error('❌ CSS failed to load');
          setError('Failed to load TimelineJS CSS');
        };
        document.head.appendChild(cssLink);

        // Load JavaScript
        const script = document.createElement('script');
        script.src = 'https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js';
        script.async = true;

        const timeout = setTimeout(() => {
          console.error('⏰ Script loading timeout');
          setError('TimelineJS script loading timeout');
        }, 15000);

        script.onload = () => {
          clearTimeout(timeout);
          console.log('✅ Script loaded');
          setStatus('Initializing timeline...');

          setTimeout(() => {
            if (window.TL && timelineRef.current) {
              console.log('✅ window.TL available, creating timeline');

              // Simple test data
              const testData: TimelineJSData = {
                events: [
                  {
                    start_date: { year: 2024, month: 1, day: 1 },
                    text: {
                      headline: 'First Event',
                      text: 'This is the first test event.',
                    },
                  },
                  {
                    start_date: { year: 2024, month: 6, day: 15 },
                    text: {
                      headline: 'Second Event',
                      text: 'This is the second test event.',
                    },
                  },
                  {
                    start_date: { year: 2024, month: 12, day: 31 },
                    text: {
                      headline: 'Third Event',
                      text: 'This is the third test event.',
                    },
                  },
                ],
              };

              try {
                timelineRef.current.id = 'simple-timeline-test';
                const timeline = new window.TL.Timeline('simple-timeline-test', testData, {
                  hash_bookmark: false,
                  debug: true,
                });
                console.log('✅ Timeline created successfully:', timeline);
                setStatus('Timeline loaded successfully!');
                setError(null);
              } catch (err) {
                console.error('❌ Error creating timeline:', err);
                setError(
                  `Failed to create timeline: ${err instanceof Error ? err.message : 'Unknown error'}`
                );
              }
            } else {
              console.error('❌ window.TL not available or ref not ready');
              setError('TimelineJS not properly initialized');
            }
          }, 500);
        };

        script.onerror = (err) => {
          clearTimeout(timeout);
          console.error('❌ Script failed to load:', err);
          setError('Failed to load TimelineJS script');
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error('❌ Error in loadTimelineJS:', err);
        setError(`Initialization error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    loadTimelineJS();
  }, []);

  return (
    <div className='min-h-screen bg-white dark:bg-black'>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='mb-8 text-3xl font-bold text-slate-900 dark:text-slate-100'>
          Simple TimelineJS Test
        </h1>

        <div className='mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
          <h2 className='mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100'>Status</h2>
          <p className='text-sm text-blue-800 dark:text-blue-200'>{status}</p>
          {error && <p className='mt-2 text-sm text-red-800 dark:text-red-200'>Error: {error}</p>}
        </div>

        <div className='mb-4 text-sm text-slate-600 dark:text-slate-400'>
          <p>This is a minimal test to verify TimelineJS loading and initialization.</p>
          <p>Check the browser console for detailed debugging information.</p>
        </div>

        <div
          ref={timelineRef}
          className='h-96 w-full rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
          style={{ minHeight: '400px' }}
        />
      </div>
    </div>
  );
};

export default SimpleTimelineTest;
