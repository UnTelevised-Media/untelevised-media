// src/components/consent/CookieConsentBanner.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Shield, Eye, Target, Sliders } from 'lucide-react';
import { useConsent } from '@/lib/consent/context';
import { COOKIE_CATEGORIES } from '@/lib/consent/types';

interface CookieConsentBannerProps {
  className?: string;
}

const CookieConsentBanner = ({ className = '' }: CookieConsentBannerProps) => {
  const {
    showBanner,
    preferences,
    acceptAll,
    rejectAll,
    updatePreferences,
    hideBanner,
    isLoading,
  } = useConsent();

  const [showDetails, setShowDetails] = useState(false);
  const [tempPreferences, setTempPreferences] = useState(preferences);

  // Don't render if loading or banner shouldn't show
  if (isLoading || !showBanner) {
    return null;
  }

  const handleCustomize = () => {
    setShowDetails(true);
    setTempPreferences(preferences);
  };

  const handleSaveCustom = async () => {
    await updatePreferences(tempPreferences);
    setShowDetails(false);
    hideBanner();
  };

  const handleToggleCategory = (categoryId: keyof typeof tempPreferences) => {
    if (categoryId === 'essential') {
      return; // Can't disable essential
    }

    setTempPreferences((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'essential':
        return <Shield className='h-5 w-5' />;
      case 'analytics':
        return <Eye className='h-5 w-5' />;
      case 'marketing':
        return <Target className='h-5 w-5' />;
      case 'preferences':
        return <Sliders className='h-5 w-5' />;
      default:
        return <Settings className='h-5 w-5' />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
        role='dialog'
        aria-labelledby='cookie-banner-title'
        aria-describedby='cookie-banner-description'
      >
        {/* Backdrop */}
        <div className='absolute inset-0 bg-black/20 backdrop-blur-sm' />

        {/* Banner Content */}
        <div className='relative border-t border-steelpolished-200 bg-white shadow-2xl dark:border-steeldark-700 dark:bg-steeldark-900'>
          {!showDetails ? (
            // Simple Banner View
            <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
              <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                {/* Content */}
                <div className='flex-1'>
                  <h2
                    id='cookie-banner-title'
                    className='text-lg font-semibold text-steeldark-900 dark:text-steelpolished-100'
                  >
                    We value your privacy
                  </h2>
                  <p
                    id='cookie-banner-description'
                    className='mt-2 text-sm text-steeldark-600 dark:text-steelpolished-400'
                  >
                    We use cookies to enhance your browsing experience, serve personalized ads or
                    content, and analyze our traffic. By clicking &quot;Accept All&quot;, you
                    consent to our use of cookies. You can customize your preferences or learn more
                    in our{' '}
                    <a
                      href='/policies/privacy-policy'
                      className='font-medium text-untele hover:text-red-700 dark:text-untele dark:hover:text-red-400'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                </div>

                {/* Actions */}
                <div className='flex flex-col gap-3 sm:flex-row lg:flex-shrink-0'>
                  <button
                    onClick={handleCustomize}
                    className='hover:bg-steelpolished-50 inline-flex items-center justify-center gap-2 rounded-lg border border-steelpolished-300 bg-white px-4 py-2 text-sm font-medium text-steeldark-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-untele focus:ring-offset-2 dark:border-steeldark-600 dark:bg-steeldark-800 dark:text-steelpolished-300 dark:hover:bg-steeldark-700'
                  >
                    <Settings className='h-4 w-4' />
                    Customize
                  </button>

                  <button
                    onClick={rejectAll}
                    className='hover:bg-steelpolished-50 inline-flex items-center justify-center rounded-lg border border-steelpolished-300 bg-white px-4 py-2 text-sm font-medium text-steeldark-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-untele focus:ring-offset-2 dark:border-steeldark-600 dark:bg-steeldark-800 dark:text-steelpolished-300 dark:hover:bg-steeldark-700'
                  >
                    Reject All
                  </button>

                  <button
                    onClick={acceptAll}
                    className='inline-flex items-center justify-center rounded-lg bg-untele px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-untele focus:ring-offset-2'
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Detailed Settings View
            <div className='mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8'>
              {/* Header */}
              <div className='flex items-center justify-between border-b border-steelpolished-200 pb-4 dark:border-steeldark-700'>
                <h2 className='text-xl font-semibold text-steeldark-900 dark:text-steelpolished-100'>
                  Cookie Preferences
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className='rounded-lg p-2 text-steelpolished-400 hover:text-steeldark-600 focus:outline-none focus:ring-2 focus:ring-untele dark:hover:text-steelpolished-300'
                  aria-label='Close settings'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>

              {/* Cookie Categories */}
              <div className='mt-6 space-y-6'>
                {COOKIE_CATEGORIES.map((category) => (
                  <div key={category.id} className='flex items-start gap-4'>
                    <div className='mt-1 flex-shrink-0'>{getCategoryIcon(category.id)}</div>

                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center justify-between'>
                        <h3 className='text-base font-medium text-steeldark-900 dark:text-steelpolished-100'>
                          {category.name}
                        </h3>

                        <label className='relative inline-flex cursor-pointer items-center'>
                          <input
                            type='checkbox'
                            checked={tempPreferences[category.id as keyof typeof tempPreferences]}
                            onChange={() =>
                              handleToggleCategory(category.id as keyof typeof tempPreferences)
                            }
                            disabled={category.required}
                            className='peer sr-only'
                          />
                          <div className="peer h-6 w-11 rounded-full bg-steelpolished-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-steelpolished-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-untele peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 dark:border-steeldark-600 dark:bg-steeldark-700 dark:peer-focus:ring-red-800" />
                        </label>
                      </div>

                      <p className='mt-1 text-sm text-steeldark-600 dark:text-steelpolished-400'>
                        {category.description}
                      </p>

                      {category.required && (
                        <p className='mt-1 text-xs text-steelpolished-500 dark:text-steelpolished-500'>
                          Always active - Required for basic website functionality
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className='mt-8 flex flex-col gap-3 border-t border-steelpolished-200 pt-6 dark:border-steeldark-700 sm:flex-row sm:justify-end'>
                <button
                  onClick={rejectAll}
                  className='hover:bg-steelpolished-50 inline-flex items-center justify-center rounded-lg border border-steelpolished-300 bg-white px-4 py-2 text-sm font-medium text-steeldark-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-untele focus:ring-offset-2 dark:border-steeldark-600 dark:bg-steeldark-800 dark:text-steelpolished-300 dark:hover:bg-steeldark-700'
                >
                  Reject All
                </button>

                <button
                  onClick={acceptAll}
                  className='hover:bg-steelpolished-50 inline-flex items-center justify-center rounded-lg border border-steelpolished-300 bg-white px-4 py-2 text-sm font-medium text-steeldark-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-untele focus:ring-offset-2 dark:border-steeldark-600 dark:bg-steeldark-800 dark:text-steelpolished-300 dark:hover:bg-steeldark-700'
                >
                  Accept All
                </button>

                <button
                  onClick={handleSaveCustom}
                  className='inline-flex items-center justify-center rounded-lg bg-untele px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-untele focus:ring-offset-2'
                >
                  Save Preferences
                </button>
              </div>

              {/* Footer Links */}
              <div className='mt-4 text-center'>
                <div className='flex flex-wrap justify-center gap-4 text-xs text-steelpolished-500 dark:text-steelpolished-400'>
                  <a
                    href='/policies/privacy-policy'
                    className='hover:text-untele dark:hover:text-steelpolished-300'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Privacy Policy
                  </a>
                  <a
                    href='/policies/cookie-policy'
                    className='hover:text-untele dark:hover:text-steelpolished-300'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Cookie Policy
                  </a>
                  <a
                    href='/privacy-settings'
                    className='hover:text-untele dark:hover:text-steelpolished-300'
                  >
                    Privacy Settings
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
