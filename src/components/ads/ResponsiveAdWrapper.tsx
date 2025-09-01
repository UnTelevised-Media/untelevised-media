/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useState } from 'react';
import BannerAd from './BannerAd';
import RectangleAd from './RectangleAd';

interface ResponsiveAdWrapperProps {
  slot: string;
  className?: string;
  style?: React.CSSProperties;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}

export default function ResponsiveAdWrapper({
  slot,
  className = '',
  style = {},
  hideOnMobile = false,
  hideOnTablet = false,
  hideOnDesktop = false,
}: ResponsiveAdWrapperProps) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setScreenSize('mobile');
      } else if (window.innerWidth < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Hide ad based on screen size preferences
  if (
    (screenSize === 'mobile' && hideOnMobile) ||
    (screenSize === 'tablet' && hideOnTablet) ||
    (screenSize === 'desktop' && hideOnDesktop)
  ) {
    return null;
  }

  // Render different ad formats based on screen size
  const renderAdByScreenSize = () => {
    switch (screenSize) {
      case 'mobile':
        return (
          <BannerAd
            slot={slot}
            format='horizontal'
            className={`w-full ${className}`}
            style={style}
          />
        );
      case 'tablet':
        return (
          <RectangleAd
            slot={slot}
            width={728}
            height={90}
            className={`mx-auto ${className}`}
            style={style}
          />
        );
      case 'desktop':
        return (
          <BannerAd slot={slot} format='auto' className={`w-full ${className}`} style={style} />
        );
      default:
        return (
          <BannerAd slot={slot} format='auto' className={`w-full ${className}`} style={style} />
        );
    }
  };

  return (
    <div className={`responsive-ad-wrapper ${className}`} style={style}>
      {renderAdByScreenSize()}
    </div>
  );
}
