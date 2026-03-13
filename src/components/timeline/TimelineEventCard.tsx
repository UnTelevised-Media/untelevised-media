'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  AlertTriangle,
  Search,
  Users,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import urlForImage from '@/util/urlForImage';
import formatDate from '@/util/formatDate';

interface TimelineEventCardProps {
  event: TimelineEvent;
  className?: string;
  showAuthor?: boolean;
  showRelated?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  className = '',
  showAuthor = true,
  showRelated = true,
  variant = 'default',
}) => {
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

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'breaking':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'investigation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'live':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'political':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'social':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      case 'economic':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'environmental':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'technology':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'cultural':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`timeline-event-card-compact ${className}`}>
        <Link href={`/timeline/event/${event.slug.current}`}>
          <div className='group flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-untele/50 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'>
            {/* Event Image */}
            {event.mainImage && (
              <div className='relative h-12 w-12 flex-shrink-0 overflow-hidden rounded'>
                <Image
                  src={urlForImage(event.mainImage)?.url() ?? ''}
                  alt={event.mainImage.alt ?? event.title}
                  fill
                  className='object-cover'
                />
              </div>
            )}

            {/* Content */}
            <div className='min-w-0 flex-1'>
              <div className='mb-1 flex items-center gap-2'>
                <Badge className={`${getEventTypeColor(event.eventType)} text-xs`}>
                  {getEventTypeIcon(event.eventType)}
                  <span className='ml-1 capitalize'>{event.eventType}</span>
                </Badge>
                {event.isMilestone && <Star className='h-3 w-3 fill-current text-yellow-500' />}
              </div>

              <h4 className='line-clamp-1 text-sm font-medium transition-colors group-hover:text-untele'>
                {event.title}
              </h4>

              <div className='mt-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400'>
                <span>{formatDate(event.eventDate)}</span>
                {event.location && (
                  <>
                    <span>•</span>
                    <span className='flex items-center gap-1'>
                      <MapPin className='h-3 w-3' />
                      {event.location}
                    </span>
                  </>
                )}
              </div>
            </div>

            <ArrowRight className='h-4 w-4 text-slate-400 transition-colors group-hover:text-untele' />
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className={`timeline-event-card ${className}`}>
      <div
        className={`group relative overflow-hidden rounded-lg border-2 bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:bg-slate-800 ${getImportanceStyle(event.importanceLevel)} ${event.isMilestone ? 'ring-2 ring-yellow-400' : ''} `}
      >
        {/* Milestone Star */}
        {event.isMilestone && (
          <div className='absolute right-3 top-3 z-10'>
            <Star className='h-6 w-6 fill-current text-yellow-500' />
          </div>
        )}

        {/* Event Image */}
        {event.mainImage && (
          <div className='relative aspect-video overflow-hidden'>
            <Image
              src={urlForImage(event.mainImage)?.url() ?? ''}
              alt={event.mainImage.alt ?? event.title}
              fill
              className='object-cover transition-transform duration-300 group-hover:scale-105'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

            {/* Event Type Badge */}
            <div className='absolute bottom-3 left-3'>
              <Badge className={`${getEventTypeColor(event.eventType)} flex items-center gap-1`}>
                {getEventTypeIcon(event.eventType)}
                <span className='capitalize'>{event.eventType}</span>
              </Badge>
            </div>

            {/* Importance Level */}
            <div className='absolute left-3 top-3'>
              <Badge
                variant={event.importanceLevel === 'critical' ? 'destructive' : 'secondary'}
                className='text-xs'
              >
                {event.importanceLevel.toUpperCase()}
              </Badge>
            </div>
          </div>
        )}

        {/* Content */}
        <div className='space-y-3 p-4'>
          {/* Title and Description */}
          <div>
            <h3 className='line-clamp-2 text-lg font-semibold text-slate-900 transition-colors group-hover:text-untele dark:text-slate-100'>
              {event.title}
            </h3>
            {event.description && (
              <p className='mt-1 line-clamp-3 text-sm text-slate-600 dark:text-slate-400'>
                {event.description}
              </p>
            )}
          </div>

          {/* Event Details */}
          <div className='space-y-2'>
            {/* Date and Location */}
            <div className='flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400'>
              <div className='flex items-center gap-1'>
                <Calendar className='h-3 w-3' />
                <span>{formatDate(event.eventDate)}</span>
              </div>
              {event.location && (
                <div className='flex items-center gap-1'>
                  <MapPin className='h-3 w-3' />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {/* Author */}
            {showAuthor && event.author && (
              <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
                <Users className='h-3 w-3' />
                <span>By {event.author.name}</span>
              </div>
            )}
          </div>

          {/* Categories */}
          {event.timelineCategories && event.timelineCategories.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {event.timelineCategories.slice(0, 3).map((category) => (
                <Badge key={category._id} variant='secondary' className='text-xs'>
                  {category.title}
                </Badge>
              ))}
              {event.timelineCategories.length > 3 && (
                <Badge variant='outline' className='text-xs'>
                  +{event.timelineCategories.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Related Content */}
          {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
          {showRelated && (event.relatedArticles?.length || event.relatedLiveEvents?.length) && (
            <div className='text-xs text-slate-600 dark:text-slate-400'>
              <div className='flex items-center gap-2'>
                <ExternalLink className='h-3 w-3' />
                <span>
                  {event.relatedArticles?.length ?? 0} article
                  {(event.relatedArticles?.length ?? 0) !== 1 ? 's' : ''}
                  {event.relatedLiveEvents?.length && (
                    <>
                      , {event.relatedLiveEvents.length} live event
                      {event.relatedLiveEvents.length !== 1 ? 's' : ''}
                    </>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className='pt-2'>
            <Link href={`/timeline/event/${event.slug.current}`}>
              <Button className='w-full' size='sm'>
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineEventCard;
