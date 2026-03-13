'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Users, Star, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import urlForImage from '@/util/urlForImage';
import formatDate from '@/util/formatDate';

interface TimelineCardProps {
  timeline: Timeline;
  className?: string;
  showAuthor?: boolean;
  showEventCount?: boolean;
}

const TimelineCard: React.FC<TimelineCardProps> = ({
  timeline,
  className = '',
  showAuthor = true,
  showEventCount = true,
}) => {
  const eventCount = timeline.events?.length ?? 0;
  const startDate = timeline.timeRange?.startDate;
  const endDate = timeline.timeRange?.endDate;

  const getTimelineTypeColor = (type: string) => {
    switch (type) {
      case 'breaking':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'investigation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'live':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'historical':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTimelineTypeIcon = (type: string) => {
    switch (type) {
      case 'breaking':
        return <Clock className='h-3 w-3' />;
      case 'investigation':
        return <MapPin className='h-3 w-3' />;
      case 'live':
        return <Calendar className='h-3 w-3' />;
      default:
        return <Calendar className='h-3 w-3' />;
    }
  };

  return (
    <div className={`timeline-card ${className}`}>
      <div className='group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-untele/50 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800'>
        {/* Featured Badge */}
        {timeline.isFeatured && (
          <div className='absolute right-3 top-3 z-10'>
            <Badge className='flex items-center gap-1 bg-yellow-500 text-yellow-900'>
              <Star className='h-3 w-3' />
              Featured
            </Badge>
          </div>
        )}

        {/* Cover Image */}
        {timeline.coverImage && (
          <div className='relative aspect-video overflow-hidden'>
            <Image
              src={urlForImage(timeline.coverImage)?.url() ?? ''}
              alt={timeline.coverImage.alt ?? timeline.title}
              fill
              className='object-cover transition-transform duration-300 group-hover:scale-105'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

            {/* Timeline Type Badge */}
            <div className='absolute bottom-3 left-3'>
              <Badge
                className={`${getTimelineTypeColor(timeline.timelineType)} flex items-center gap-1`}
              >
                {getTimelineTypeIcon(timeline.timelineType)}
                <span className='capitalize'>{timeline.timelineType}</span>
              </Badge>
            </div>
          </div>
        )}

        {/* Content */}
        <div className='space-y-3 p-4'>
          {/* Title */}
          <div>
            <h3 className='line-clamp-2 text-lg font-semibold text-slate-900 transition-colors group-hover:text-untele dark:text-slate-100'>
              {timeline.title}
            </h3>
            {timeline.shortDescription && (
              <p className='mt-1 line-clamp-3 text-sm text-slate-600 dark:text-slate-400'>
                {timeline.shortDescription}
              </p>
            )}
          </div>

          {/* Timeline Info */}
          <div className='space-y-2'>
            {/* Date Range */}
            {(startDate ?? endDate) && (
              <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400'>
                <Calendar className='h-3 w-3' />
                <span>
                  {startDate && formatDate(startDate)}
                  {startDate && endDate && ' - '}
                  {endDate ? formatDate(endDate) : startDate && 'Ongoing'}
                </span>
              </div>
            )}

            {/* Event Count */}
            {showEventCount && (
              <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400'>
                <Clock className='h-3 w-3' />
                <span>
                  {eventCount} event{eventCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Author */}
            {showAuthor && timeline.author && (
              <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400'>
                <Users className='h-3 w-3' />
                <span>By {timeline.author.name}</span>
                {timeline.collaborators && timeline.collaborators.length > 0 && (
                  <span>+{timeline.collaborators.length} more</span>
                )}
              </div>
            )}
          </div>

          {/* Categories */}
          {timeline.categories && timeline.categories.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {timeline.categories.slice(0, 3).map((category) => (
                <Badge key={category._id} variant='secondary' className='text-xs'>
                  {category.title}
                </Badge>
              ))}
              {timeline.categories.length > 3 && (
                <Badge variant='outline' className='text-xs'>
                  +{timeline.categories.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Action Button */}
          <div className='pt-2'>
            <Link href={`/timeline/${timeline.slug.current}`}>
              <Button className='w-full' size='sm'>
                View Timeline
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineCard;
