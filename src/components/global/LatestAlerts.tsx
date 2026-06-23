'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface AlertArticle {
  title: string;
  slug: { current: string };
}

interface LatestAlertsProps {
  articles: AlertArticle[];
}

export default function LatestAlerts({ articles }: LatestAlertsProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [offset, setOffset] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Desktop ticker - repeats articles for continuous scroll
  const repeatedArticles = [...articles, ...articles];
  const itemWidth = 300; // approximate width per item with gap
  const totalWidth = repeatedArticles.length * itemWidth;

  useEffect(() => {
    if (isHovering) {
      // Stop animation on hover
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    // Animation speed: 50px per second for consistent speed
    const speed = 50;
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      setOffset((prev) => {
        const newOffset = (prev + speed * deltaTime) % totalWidth;
        return newOffset;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovering, totalWidth]);

  return (
    <>
      {/* Desktop Ticker (lg and above) */}
      <div className='hidden border border-untele bg-white dark:bg-black lg:block'>
        <div className='border-b border-untele bg-untele px-4 py-2'>
          <h2 className='text-sm font-black uppercase tracking-widest text-white'>
            ⚡ LATEST ALERTS
          </h2>
        </div>
        <div
          className='overflow-hidden bg-white p-4 dark:bg-black'
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div
            ref={tickerRef}
            className='flex gap-8 transition-none'
            style={{
              transform: `translateX(-${offset}px)`,
              willChange: 'transform',
            }}
          >
            {repeatedArticles.map((article, index) => (
              <Link
                key={`${article.slug.current}-${index}`}
                href={`/articles/${article.slug.current}`}
                className='whitespace-nowrap font-bold text-untele transition-colors hover:text-red-600'
              >
                • {article.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Ticker (below lg) */}
      <div className='border border-untele bg-white dark:bg-black lg:hidden'>
        <div className='border-b border-untele bg-untele px-4 py-2'>
          <h2 className='text-sm font-black uppercase tracking-widest text-white'>
            ⚡ LATEST ALERTS
          </h2>
        </div>
        <div className='bg-white p-4 dark:bg-black'>
          <div className='relative h-8 overflow-hidden'>
            <div className='animate-alerts-scroll absolute w-full'>
              {articles.map((article) => (
                <Link
                  key={article.slug.current}
                  href={`/articles/${article.slug.current}`}
                  className='flex h-8 items-center whitespace-nowrap font-bold text-untele transition-colors hover:text-red-600'
                >
                  • {article.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 2));
          }
        }

        @keyframes alerts-scroll {
          0% {
            transform: translateY(0);
          }
          10% {
            transform: translateY(0);
          }
          12% {
            transform: translateY(-2rem);
          }
          22% {
            transform: translateY(-2rem);
          }
          24% {
            transform: translateY(-4rem);
          }
          34% {
            transform: translateY(-4rem);
          }
          36% {
            transform: translateY(-6rem);
          }
          46% {
            transform: translateY(-6rem);
          }
          48% {
            transform: translateY(-8rem);
          }
          58% {
            transform: translateY(-8rem);
          }
          60% {
            transform: translateY(-10rem);
          }
          70% {
            transform: translateY(-10rem);
          }
          72% {
            transform: translateY(-12rem);
          }
          82% {
            transform: translateY(-12rem);
          }
          84% {
            transform: translateY(-14rem);
          }
          94% {
            transform: translateY(-14rem);
          }
          100% {
            transform: translateY(-14rem);
          }
        }

        .animate-alerts-scroll {
          animation: alerts-scroll 28s linear infinite;
        }
      `}</style>
    </>
  );
}
