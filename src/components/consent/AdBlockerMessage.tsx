// src/components/consent/AdBlockerMessage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Shield, Coffee } from 'lucide-react';
import { adBlockerDetector } from '@/lib/consent/adBlockerDetection';

interface AdBlockerMessageProps {
  className?: string;
}

const AdBlockerMessage = ({ className = '' }: AdBlockerMessageProps) => {
  const [showMessage, setShowMessage] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdBlocker = async () => {
      try {
        const detected = await adBlockerDetector.detect();

        if (!mounted) {
          return;
        }

        if (detected && adBlockerDetector.shouldShowMessage()) {
          setShowMessage(true);
          adBlockerDetector.markMessageShown();
        }
      } catch (error) {
        console.warn('Ad blocker detection failed:', error);
      } finally {
        if (mounted) {
          setIsDetecting(false);
        }
      }
    };

    // Delay detection to avoid interfering with page load
    const timer = setTimeout(checkAdBlocker, 2000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleDismiss = () => {
    setShowMessage(false);
    adBlockerDetector.markMessageDismissed();
  };

  const handleSupport = () => {
    // You can customize this to redirect to a support page or donation page
    window.open('/support', '_blank');
  };

  if (isDetecting || !showMessage) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`fixed left-4 right-4 top-1/3 z-40 mx-auto max-w-2xl ${className}`}
        role='dialog'
        aria-labelledby='adblocker-title'
        aria-describedby='adblocker-description'
      >
        <div className='relative overflow-hidden rounded-xl border border-steelpolished-200 bg-white shadow-lg dark:border-steeldark-700 dark:bg-steeldark-900'>
          {/* Background Pattern */}
          <div className='from-steelpolished-50 absolute inset-0 bg-gradient-to-br to-steelpolished-100 dark:from-steeldark-800 dark:to-steeldark-900' />

          {/* Content */}
          <div className='relative p-6'>
            {/* Header */}
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-steelpolished-100 dark:bg-steeldark-900'>
                  <Shield className='h-5 w-5 text-untele dark:text-red-400' />
                </div>
                <div>
                  <h3
                    id='adblocker-title'
                    className='text-lg font-semibold text-steeldark-900 dark:text-steelpolished-100'
                  >
                    Ad Blocker Detected
                  </h3>
                  <p className='text-sm text-steeldark-600 dark:text-steelpolished-400'>
                    We respect your choice to use an ad blocker
                  </p>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className='rounded-lg p-2 text-steelpolished-400 hover:text-steeldark-600 focus:outline-none focus:ring-2 focus:ring-untele dark:hover:text-steelpolished-300'
                aria-label='Dismiss message'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Message */}
            <div id='adblocker-description' className='mt-4'>
              <p className='text-sm text-steeldark-700 dark:text-steelpolished-300'>
                We understand that ads can be intrusive, and we respect your decision to use an ad
                blocker. However, advertising is our primary source of revenue and helps us keep
                our journalism free and independent.
              </p>

              <div className='mt-4 space-y-2'>
                <div className='flex items-center gap-2 text-sm text-steeldark-600 dark:text-steelpolished-400'>
                  <Heart className='h-4 w-4 text-red-500' />
                  <span>We don&apos;t use intrusive or malicious ads</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-steeldark-600 dark:text-steelpolished-400'>
                  <Shield className='h-4 w-4 text-green-500' />
                  <span>We respect your privacy and don&apos;t sell personal data</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-steeldark-600 dark:text-steelpolished-400'>
                  <Coffee className='h-4 w-4 text-amber-500' />
                  <span>Ads help us maintain quality journalism</span>
                </div>
              </div>

              <p className='mt-4 text-sm text-steeldark-700 dark:text-steelpolished-300'>
                If you&apos;d like to support us, you can consider whitelisting our site in your ad
                blocker or explore other ways to support independent journalism.
              </p>
            </div>

            {/* Actions */}
            <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
              <button
                onClick={handleSupport}
                className='inline-flex items-center justify-center gap-2 rounded-lg bg-untele px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-untele focus:ring-offset-2'
              >
                <Heart className='h-4 w-4' />
                Support Us
              </button>

              <a
                href='https://help.getadblock.com/support/solutions/articles/6000055743-how-to-whitelist-a-website'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:bg-steelpolished-50 inline-flex items-center justify-center rounded-lg border border-steelpolished-300 bg-white px-4 py-2 text-sm font-medium text-steeldark-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-untele focus:ring-offset-2 dark:border-steeldark-600 dark:bg-steeldark-800 dark:text-steelpolished-300 dark:hover:bg-steeldark-700'
              >
                How to Whitelist
              </a>

              <button
                onClick={handleDismiss}
                className='hover:bg-steelpolished-50 inline-flex items-center justify-center rounded-lg border border-steelpolished-300 bg-white px-4 py-2 text-sm font-medium text-steeldark-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-untele focus:ring-offset-2 dark:border-steeldark-600 dark:bg-steeldark-800 dark:text-steelpolished-300 dark:hover:bg-steeldark-700'
              >
                Continue Anyway
              </button>
            </div>

            {/* Footer Note */}
            <div className='bg-steelpolished-50 mt-4 rounded-lg p-3 dark:bg-steeldark-800'>
              <p className='text-xs text-steeldark-600 dark:text-steelpolished-400'>
                <strong>Thank you for visiting!</strong> Whether you choose to support us or
                continue with your ad blocker, we appreciate you taking the time to read our
                content. Your engagement helps us continue our mission of providing quality,
                independent journalism.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdBlockerMessage;

// Hook for using ad blocker detection in other components
export function useAdBlockerDetection() {
  const [detected, setDetected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const detect = async () => {
      try {
        const result = await adBlockerDetector.detect();
        if (mounted) {
          setDetected(result);
        }
      } catch (error) {
        console.warn('Ad blocker detection failed:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    detect();

    return () => {
      mounted = false;
    };
  }, []);

  return { detected, loading };
}
