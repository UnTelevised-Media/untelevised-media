'use client';

import React from 'react';
import TimelineJSVisualization from '@/components/timeline/TimelineJSVisualization';

// Mock data for testing
const mockTimeline: Timeline = {
  _id: 'test-timeline',
  _type: 'timeline',
  title: 'Test Timeline',
  shortDescription: 'A test timeline for debugging',
  description: [
    {
      _key: 'test-block',
      _type: 'block',
      children: [
        {
          _key: 'test-span',
          _type: 'span',
          marks: [],
          text: 'This is a test timeline for debugging TimelineJS integration.',
        },
      ],
      markDefs: [],
      style: 'normal',
    },
  ],
  slug: {
    current: 'test-timeline',
    _type: 'slug',
  },
  isPublished: true,
  publishedAt: '2024-01-01T00:00:00Z',
  events: [],
  categories: [],
};

const mockEvents: TimelineEvent[] = [
  {
    _id: 'event-1',
    _type: 'timelineEvent',
    title: 'First Event',
    shortDescription: 'This is the first test event',
    description: [
      {
        _key: 'event1-block',
        _type: 'block',
        children: [
          {
            _key: 'event1-span',
            _type: 'span',
            marks: [],
            text: 'This is the first event in our test timeline.',
          },
        ],
        markDefs: [],
        style: 'normal',
      },
    ],
    eventDate: '2024-01-01T00:00:00Z',
    eventType: 'milestone',
    importanceLevel: 'high',
    isMilestone: true,
    isPublished: true,
    publishedAt: '2024-01-01T00:00:00Z',
    slug: {
      current: 'first-event',
      _type: 'slug',
    },
    timelineCategories: [],
    relatedArticles: [],
    relatedLiveEvents: [],
  },
  {
    _id: 'event-2',
    _type: 'timelineEvent',
    title: 'Second Event',
    shortDescription: 'This is the second test event',
    description: [
      {
        _key: 'event2-block',
        _type: 'block',
        children: [
          {
            _key: 'event2-span',
            _type: 'span',
            marks: [],
            text: 'This is the second event in our test timeline.',
          },
        ],
        markDefs: [],
        style: 'normal',
      },
    ],
    eventDate: '2024-06-01T00:00:00Z',
    eventType: 'event',
    importanceLevel: 'medium',
    isMilestone: false,
    isPublished: true,
    publishedAt: '2024-01-01T00:00:00Z',
    slug: {
      current: 'second-event',
      _type: 'slug',
    },
    timelineCategories: [],
    relatedArticles: [],
    relatedLiveEvents: [],
  },
  {
    _id: 'event-3',
    _type: 'timelineEvent',
    title: 'Third Event',
    shortDescription: 'This is the third test event',
    description: [
      {
        _key: 'event3-block',
        _type: 'block',
        children: [
          {
            _key: 'event3-span',
            _type: 'span',
            marks: [],
            text: 'This is the third event in our test timeline.',
          },
        ],
        markDefs: [],
        style: 'normal',
      },
    ],
    eventDate: '2024-12-01T00:00:00Z',
    eventType: 'milestone',
    importanceLevel: 'critical',
    isMilestone: true,
    isPublished: true,
    publishedAt: '2024-01-01T00:00:00Z',
    slug: {
      current: 'third-event',
      _type: 'slug',
    },
    timelineCategories: [],
    relatedArticles: [],
    relatedLiveEvents: [],
  },
];

export default function TimelineDebugPage() {
  return (
    <div className='min-h-screen bg-white dark:bg-black'>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='mb-8 text-3xl font-bold text-slate-900 dark:text-slate-100'>
          TimelineJS Debug Page
        </h1>
        
        <div className='mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
          <h2 className='mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100'>
            Debug Information
          </h2>
          <p className='text-sm text-blue-800 dark:text-blue-200'>
            This page tests the TimelineJS component with mock data. Check the browser console for debugging output.
          </p>
          <div className='mt-2 text-xs text-blue-700 dark:text-blue-300'>
            <p>Timeline: {mockTimeline.title}</p>
            <p>Events: {mockEvents.length}</p>
          </div>
        </div>

        <TimelineJSVisualization
          timeline={mockTimeline}
          events={mockEvents}
          height='600px'
          options={{
            hash_bookmark: false,
            debug: true,
            scale_factor: 2,
            initial_zoom: 2,
          }}
        />
      </div>
    </div>
  );
}
