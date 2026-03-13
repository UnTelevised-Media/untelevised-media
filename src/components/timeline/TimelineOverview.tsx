'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, Star, TrendingUp, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

import TimelineCard from './TimelineCard';
import TimelineEventCard from './TimelineEventCard';

interface TimelineOverviewProps {
  featuredTimelines?: Timeline[];
  recentEvents?: TimelineEvent[];
  milestoneEvents?: TimelineEvent[];
  categories?: TimelineCategory[];
  stats?: {
    totalTimelines: number;
    totalEvents: number;
    totalMilestones: number;
    activeTimelines: number;
  };
  className?: string;
}

const TimelineOverview: React.FC<TimelineOverviewProps> = ({
  featuredTimelines = [],
  recentEvents = [],
  milestoneEvents = [],
  categories = [],
  stats,
  className = '',
}) => {
  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: number;
    description: string;
    color?: string;
  }> = ({ icon, title, value, description, color = 'text-blue-600' }) => (
    <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800'>
      <div className='flex items-center gap-3'>
        <div className={`rounded-lg bg-slate-100 p-2 dark:bg-slate-700 ${color}`}>{icon}</div>
        <div>
          <h3 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
            {value.toLocaleString()}
          </h3>
          <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>{title}</p>
          <p className='text-xs text-slate-500 dark:text-slate-400'>{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`timeline-overview space-y-8 ${className}`}>
      {/* Hero Section */}
      <div className='space-y-4 text-center'>
        <h1 className='text-4xl font-bold text-slate-900 dark:text-slate-100'>
          Interactive Timelines
        </h1>
        <p className='mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400'>
          Explore comprehensive timelines of breaking news, investigations, and major events.
          Navigate through time to understand how stories unfold and connect.
        </p>
        <div className='flex flex-wrap justify-center gap-4'>
          <Link href='/timelines'>
            <Button size='lg' className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              Browse All Timelines
            </Button>
          </Link>
          <Link href='/timeline/create'>
            <Button variant='outline' size='lg' className='flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              Create Timeline
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <section>
          <h2 className='mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100'>
            Timeline Statistics
          </h2>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
            <StatCard
              icon={<Calendar className='h-5 w-5' />}
              title='Total Timelines'
              value={stats.totalTimelines}
              description='Published timeline collections'
              color='text-blue-600'
            />
            <StatCard
              icon={<Clock className='h-5 w-5' />}
              title='Timeline Events'
              value={stats.totalEvents}
              description='Documented events across all timelines'
              color='text-green-600'
            />
            <StatCard
              icon={<Star className='h-5 w-5' />}
              title='Milestone Events'
              value={stats.totalMilestones}
              description='Key moments and turning points'
              color='text-yellow-600'
            />
            <StatCard
              icon={<TrendingUp className='h-5 w-5' />}
              title='Active Timelines'
              value={stats.activeTimelines}
              description='Currently ongoing timeline coverage'
              color='text-red-600'
            />
          </div>
        </section>
      )}

      {/* Featured Timelines */}
      {featuredTimelines.length > 0 && (
        <section>
          <div className='mb-6 flex items-center justify-between'>
            <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              Featured Timelines
            </h2>
            <Link href='/timelines?featured=true'>
              <Button variant='outline' className='flex items-center gap-2'>
                View All Featured
                <ArrowRight className='h-4 w-4' />
              </Button>
            </Link>
          </div>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {featuredTimelines.slice(0, 6).map((timeline) => (
              <TimelineCard
                key={timeline._id}
                timeline={timeline}
                showAuthor={true}
                showEventCount={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <section>
          <div className='mb-6 flex items-center justify-between'>
            <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              Recent Timeline Events
            </h2>
            <Link href='/timeline/events'>
              <Button variant='outline' className='flex items-center gap-2'>
                View All Events
                <ArrowRight className='h-4 w-4' />
              </Button>
            </Link>
          </div>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {recentEvents.slice(0, 6).map((event) => (
              <TimelineEventCard
                key={event._id}
                event={event}
                variant='default'
                showAuthor={true}
                showRelated={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Milestone Events */}
      {milestoneEvents.length > 0 && (
        <section>
          <div className='mb-6 flex items-center justify-between'>
            <h2 className='flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-100'>
              <Star className='h-6 w-6 text-yellow-500' />
              Milestone Events
            </h2>
            <Link href='/timeline/events?milestones=true'>
              <Button variant='outline' className='flex items-center gap-2'>
                View All Milestones
                <ArrowRight className='h-4 w-4' />
              </Button>
            </Link>
          </div>
          <div className='space-y-4'>
            {milestoneEvents.slice(0, 5).map((event) => (
              <TimelineEventCard
                key={event._id}
                event={event}
                variant='compact'
                showAuthor={false}
                showRelated={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className='mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100'>
            Browse by Category
          </h2>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
            {categories.map((category) => (
              <Link key={category._id} href={`/timeline/category/${category.slug.current}`}>
                <div className='group rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-untele/50 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'>
                  <div className='flex items-center gap-3'>
                    <div
                      className={`h-3 w-3 rounded-full ${category.color === 'red' ? 'bg-red-500' : ''} ${category.color === 'blue' ? 'bg-blue-500' : ''} ${category.color === 'green' ? 'bg-green-500' : ''} ${category.color === 'purple' ? 'bg-purple-500' : ''} ${category.color === 'orange' ? 'bg-orange-500' : ''} ${category.color === 'yellow' ? 'bg-yellow-500' : ''} ${category.color === 'pink' ? 'bg-pink-500' : ''} ${category.color === 'teal' ? 'bg-teal-500' : ''} ${category.color === 'gray' ? 'bg-gray-500' : ''} `}
                    />
                    <div className='flex-1'>
                      <h3 className='text-sm font-medium transition-colors group-hover:text-untele'>
                        {category.title}
                      </h3>
                      {category.description && (
                        <p className='line-clamp-2 text-xs text-slate-500 dark:text-slate-400'>
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className='rounded-lg bg-gradient-to-r from-untele to-red-700 p-8 text-center text-white'>
        <h2 className='mb-4 text-2xl font-bold'>Stay Informed with Timeline Updates</h2>
        <p className='mx-auto mb-6 max-w-2xl text-white/90'>
          Get notified when new events are added to timelines you follow, or when new timeline
          collections are published covering breaking news and investigations.
        </p>
        <div className='flex flex-wrap justify-center gap-4'>
          <Link href='/subscribe'>
            <Button variant='secondary' size='lg'>
              Subscribe to Updates
            </Button>
          </Link>
          <Link href='/timeline/submit'>
            <Button
              variant='outline'
              size='lg'
              className='border-white text-white hover:bg-white hover:text-untele'
            >
              Submit Timeline Event
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default TimelineOverview;
