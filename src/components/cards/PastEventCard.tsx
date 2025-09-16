'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ExternalLink,
  ArrowRight,
  Users,
  Tag
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import urlForImage from '@/util/urlForImage';
import formatDate from '@/util/formatDate';
import ClientTimeDisplay from '@/components/ui/ClientTimeDisplay';

interface PastEventCardProps {
  event: LiveEvent;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showRelated?: boolean;
}

const PastEventCard: React.FC<PastEventCardProps> = ({
  event,
  className = '',
  variant = 'default',
  showRelated = true,
}) => {
  const imageUrl = event.mainImage ? urlForImage(event.mainImage)?.url() : null;
  const eventUrl = `/live-event/${event.slug?.current}`;

  // Calculate event summary stats
  const keyEventCount = event.keyEvent?.length || 0;
  const relatedArticleCount = event.relatedArticles?.length || 0;
  const totalContent = keyEventCount + relatedArticleCount;

  if (variant === 'compact') {
    return (
      <div className={`past-event-card-compact ${className}`}>
        <Link href={eventUrl}>
          <div className="group flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-untele/50 transition-all dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
            {/* Event Image */}
            {imageUrl && (
              <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={event.mainImage?.alt || event.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-untele transition-colors mb-1">
                {event.title}
              </h4>
              
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(event.eventDate)}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </span>
                )}
                {totalContent > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {totalContent} updates
                  </span>
                )}
              </div>
            </div>

            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-untele transition-colors" />
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className={`past-event-card ${className}`}>
      <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] dark:border-slate-700 dark:bg-slate-800">
        {/* Event Image */}
        {imageUrl && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={imageUrl}
              alt={event.mainImage?.alt || event.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Past Event Badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-slate-600/90 text-white border-slate-500">
                <Clock className="h-3 w-3 mr-1" />
                Past Event
              </Badge>
            </div>

            {/* Event Tags */}
            {event.eventTag && event.eventTag.length > 0 && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-untele/90 text-white border-untele">
                  <Tag className="h-3 w-3 mr-1" />
                  {event.eventTag[0].title}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title and Subtitle */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-untele transition-colors">
              {event.title}
            </h3>
            {event.subtitle && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                {event.subtitle}
              </p>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-slate-700 dark:text-slate-300 text-sm line-clamp-3">
              {event.description}
            </p>
          )}

          {/* Event Details */}
          <div className="space-y-2">
            {/* Date and Location */}
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <ClientTimeDisplay 
                  eventDate={event.eventDate} 
                  showRelativeTime={false}
                  className="text-sm"
                />
              </div>
              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content Summary */}
          {showRelated && totalContent > 0 && (
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-3 w-3" />
                <span>
                  {keyEventCount > 0 && `${keyEventCount} key event${keyEventCount !== 1 ? 's' : ''}`}
                  {keyEventCount > 0 && relatedArticleCount > 0 && ', '}
                  {relatedArticleCount > 0 && `${relatedArticleCount} article${relatedArticleCount !== 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <Link href={eventUrl}>
              <Button className="w-full" size="sm">
                View Event Details
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastEventCard;
