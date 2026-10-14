import React, { useState } from 'react';

export default function RatingStars({ rating, onRate, size = 'md', showCount = false, count = 0 }) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const currentRating = hoverRating || rating;

  const handleRate = (value) => {
    if (onRate) {
      onRate(value);
    }
  };

  const renderStar = (index) => {
    const value = index + 1;
    const isHalf = currentRating >= value - 0.5 && currentRating < value;
    const isFilled = currentRating >= value;
    const colorClass = (isFilled || isHalf) ? 'text-amber-400' : 'text-gray-300 dark:text-slate-700';

    if (isHalf && !onRate) {
      return (
        <svg key={index} className={`${sizeClasses[size]} text-amber-400`} viewBox="0 0 20 20" fill="currentColor">
          <defs>
            <linearGradient id={`half-${index}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" stopOpacity="1" className="text-gray-300 dark:text-slate-700" />
            </linearGradient>
          </defs>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" fill={`url(#half-${index})`} />
        </svg>
      );
    }

    return (
      <svg 
        key={index} 
        className={`${sizeClasses[size]} ${colorClass} ${onRate ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
        viewBox="0 0 20 20" 
        fill="currentColor"
        onClick={() => handleRate(value)}
        onMouseEnter={() => onRate && setHoverRating(value)}
        onMouseLeave={() => onRate && setHoverRating(0)}
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[0, 1, 2, 3, 4].map(renderStar)}
      </div>
      {showCount && (
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">({count})</span>
      )}
    </div>
  );
}
