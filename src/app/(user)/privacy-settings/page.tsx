// src/app/(user)/privacy-settings/page.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Download,
  Trash2,
  Eye,
  Target,
  Sliders,
  Settings,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useConsent } from '@/lib/consent/context';
import { COOKIE_CATEGORIES } from '@/lib/consent/types';
import { privacyStorage } from '@/lib/consent/storage';
import { useAdBlockerDetection } from '@/components/consent/AdBlockerMessage';

const PrivacySettingsPage = () => {
  const { preferences, status, updatePreferences } = useConsent();

  const { detected: adBlockerDetected } = useAdBlockerDetection();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionStatus, setActionStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleExportData = () => {
    try {
      const data = privacyStorage.exportUserData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `privacy-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setActionStatus({
        type: 'success',
        message: 'Your privacy data has been exported successfully.',
      });
    } catch (error) {
      setActionStatus({
        type: 'error',
        message: 'Failed to export data. Please try again.',
      });
    }
  };

  const handleDeleteAllData = () => {
    try {
      privacyStorage.deleteAllData();
      setShowDeleteConfirm(false);
      setActionStatus({
        type: 'success',
        message:
          'All your privacy data has been deleted. The page will reload to reset your session.',
      });

      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setActionStatus({
        type: 'error',
        message: 'Failed to delete data. Please try again.',
      });
    }
  };

  const handleTogglePreference = async (categoryId: keyof typeof preferences) => {
    if (categoryId === 'essential') {
      return;
    }

    try {
      await updatePreferences({
        [categoryId]: !preferences[categoryId],
      });

      setActionStatus({
        type: 'success',
        message: 'Your preferences have been updated.',
      });
    } catch (error) {
      setActionStatus({
        type: 'error',
        message: 'Failed to update preferences. Please try again.',
      });
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
        return 'text-green-600 dark:text-green-400';
      case 'denied':
        return 'text-red-600 dark:text-red-400';
      case 'partial':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-900'>
      {/* Header */}
      <div className='border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'>
        <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
          <div className='flex items-center gap-3'>
            <Shield className='h-8 w-8 text-blue-600' />
            <div>
              <h1 className='text-3xl font-bold text-slate-900 dark:text-slate-100'>
                Privacy Settings
              </h1>
              <p className='mt-2 text-slate-600 dark:text-slate-400'>
                Manage your privacy preferences and data
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Status Alert */}
        {actionStatus.type && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 rounded-lg p-4 ${
              actionStatus.type === 'success'
                ? 'border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                : 'border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
            }`}
          >
            <div className='flex items-center gap-2'>
              {actionStatus.type === 'success' ? (
                <CheckCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
              ) : (
                <AlertTriangle className='h-5 w-5 text-red-600 dark:text-red-400' />
              )}
              <p
                className={`text-sm ${
                  actionStatus.type === 'success'
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}
              >
                {actionStatus.message}
              </p>
            </div>
          </motion.div>
        )}

        <div className='space-y-8'>
          {/* Current Status */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-slate-800'>
            <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
              Current Privacy Status
            </h2>
            <div className='mt-4 grid gap-4 sm:grid-cols-2'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
                  <Shield className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                </div>
                <div>
                  <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                    Consent Status
                  </p>
                  <p className={`text-sm capitalize ${getStatusColor(status)}`}>{status}</p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700'>
                  <Eye className='h-5 w-5 text-slate-600 dark:text-slate-400' />
                </div>
                <div>
                  <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                    Ad Blocker
                  </p>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    {adBlockerDetected ? 'Detected' : 'Not detected'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cookie Preferences */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-slate-800'>
            <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
              Cookie Preferences
            </h2>
            <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>
              Control which types of cookies we can use on your device.
            </p>

            <div className='mt-6 space-y-6'>
              {COOKIE_CATEGORIES.map((category) => (
                <div key={category.id} className='flex items-start gap-4'>
                  <div className='mt-1 flex-shrink-0'>{getCategoryIcon(category.id)}</div>

                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-base font-medium text-slate-900 dark:text-slate-100'>
                        {category.name}
                      </h3>

                      <label className='relative inline-flex cursor-pointer items-center'>
                        <input
                          type='checkbox'
                          checked={preferences[category.id as keyof typeof preferences]}
                          onChange={() =>
                            handleTogglePreference(category.id as keyof typeof preferences)
                          }
                          disabled={category.required}
                          className='peer sr-only'
                        />
                        <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:peer-focus:ring-blue-800" />
                      </label>
                    </div>

                    <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
                      {category.description}
                    </p>

                    {category.required && (
                      <p className='mt-1 text-xs text-slate-500 dark:text-slate-500'>
                        Always active - Required for basic website functionality
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Management */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-slate-800'>
            <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
              Data Management
            </h2>
            <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>
              Exercise your rights under GDPR and other privacy regulations.
            </p>

            <div className='mt-6 space-y-4'>
              <button
                onClick={handleExportData}
                className='flex w-full items-center gap-3 rounded-lg border border-slate-300 bg-white p-4 text-left transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600'
              >
                <Download className='h-5 w-5 text-slate-600 dark:text-slate-400' />
                <div>
                  <p className='font-medium text-slate-900 dark:text-slate-100'>Export My Data</p>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    Download all data we have stored about you
                  </p>
                </div>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className='flex w-full items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-left transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-800 dark:bg-red-900/20 dark:hover:bg-red-900/30'
              >
                <Trash2 className='h-5 w-5 text-red-600 dark:text-red-400' />
                <div>
                  <p className='font-medium text-red-900 dark:text-red-100'>Delete All My Data</p>
                  <p className='text-sm text-red-700 dark:text-red-300'>
                    Permanently remove all stored data and reset preferences
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800'
            >
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900'>
                  <AlertTriangle className='h-5 w-5 text-red-600 dark:text-red-400' />
                </div>
                <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                  Delete All Data
                </h3>
              </div>

              <p className='mt-4 text-sm text-slate-600 dark:text-slate-400'>
                This action cannot be undone. All your privacy preferences, consent records, and
                stored data will be permanently deleted.
              </p>

              <div className='mt-6 flex gap-3'>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className='flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllData}
                  className='flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500'
                >
                  Delete All Data
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacySettingsPage;
