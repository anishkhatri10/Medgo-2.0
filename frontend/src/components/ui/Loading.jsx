import React from 'react';

export const LoadingSpinner = ({ 
  size = 'md',
  color = 'red',
  fullScreen = false,
  message = null
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const colorMap = {
    red: 'text-red-500',
    white: 'text-white',
    primary: 'text-red-500',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <svg 
        className={`animate-spin ${sizeMap[size]} ${colorMap[color]}`}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {message && <p className="text-gray-400 text-sm animate-pulse">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export const LoadingDots = ({ 
  message = 'Loading',
  speed = 'md'
}) => {
  const speedMap = {
    slow: 2,
    md: 1.5,
    fast: 1,
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 bg-red-500 rounded-full"
            style={{
              animation: `bounce ${speedMap[speed]}s infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
      {message && <p className="text-gray-400 text-sm">{message}</p>}
    </div>
  );
};

export const Skeleton = ({ 
  className = '',
  count = 1
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array(count).fill(0).map((_, i) => (
        <div 
          key={i}
          className="h-4 bg-dark-700 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
};
