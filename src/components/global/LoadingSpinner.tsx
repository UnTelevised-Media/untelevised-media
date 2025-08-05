// src/components/global/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

const LoadingSpinner = ({
  size = 'md',
  text = 'Loading...',
  className = '',
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-3 p-8 ${className}`}
      role='status'
    >
      {/* Enhanced Spinner */}
      <div className='relative'>
        {/* Outer ring */}
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-slate-400 dark:border-slate-600`}
        >
          <div className='absolute inset-0 animate-pulse rounded-full border-2 border-transparent border-r-untele border-t-untele'></div>
        </div>

        {/* Inner pulse */}
        <div
          className={`absolute inset-1 ${sizeClasses[size]} animate-pulse rounded-full bg-untele/20`}
        ></div>

        {/* Center dot */}
        <div className='absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-untele'></div>
      </div>

      {/* Loading Text */}
      <div className='flex items-center space-x-2'>
        <span
          className={`font-medium text-slate-700 dark:text-slate-300 ${textSizeClasses[size]}`}
        >
          {text}
        </span>
        <div className='flex space-x-1'>
          <div
            className='h-1 w-1 animate-bounce rounded-full bg-untele'
            style={{ animationDelay: '0s' }}
          ></div>
          <div
            className='h-1 w-1 animate-bounce rounded-full bg-untele'
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div
            className='h-1 w-1 animate-bounce rounded-full bg-untele'
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>
      </div>

      <span className='sr-only'>{text}</span>
    </div>
  );
};

export default LoadingSpinner;
