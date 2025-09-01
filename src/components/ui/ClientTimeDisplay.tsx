'use client';

import { useEffect, useState } from 'react';
import getTimeSinceEvent from '@/util/getTimeSinceEvent';
import formatDate from '@/util/formatDate';

interface ClientTimeDisplayProps {
  eventDate: string | Date;
  fallbackDate?: string | null;
  showRelativeTime?: boolean;
  className?: string;
}

export default function ClientTimeDisplay({ 
  eventDate, 
  fallbackDate, 
  showRelativeTime = true,
  className = '' 
}: ClientTimeDisplayProps) {
  const [timeDisplay, setTimeDisplay] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (showRelativeTime) {
      // Update time display immediately
      const updateTime = () => {
        setTimeDisplay(getTimeSinceEvent(eventDate));
      };
      
      updateTime();
      
      // Update every minute for relative time
      const interval = setInterval(updateTime, 60000);
      
      return () => clearInterval(interval);
    } else {
      // For absolute dates, just format once
      setTimeDisplay(formatDate(eventDate) || formatDate(fallbackDate) || '');
    }
  }, [eventDate, fallbackDate, showRelativeTime]);

  // During SSR and initial hydration, show formatted date to avoid mismatch
  if (!isClient) {
    return (
      <span className={className}>
        {formatDate(eventDate) || formatDate(fallbackDate) || ''}
      </span>
    );
  }

  return (
    <span className={className}>
      {timeDisplay}
    </span>
  );
}
