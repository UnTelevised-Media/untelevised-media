'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import urlForImage from '@/util/url/urlForImage';

interface GalleryImage {
  _key?: string;
  asset: { _ref: string };
  alt?: string;
}

interface ImageGalleryCarouselProps {
  gallery: {
    images?: GalleryImage[];
  };
}

const AUTO_ROTATE_INTERVAL = 5000; // 5 seconds

export default function ImageGalleryCarousel({ gallery }: ImageGalleryCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null);

  const images = useMemo(() => gallery?.images ?? [], [gallery?.images]);

  const selectedImage = images[selectedIndex];
  const imageUrl = urlForImage(selectedImage)?.url();
  const thumbWidth = 100; // 100px + gap
  const thumbGapWidth = thumbWidth + 8; // 100px + 8px gap

  // Preload adjacent images for faster responsiveness
  useEffect(() => {
    if (images.length <= 1) {
      return;
    }

    const preloadImage = (index: number) => {
      const img = new window.Image();
      const url = urlForImage(images[index])?.url();
      if (url) {
        img.src = url;
      }
    };

    // Preload next and previous images
    const nextIndex = (selectedIndex + 1) % images.length;
    const prevIndex = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1;
    preloadImage(nextIndex);
    preloadImage(prevIndex);
  }, [selectedIndex, images]);

  // Auto-rotate timer setup
  useEffect(() => {
    if (!isAutoRotating || images.length <= 1) {
      return;
    }

    autoRotateTimerRef.current = setInterval(() => {
      setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, AUTO_ROTATE_INTERVAL);

    return () => {
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current);
      }
    };
  }, [isAutoRotating, images.length]);

  // Reset auto-rotate timer on user interaction
  const resetAutoRotateTimer = useCallback(() => {
    if (autoRotateTimerRef.current) {
      clearInterval(autoRotateTimerRef.current);
    }
    setIsAutoRotating(true);
  }, []);

  const handlePrevious = () => {
    resetAutoRotateTimer();
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    resetAutoRotateTimer();
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    resetAutoRotateTimer();
    setSelectedIndex(index);
    // Snap the thumbnail row to show the selected thumbnail
    snapThumbnailToView(index);
  };

  const snapThumbnailToView = (index: number) => {
    if (!scrollContainerRef.current) {return;}
    const container = scrollContainerRef.current;
    const itemPos = index * thumbGapWidth;
    const containerWidth = container.clientWidth;
    const scrollPos = container.scrollLeft;

    // If item is not in view, scroll to center it
    if (itemPos < scrollPos || itemPos + thumbWidth > scrollPos + containerWidth) {
      container.scrollTo({
        left: Math.max(0, itemPos - containerWidth / 2 + thumbWidth / 2),
        behavior: 'smooth',
      });
    }
  };

  const handleThumbnailScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) {return;}
    const container = scrollContainerRef.current;
    const scrollAmount = thumbGapWidth * 3; // Scroll by 3 items
    const newScroll =
      direction === 'left'
        ? Math.max(0, container.scrollLeft - scrollAmount)
        : Math.min(
            container.scrollWidth - container.clientWidth,
            container.scrollLeft + scrollAmount
          );
    container.scrollTo({ left: newScroll, behavior: 'smooth' });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) {return;}
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;

    // Swipe left = next, swipe right = previous
    if (Math.abs(diff) > 50) {
      // 50px threshold
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
    touchStartRef.current = null;
  };

  const canScrollLeft = scrollContainerRef.current
    ? scrollContainerRef.current.scrollLeft > 0
    : false;
  const canScrollRight = scrollContainerRef.current
    ? scrollContainerRef.current.scrollLeft <
      scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth - 10
    : false;

  if (images.length === 0) {
    return null;
  }

  return (
    <section className='not-prose mb-8'>
      <div className='rounded-xl border border-slate-200 bg-white/50 shadow-lg dark:border-slate-700 dark:bg-slate-900/50'>
        {/* Main Image Display */}
        <div
          className='relative overflow-hidden rounded-t-xl bg-slate-900'
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className='relative aspect-video w-full'>
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={selectedImage.alt ?? 'Gallery image'}
                fill
                className='object-cover'
                sizes='(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 100vw'
                priority
              />
            )}
          </div>

          {/* Navigation arrows on main image (visible on hover) */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                aria-label='Previous image'
                className='absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-white opacity-0 transition-opacity duration-200 hover:bg-slate-900 focus:opacity-100 group-hover:opacity-100'
              >
                <ChevronLeft className='h-6 w-6' />
              </button>
              <button
                onClick={handleNext}
                aria-label='Next image'
                className='absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-white opacity-0 transition-opacity duration-200 hover:bg-slate-900 focus:opacity-100 group-hover:opacity-100'
              >
                <ChevronRight className='h-6 w-6' />
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className='absolute bottom-4 right-4 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-white'>
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Image Caption */}
        {selectedImage.alt && (
          <div className='border-b border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-700 dark:bg-slate-800'>
            <p className='text-sm text-slate-700 dark:text-slate-300'>{selectedImage.alt}</p>
          </div>
        )}

        {/* Thumbnail Row */}
        {images.length > 1 && (
          <div className='border-t border-slate-200 px-4 py-4 dark:border-slate-700'>
            <div className='relative flex items-center gap-2'>
              {/* Left scroll button */}
              <button
                onClick={() => handleThumbnailScroll('left')}
                disabled={!canScrollLeft}
                aria-label='Scroll thumbnails left'
                className='shrink-0 rounded-lg p-2 text-slate-600 transition-colors hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:text-slate-100'
              >
                <ChevronLeft className='h-5 w-5' />
              </button>

              {/* Thumbnails Container */}
              <div className='flex-1 overflow-hidden'>
                <div
                  ref={scrollContainerRef}
                  className='flex gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]'
                  style={{
                    scrollBehavior: 'smooth',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  {images.map((image, index) => (
                    <button
                      key={image._key ?? index}
                      onClick={() => handleThumbnailClick(index)}
                      className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                        selectedIndex === index
                          ? 'border-untele ring-2 ring-untele ring-offset-2'
                          : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500'
                      }`}
                      aria-label={`Select image ${index + 1}`}
                      aria-current={selectedIndex === index ? 'true' : 'false'}
                    >
                      <Image
                        src={urlForImage(image)?.url() ?? ''}
                        alt={image.alt ?? `Gallery thumbnail ${index + 1}`}
                        fill
                        className='object-cover'
                        sizes='100px'
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right scroll button */}
              <button
                onClick={() => handleThumbnailScroll('right')}
                disabled={!canScrollRight}
                aria-label='Scroll thumbnails right'
                className='shrink-0 rounded-lg p-2 text-slate-600 transition-colors hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:text-slate-100'
              >
                <ChevronRight className='h-5 w-5' />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
