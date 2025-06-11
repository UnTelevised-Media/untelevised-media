// src/components/error/ErrorBoundary.tsx
'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError } = this.props;
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Log to Sentry
    Sentry.captureException(error, {
      extra: { errorInfo: errorInfo },
      tags: {
        component: 'ErrorBoundary',
      },
    });

    // Call custom error handler
    onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    const { fallback, children } = this.props;
    const { hasError, error } = this.state;

    if (hasError) {
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent error={error!} retry={this.handleRetry} />;
      }

      return <DefaultErrorFallback error={error!} retry={this.handleRetry} />;
    }

    return children;
  }
}

// Default Error Fallback Component
export const DefaultErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => {
  return (
    <div className='flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8'>
      <div className='rounded-full bg-red-100 p-3 dark:bg-red-900/20'>
        <AlertTriangle className='h-8 w-8 text-red-600 dark:text-red-400' />
      </div>

      <div className='space-y-2 text-center'>
        <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
          Something went wrong
        </h2>
        <p className='max-w-md text-sm text-gray-600 dark:text-gray-400'>
          {process.env.NODE_ENV === 'development'
            ? error.message
            : 'An unexpected error occurred. Please try again.'}
        </p>
      </div>

      <Button onClick={retry} variant='outline' className='mt-4'>
        <RefreshCw className='mr-2 h-4 w-4' />
        Try Again
      </Button>
    </div>
  );
}

// Async Error Boundary Hook
export function useAsyncError() {
  const [, setError] = React.useState();

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}
